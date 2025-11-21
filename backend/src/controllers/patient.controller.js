import { coreClient, rayenClient } from "../config/supabaseClients.js";

async function safeQuery(label, queryPromise, fallback = []) {
  const { data, error } = await queryPromise;
  if (error) {
    console.error(`❌ Error en consulta ${label}:`, error.message);
    return fallback;
  }
  return data ?? fallback;
}

// 🔹 Normaliza rut que venga como "17896543-5", "17.896.543-5", "178965435", "17896543k", etc.
function normalizeRut(rawRut) {
  if (!rawRut) return { body: null, dv: null };

  let clean = rawRut.toString().trim().toUpperCase();
  clean = clean.replace(/\./g, ""); // sacar puntos

  let body = clean;
  let dv = null;

  const dashIndex = clean.indexOf("-");

  if (dashIndex !== -1) {
    body = clean.slice(0, dashIndex);
    dv = clean.slice(dashIndex + 1);
  } else if (clean.length > 1) {
    // si no tiene guion, asumimos último caracter como DV
    dv = clean.slice(-1);
    body = clean.slice(0, -1);
  }

  return { body, dv };
}

export async function getPatientByRut(req, res) {
  const { rut: rutParam } = req.params;

  if (!rutParam) {
    return res.status(400).json({ message: "Falta parámetro RUT" });
  }

  const { body: rut, dv } = normalizeRut(rutParam);

  if (!rut) {
    return res.status(400).json({ message: "RUT inválido" });
  }

  try {
    // 1) Buscar paciente en ambas fuentes en paralelo (rut + dv)
    const [
      { data: pacienteAps, error: errorAps },
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

    if (!pacienteAps && !pacienteCore) {
      return res.status(404).json({
        message: "Paciente no encontrado ni en Rayen (APS) ni en CORE (Hospital)",
      });
    }

    const pacienteApsId = pacienteAps?.id_paciente_aps ?? null;
    const pacienteCoreId = pacienteCore?.id_paciente_core ?? null;

    const consultasPromises = [];

    // ---- RAYEN / APS ----
    if (pacienteApsId) {
      consultasPromises.push(
        safeQuery(
          "atencion_aps",
          rayenClient
            .from("atencion_aps")
            .select("*")
            .eq("paciente_id", pacienteApsId)
            .order("fecha_atencion", { ascending: false })
        )
      );

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
      consultasPromises.push(
        safeQuery(
          "urgencia_hosp",
          coreClient
            .from("urgencia_hosp")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_ingreso", { ascending: false })
        )
      );

      consultasPromises.push(
        safeQuery(
          "consulta_cae",
          coreClient
            .from("consulta_cae")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_hora", { ascending: false })
        )
      );

      consultasPromises.push(
        safeQuery(
          "hospitalizacion",
          coreClient
            .from("hospitalizacion")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_ingreso", { ascending: false })
        )
      );

      consultasPromises.push(
        safeQuery(
          "examen_laboratorio",
          coreClient
            .from("examen_laboratorio")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_solicitud", { ascending: false })
        )
      );

      consultasPromises.push(
        safeQuery(
          "examen_imagen",
          coreClient
            .from("examen_imagen")
            .select("*")
            .eq("paciente_id", pacienteCoreId)
            .order("fecha_toma", { ascending: false })
        )
      );

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
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
      consultasPromises.push(Promise.resolve([]));
    }

    const [
      atencionesAps,
      derivacionesAps,
      urgenciasHosp,
      consultasCae,
      hospitalizaciones,
      examenesLab,
      examenesImg,
      medicamentosHosp,
    ] = await Promise.all(consultasPromises);

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