// backend/src/controllers/audit.controller.js
import { auditClient } from "../config/supabaseClients.js";

/**
 * Devuelve el historial de búsquedas de pacientes
 * Fuente: tabla busqueda_paciente_auditoria (+ usuario)
 */
export async function getSearchHistory(req, res) {
  try {
    const { q, limit, usuarioId } = req.query;
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

    // 🔐 Filtrar por usuario logeado si viene usuarioId
    if (usuarioId) {
      query = query.eq("usuario_id", usuarioId);
    }

    // (Opcional) filtro por RUT numérico
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

    return res.json(data ?? []);
  } catch (err) {
    console.error("💥 Error inesperado en getSearchHistory:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener historial de búsquedas" });
  }
}
