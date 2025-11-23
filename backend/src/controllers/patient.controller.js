// backend/controllers/patient.controller.js
import { coreClient, rayenClient, auditClient } from "../config/supabaseClients.js";

async function safeQuery(label, queryPromise, fallback = []) {
  const { data, error } = await queryPromise;
  if (error) {
    console.error(`❌ Error en consulta ${label}:`, error.message);
    return fallback;
  }
  return data ?? fallback;
}

// Normaliza rut ("17.896.543-5", "178965435", etc.)
function normalizeRut(rawRut) {
  if (!rawRut) return { body: null, dv: null };

  let clean = rawRut.toString().trim().toUpperCase();
  clean = clean.replace(/\./g, "");

  let body = clean;
  let dv = null;

  const dashIndex = clean.indexOf("-");

  if (dashIndex !== -1) {
    body = clean.slice(0, dashIndex);
    dv = clean.slice(dashIndex + 1);
  } else if (clean.length > 1) {
    dv = clean.slice(-1);
    body = clean.slice(0, -1);
  }

  return { body, dv };
}

// 🔎 Registrar búsqueda en tabla busqueda_paciente_auditoria
async function registrarBusquedaPaciente({
  usuarioId,
  rutBuscado,
  dvBuscado,
  sistemaOrigen,
  resultadoEncontrado,
  observacion,
}) {
  try {
    await auditClient.from("busqueda_paciente_auditoria").insert({
      usuario_id: usuarioId || null,
      fecha_hora_busqueda: new Date().toISOString(),
      rut_buscado: rutBuscado || null,
      dv_buscado: dvBuscado || null,
      sistema_origen: sistemaOrigen || "VISOR_WEB",
      resultado_encontrado: resultadoEncontrado ?? false,
      observacion: observacion || null,
    });
  } catch (e) {
    console.error("❌ Error registrando búsqueda en auditoría:", e.message);
    // Igual devolvemos la info al visor, no rompemos el flujo
  }
}

export async function getPatientByRut(req, res) {
  const { rut: rutParam } = req.params;

  // 👤 viene desde el front por query string
  const { usuarioId, usuario_id, sistema_origen } = req.query;
  const usuarioIdFinal = usuarioId || usuario_id || null;
  const sistemaOrigenFinal = sistema_origen || "VISOR_WEB";

  if (!rutParam) {
    return res.status(400).json({ message: "Falta parámetro RUT" });
  }

  const { body: rut, dv } = normalizeRut(rutParam);

  if (!rut) {
    return res.status(400).json({ message: "RUT inválido" });
  }

  try {
    // 1) Buscar paciente en ambas fuentes
    const [
      { data: pacienteApsRaw, error: errorAps },
      { data: pacienteCore, error: errorCore },
    ] = await Promise.all([
      rayenClient
        .from("paciente_aps")
        .select("*")
        .eq("rut", rut)
        .eq("dv", dv)
        .maybeSingle(),
      coreClient
        .from("paciente_core")
        .select("*")
        .eq("rut", rut)
        .eq("dv", dv)
        .maybeSingle(),
    ]);

    if (errorAps) console.error("❌ Error buscando paciente_aps:", errorAps.message);
    if (errorCore) console.error("❌ Error buscando paciente_core:", errorCore.message);

    const resultadoEncontrado = Boolean(pacienteApsRaw || pacienteCore);

    // 📝 Registrar auditoría de la búsqueda (exista o no el paciente)
    await registrarBusquedaPaciente({
      usuarioId: usuarioIdFinal,
      rutBuscado: rut,
      dvBuscado: dv,
      sistemaOrigen: sistemaOrigenFinal,
      resultadoEncontrado,
      observacion: resultadoEncontrado
        ? null
        : "Paciente no encontrado ni en Rayen (APS) ni en CORE (Hospital)",
    });

    if (!pacienteApsRaw && !pacienteCore) {
      return res.status(404).json({
        message: "Paciente no encontrado ni en Rayen (APS) ni en CORE (Hospital)",
      });
    }

    // 2) Enriquecer APS (médico cabecera y sector)
    let pacienteAps = pacienteApsRaw;

    if (pacienteApsRaw) {
      const [medicoRow, sectorRow] = await Promise.all([
        pacienteApsRaw.medico_cabecera_id
          ? safeQuery(
              "profesional_aps",
              rayenClient
                .from("profesional_aps")
                .select("nombre_completo")
                .eq("id", pacienteApsRaw.medico_cabecera_id)
                .maybeSingle(),
              null
            )
          : null,
        pacienteApsRaw.sector_aps_id
          ? safeQuery(
              "sector_aps",
              rayenClient
                .from("sector_aps")
                .select("nombre")
                .eq("id", pacienteApsRaw.sector_aps_id)
                .maybeSingle(),
              null
            )
          : null,
      ]);

      pacienteAps = {
        ...pacienteApsRaw,
        medico_cabecera_nombre: medicoRow?.nombre_completo ?? null,
        sector_aps_nombre: sectorRow?.nombre ?? null,
        sector: sectorRow?.nombre ?? null,
        discapacidad: pacienteApsRaw.situacion_discapacidad ?? null,
      };
    }

    const pacienteApsId = pacienteAps?.id_paciente_aps ?? null;
    const pacienteCoreId = pacienteCore?.id_paciente_core ?? null;

    const consultasPromises = [];

    // ---- APS / RAYEN ----
    if (pacienteApsId) {
      // Atenciones APS con profesional + establecimiento
      consultasPromises.push(
        safeQuery(
          "atencion_aps",
          rayenClient
            .from("atencion_aps")
            .select(
              `
              *,
              profesional_aps (
                nombre_completo,
                tipo_profesional_aps (
                  nombre
                )
              ),
              establecimiento_aps (
                nombre
              )
            `
            )
            .eq("paciente_id", pacienteApsId)
            .order("fecha_atencion", { ascending: false })
        )
      );

      // Derivaciones APS
      consultasPromises.push(
        safeQuery(
          "derivacion_aps",
          rayenClient
            .from("derivacion_aps")
            .select("*")
            .eq("paciente_id", pacienteApsId)
            .order("fecha_derivacion", { ascending: false })
        )
      );
    } else {
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
    }

    // ---- CORE / HOSPITAL ----
    if (pacienteCoreId) {
      // URGENCIAS + profesional
      consultasPromises.push(
        safeQuery(
          "urgencia_hosp",
          coreClient
            .from("urgencia_hosp")
            .select(
              `
              *,
              profesional_hosp (
                nombre_completo
              )
            `
            )
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_ingreso", { ascending: false })
        )
      );

      // CONSULTAS CAE + profesional + especialidad
      consultasPromises.push(
        safeQuery(
          "consulta_cae",
          coreClient
            .from("consulta_cae")
            .select(
              `
              *,
              profesional_hosp (
                nombre_completo
              ),
              especialidad_hosp (
                nombre
              )
            `
            )
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_hora", { ascending: false })
        )
      );

      // HOSPITALIZACIONES + servicio clínico
      consultasPromises.push(
        safeQuery(
          "hospitalizacion",
          coreClient
            .from("hospitalizacion")
            .select(
              `
              *,
              servicio_clinico (
                nombre
              )
            `
            )
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_ingreso", { ascending: false })
        )
      );

      // EXÁMENES LABORATORIO + profesional que valida
      consultasPromises.push(
        safeQuery(
          "examen_laboratorio",
          coreClient
            .from("examen_laboratorio")
            .select(
              `
              *,
              profesional_hosp (
                nombre_completo
              )
            `
            )
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_solicitud", { ascending: false })
        )
      );

      // EXÁMENES IMAGEN + profesional informante
      consultasPromises.push(
        safeQuery(
          "examen_imagen",
          coreClient
            .from("examen_imagen")
            .select(
              `
              *,
              profesional_hosp (
                nombre_completo
              )
            `
            )
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_toma", { ascending: false })
        )
      );

      // MEDICAMENTOS
      consultasPromises.push(
        safeQuery(
          "medicamento_hosp",
          coreClient
            .from("medicamento_hosp")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_inicio", { ascending: false })
        )
      );
    } else {
      // si no hay paciente en CORE rellenamos arreglos vacíos
      consultasPromises.push(Promise.resolve([])); // urgencias
      consultasPromises.push(Promise.resolve([])); // consultas_cae
      consultasPromises.push(Promise.resolve([])); // hospitalizaciones
      consultasPromises.push(Promise.resolve([])); // examen_laboratorio
      consultasPromises.push(Promise.resolve([])); // examen_imagen
      consultasPromises.push(Promise.resolve([])); // medicamentos
    }

    const [
      atencionesApsRaw,
      derivacionesAps,
      urgenciasHospRaw,
      consultasCaeRaw,
      hospitalizacionesRaw,
      examenesLabRaw,
      examenesImgRaw,
      medicamentosHosp,
    ] = await Promise.all(consultasPromises);

    // ---- Enriquecer datos ----

    // Atenciones APS
    const atencionesAps = (atencionesApsRaw || []).map((a) => ({
      ...a,
      profesional_nombre:
        a.profesional_nombre ??
        a.profesional_aps?.nombre_completo ??
        null,
      profesional_tipo:
        a.profesional_tipo ??
        a.profesional_aps?.tipo_profesional_aps?.nombre ??
        null,
      establecimiento_nombre:
        a.establecimiento_nombre ??
        a.establecimiento_aps?.nombre ??
        null,
    }));

    // Urgencias
    const urgenciasHosp = (urgenciasHospRaw || []).map((u) => ({
      ...u,
      profesional_nombre:
        u.profesional_nombre ??
        u.profesional_hosp?.nombre_completo ??
        null,
    }));

    // Consultas CAE
    const consultasCae = (consultasCaeRaw || []).map((c) => ({
      ...c,
      profesional_nombre:
        c.profesional_nombre ??
        c.profesional_hosp?.nombre_completo ??
        null,
      especialidad_nombre:
        c.especialidad_nombre ??
        c.especialidad_hosp?.nombre ??
        null,
    }));

    // Hospitalizaciones
    const hospitalizaciones = (hospitalizacionesRaw || []).map((h) => ({
      ...h,
      servicio_nombre:
        h.servicio_nombre ??
        h.servicio_clinico?.nombre ??
        null,
    }));

    // Exámenes de laboratorio
    const examenesLab = (examenesLabRaw || []).map((e) => ({
      ...e,
      profesional_nombre:
        e.profesional_nombre ??
        e.profesional_hosp?.nombre_completo ??
        null,
    }));

    // Exámenes de imagen
    const examenesImg = (examenesImgRaw || []).map((e) => ({
      ...e,
      profesional_nombre:
        e.profesional_nombre ??
        e.profesional_hosp?.nombre_completo ??
        null,
    }));

    // 3) Respuesta unificada
    return res.json({
      rut: `${rut}-${dv}`,
      fuentes: {
        aps: Boolean(pacienteAps),
        hospital: Boolean(pacienteCore),
      },
      paciente: {
        aps: pacienteAps ?? null,
        core: pacienteCore ?? null,
      },
      aps: {
        atenciones: atencionesAps,
        derivaciones: derivacionesAps,
      },
      core: {
        urgencias: urgenciasHosp,
        consultas_cae: consultasCae,
        hospitalizaciones,
        examenes_laboratorio: examenesLab,
        examenes_imagen: examenesImg,
        medicamentos: medicamentosHosp,
      },
    });
  } catch (err) {
    console.error("💥 Error inesperado en getPatientByRut:", err);
    return res.status(500).json({
      message: "Error interno al consultar datos clínicos del paciente",
    });
  }
}
