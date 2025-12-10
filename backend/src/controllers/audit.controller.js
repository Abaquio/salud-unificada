// backend/src/controllers/audit.controller.js
import {
  auditClient,
  rayenClient,
  coreClient,
} from "../config/supabaseClients.js";

/**
 * Devuelve el historial de búsquedas de pacientes
 * Fuente: tabla busqueda_paciente_auditoria (+ usuario).
 *
 * Además, enriquece cada registro con el nombre del paciente
 * buscándolo en RAYEN (paciente_aps) y CORE (paciente_core)
 * según el RUT/DV. Este campo se expone como `nombre_paciente`
 * pero NO se almacena en la tabla de auditoría.
 */
export async function getSearchHistory(req, res) {
  try {
    const { q, limit, usuarioId } = req.query;

    // límite total opcional (por si algún día lo quieres usar),
    // 0 = sin límite (trae todo lo que haya)
    const limitTotal = Number.parseInt(limit || "0", 10);
    const CHUNK_SIZE = 1000; // máximo por request en Supabase

    // 1) Query base (sin rango todavía)
    let baseQuery = auditClient
      .from("busqueda_paciente_auditoria")
      .select(
        `
        id_busqueda,
        fecha_hora_busqueda,
        rut_buscado,
        dv_buscado,
        sistema_origen,
        resultado_encontrado,
        observacion,
        usuario:usuario_id (
          id_usuario,
          nombre_completo,
          rut,
          dv
        )
      `,
      )
      .order("fecha_hora_busqueda", { ascending: false });

    // 🔐 Si viene usuarioId → filtra (no admin)
    if (usuarioId) {
      baseQuery = baseQuery.eq("usuario_id", usuarioId);
    }

    // Filtro opcional por RUT
    if (q) {
      const cleaned = q.replace(/\D/g, "");
      if (cleaned) {
        baseQuery = baseQuery.ilike("rut_buscado", `%${cleaned}%`);
      }
    }

    // 2) Traer TODAS las filas en chunks de 1000
    const allRows = [];
    let from = 0;

    while (true) {
      // hasta dónde traemos en este chunk
      let to = from + CHUNK_SIZE - 1;

      // si hay limitTotal, no pasarnos de ese tope
      if (limitTotal && to >= limitTotal) {
        to = limitTotal - 1;
      }

      const { data, error } = await baseQuery.range(from, to);

      if (error) {
        console.error("❌ Error obteniendo historial de búsquedas:", error);
        return res
          .status(500)
          .json({ message: "Error al obtener historial de búsquedas" });
      }

      if (!data || data.length === 0) {
        // no hay más filas
        break;
      }

      allRows.push(...data);

      // si ya llegamos al límite deseado → cortamos
      if (limitTotal && allRows.length >= limitTotal) {
        break;
      }

      // si en este chunk vinieron menos de CHUNK_SIZE,
      // significa que ya no hay más filas
      if (data.length < CHUNK_SIZE) {
        break;
      }

      // siguiente bloque
      from += CHUNK_SIZE;
    }

    const baseHistory = Array.isArray(allRows) ? allRows : [];

    // 🧠 Helper para obtener el nombre del paciente desde Rayen/Core
    async function resolvePatientName(rutBuscado, dvBuscado) {
      if (!rutBuscado) return null;

      // 1) Intentar en RAYEN (paciente_aps)
      try {
        const { data: apsPac, error: apsError } = await rayenClient
          .from("paciente_aps")
          .select("nombre_completo")
          .eq("rut", rutBuscado)
          .eq("dv", dvBuscado || null)
          .maybeSingle();

        if (!apsError && apsPac?.nombre_completo) {
          return apsPac.nombre_completo;
        }
      } catch (e) {
        console.error("Error buscando nombre en paciente_aps:", e);
      }

      // 2) Intentar en CORE (paciente_core)
      try {
        const { data: corePac, error: coreError } = await coreClient
          .from("paciente_core")
          .select("nombre_completo")
          .eq("rut", rutBuscado)
          .eq("dv", dvBuscado || null)
          .maybeSingle();

        if (!coreError && corePac?.nombre_completo) {
          return corePac.nombre_completo;
        }
      } catch (e) {
        console.error("Error buscando nombre en paciente_core:", e);
      }

      return null;
    }

    // Enriquecer cada registro con nombre_paciente (sin tocar la BD)
    const enrichedHistory = await Promise.all(
      baseHistory.map(async (item) => {
        let nombrePaciente = null;

        if (item.resultado_encontrado) {
          nombrePaciente = await resolvePatientName(
            item.rut_buscado,
            item.dv_buscado,
          );
        }

        return {
          ...item,
          nombre_paciente: nombrePaciente,
        };
      }),
    );

    return res.json(enrichedHistory);
  } catch (err) {
    console.error("💥 Error inesperado en getSearchHistory:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener historial de búsquedas" });
  }
}
