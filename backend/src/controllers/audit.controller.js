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
 *
 * 👉 Modo normal (sin paginación):
 *    GET /api/auditoria/busquedas?limit=100
 *    → devuelve un array como antes (compatibilidad con dashboard).
 *
 * 👉 Modo paginado (usado por el historial completo):
 *    GET /api/auditoria/busquedas?page=1&pageSize=6&fecha=2025-12-09&resultado=found
 *    → devuelve { items: [...], total: 1234 }
 */
export async function getSearchHistory(req, res) {
  try {
    const {
      q,
      limit,
      usuarioId,
      page,
      pageSize,
      fecha, // YYYY-MM-DD opcional
      resultado, // "found" | "not_found" | ""
    } = req.query;

    // 🔧 Helper para enriquecer con nombre de paciente
    async function enrichHistory(baseHistory) {
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
              item.dv_buscado
            );
          }

          return {
            ...item,
            nombre_paciente: nombrePaciente,
          };
        })
      );

      return enrichedHistory;
    }

    // ──────────────────────────────────────────────
    //  MODO PAGINADO (historial completo)
    // ──────────────────────────────────────────────
    if (page) {
      const pageNumber = Number.parseInt(page, 10) || 1;
      const sizeNumber = Number.parseInt(pageSize || "20", 10);
      const from = (pageNumber - 1) * sizeNumber;
      const to = from + sizeNumber - 1;

      let query = auditClient
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
          { count: "exact" }
        )
        .order("fecha_hora_busqueda", { ascending: false })
        .range(from, to);

      // 🔐 Si viene usuarioId → filtra (no admin)
      if (usuarioId) {
        query = query.eq("usuario_id", usuarioId);
      }

      // Filtro opcional por RUT (q = "11222333-4" ó "112223334")
      if (q) {
        const cleaned = q.replace(/\D/g, "");
        if (cleaned) {
          query = query.ilike("rut_buscado", `%${cleaned}%`);
        }
      }

      // Filtro por fecha (día completo, en base a fecha_hora_busqueda)
      if (fecha) {
        // fecha viene como "YYYY-MM-DD"
        const start = new Date(`${fecha}T00:00:00.000Z`).toISOString();
        const end = new Date(`${fecha}T23:59:59.999Z`).toISOString();
        query = query
          .gte("fecha_hora_busqueda", start)
          .lte("fecha_hora_busqueda", end);
      }

      // Filtro por resultado
      if (resultado === "found") {
        query = query.eq("resultado_encontrado", true);
      } else if (resultado === "not_found") {
        query = query.eq("resultado_encontrado", false);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("❌ Error obteniendo historial de búsquedas (paginado):", error);
        return res
          .status(500)
          .json({ message: "Error al obtener historial de búsquedas" });
      }

      const baseHistory = Array.isArray(data) ? data : [];
      const enrichedHistory = await enrichHistory(baseHistory);

      return res.json({
        items: enrichedHistory,
        total: typeof count === "number" ? count : enrichedHistory.length,
      });
    }

    // ──────────────────────────────────────────────
    //  MODO ORIGINAL (sin paginación) → ARRAY
    //  (usado por el dashboard compacto)
    // ──────────────────────────────────────────────
    const limitNumber = Number.parseInt(limit || "100", 10);

    let query = auditClient
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
      `
      )
      .order("fecha_hora_busqueda", { ascending: false })
      .limit(Number.isNaN(limitNumber) ? 100 : limitNumber);

    // 🔐 Si viene usuarioId → filtra (no admin)
    if (usuarioId) {
      query = query.eq("usuario_id", usuarioId);
    }

    // Filtro opcional por RUT
    if (q) {
      const cleaned = q.replace(/\D/g, "");
      if (cleaned) {
        query = query.ilike("rut_buscado", `%${cleaned}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error obteniendo historial de búsquedas:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener historial de búsquedas" });
    }

    const baseHistory = Array.isArray(data) ? data : [];
    const enrichedHistory = await enrichHistory(baseHistory);

    return res.json(enrichedHistory);
  } catch (err) {
    console.error("💥 Error inesperado en getSearchHistory:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener historial de búsquedas" });
  }
}
