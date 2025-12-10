// backend/src/controllers/dashboard.controller.js
import { auditClient, rayenClient, coreClient } from "../config/supabaseClients.js";

// Helper seguro para consultas Supabase simples
async function safeQuery(label, queryPromise, fallback = []) {
  const { data, error } = await queryPromise;
  if (error) {
    console.error(`❌ Error en consulta ${label}:`, error.message || error);
    return fallback;
  }
  return data ?? fallback;
}

/**
 * Cuenta búsquedas en un rango [fromISO, toISO)
 * sin traer filas (solo count).
 */
async function countSearchesInRange(fromISO, toISO) {
  const { count, error } = await auditClient
    .from("busqueda_paciente_auditoria")
    .select("id_busqueda", { count: "exact", head: true })
    .gte("fecha_hora_busqueda", fromISO)
    .lt("fecha_hora_busqueda", toISO);

  if (error) {
    console.error("❌ Error contando búsquedas:", error.message || error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Helper para superar el límite de 1000 filas por consulta de Supabase.
 * Hace consultas por "páginas" usando .range().
 *
 * - label: texto para logs
 * - select: string con la selección
 * - fromISO: fecha mínima (gte)
 * - toISO: fecha máxima (lt)
 */
async function fetchAllSearchRows({ label, select, fromISO, toISO }) {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 10; // seguridad: hasta 10k filas

  let page = 0;
  let allRows = [];

  while (page < MAX_PAGES) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = auditClient
      .from("busqueda_paciente_auditoria")
      .select(select)
      .gte("fecha_hora_busqueda", fromISO)
      .order("fecha_hora_busqueda", { ascending: false })
      .range(from, to);

    if (toISO) {
      query = query.lt("fecha_hora_busqueda", toISO);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        `❌ Error en consulta paginada ${label} (page ${page}):`,
        error.message || error
      );
      break;
    }

    const chunk = data ?? [];
    allRows = allRows.concat(chunk);

    if (chunk.length < PAGE_SIZE) break; // no hay más páginas
    page += 1;
  }

  return allRows;
}

/**
 * Calcula el período según query:
 *  - view: "month" | "year"
 *  - year: YYYY
 *  - month: 1-12 (solo para vista mensual)
 */
function getPeriodFromQuery(req) {
  const { view, year, month } = req.query;
  const now = new Date();

  const periodType = view === "year" ? "year" : "month";

  let targetYear = Number.parseInt(year, 10);
  if (Number.isNaN(targetYear)) {
    targetYear = now.getFullYear();
  }

  let start;     // inicio período actual
  let end;       // fin período actual (exclusivo)
  let lastStart; // inicio período anterior
  let lastEnd;   // fin período anterior (exclusivo)
  let monthIndex = null; // 0-11 si es mensual

  if (periodType === "year") {
    // Período anual
    start = new Date(targetYear, 0, 1);
    end = new Date(targetYear + 1, 0, 1);
    lastStart = new Date(targetYear - 1, 0, 1);
    lastEnd = start;
  } else {
    // Período mensual
    let m = Number.parseInt(month, 10);
    if (Number.isNaN(m) || m < 1 || m > 12) {
      m = now.getMonth() + 1; // mes actual si no viene
    }
    monthIndex = m - 1;

    start = new Date(targetYear, monthIndex, 1);
    end = new Date(targetYear, monthIndex + 1, 1);

    if (monthIndex === 0) {
      lastStart = new Date(targetYear - 1, 11, 1); // diciembre año anterior
    } else {
      lastStart = new Date(targetYear, monthIndex - 1, 1);
    }
    lastEnd = start;
  }

  return {
    periodType, // "month" | "year"
    start,
    end,
    lastStart,
    lastEnd,
    year: targetYear,
    monthIndex, // null si es anual
  };
}

/**
 * Dashboard compacto (home)
 * - Por compatibilidad, sigue usando "searchesThisMonth" y "searchesLastMonth"
 *   pero ahora respeta opcionalmente ?view=month|year&year=YYYY&month=MM
 */
export async function getDashboardSummary(req, res) {
  try {
    const { periodType, start, end, lastStart, lastEnd } = getPeriodFromQuery(
      req
    );
    const fromISO = start.toISOString();
    const toISO = end.toISOString();
    const lastFromISO = lastStart.toISOString();
    const lastToISO = lastEnd.toISOString();

    const [searchesThisMonth, searchesLastMonth] = await Promise.all([
      countSearchesInRange(fromISO, toISO),
      countSearchesInRange(lastFromISO, lastToISO),
    ]);

    // Solo traemos filas del período actual para topUser / roles
    const thisPeriodRows = await fetchAllSearchRows({
      label: "busqueda_paciente_auditoria (summary, periodo actual)",
      select: `
        id_busqueda,
        fecha_hora_busqueda,
        usuario_id,
        usuario:usuario_id (
          id_usuario,
          nombre_completo,
          rol_id
        )
      `,
      fromISO,
      toISO,
    });

    const roleIdsSet = new Set(
      thisPeriodRows
        .map((r) => r.usuario?.rol_id)
        .filter((id) => typeof id === "number")
    );

    let roles = [];
    if (roleIdsSet.size > 0) {
      roles = await safeQuery(
        "rol (summary)",
        auditClient
          .from("rol")
          .select("id, nombre")
          .in("id", Array.from(roleIdsSet)),
        []
      );
    }
    const roleById = new Map(roles.map((r) => [r.id, r.nombre]));

    const userCounts = new Map();
    const roleCounts = new Map();

    for (const row of thisPeriodRows) {
      const user = row.usuario;
      if (!user) continue;

      const roleName = user.rol_id
        ? roleById.get(user.rol_id) || "Sin rol"
        : "Sin rol";

      const prevUser = userCounts.get(user.id_usuario) || {
        id: user.id_usuario,
        name: user.nombre_completo,
        role: roleName,
        searches: 0,
      };
      prevUser.searches += 1;
      prevUser.role = roleName;
      userCounts.set(user.id_usuario, prevUser);

      const prevRole = roleCounts.get(roleName) || { role: roleName, count: 0 };
      prevRole.count += 1;
      roleCounts.set(roleName, prevRole);
    }

    let topUser = null;
    for (const v of userCounts.values()) {
      if (!topUser || v.searches > topUser.searches) topUser = v;
    }

    const searchesByRole = Array.from(roleCounts.values());
    let topRole = null;
    for (const v of searchesByRole.values()) {
      if (!topRole || v.count > topRole.count) topRole = v;
    }

    const totalRoleSearches = thisPeriodRows.length || 1;
    const topRolePayload = topRole
      ? {
          name: topRole.role,
          searches: topRole.count,
          percentage: Number(
            ((topRole.count / totalRoleSearches) * 100).toFixed(1)
          ),
        }
      : null;

    return res.json({
      periodType, // "month" | "year"
      searchesThisMonth,
      searchesLastMonth,
      topUser: topUser || null,
      topRole: topRolePayload,
      searchesByRole,
    });
  } catch (err) {
    console.error("💥 Error inesperado en getDashboardSummary:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener resumen de dashboard" });
  }
}

/**
 * Dashboard completo (modal de "Ver más")
 * Respeta ?view=month|year&year=YYYY&month=MM
 */
export async function getDashboardFull(req, res) {
  try {
    const { periodType, start, end, lastStart, lastEnd } = getPeriodFromQuery(
      req
    );
    const fromISO = start.toISOString();
    const toISO = end.toISOString();
    const lastFromISO = lastStart.toISOString();
    const lastToISO = lastEnd.toISOString();

    // 1) Contadores rápidos
    const [searchesThisMonth, searchesLastMonth] = await Promise.all([
      countSearchesInRange(fromISO, toISO),
      countSearchesInRange(lastFromISO, lastToISO),
    ]);

    // 2) Filas del PERÍODO ACTUAL
    const thisPeriodRows = await fetchAllSearchRows({
      label: "busqueda_paciente_auditoria (full, periodo actual)",
      select: `
        id_busqueda,
        fecha_hora_busqueda,
        usuario_id,
        rut_buscado,
        dv_buscado,
        sistema_origen,
        usuario:usuario_id (
          id_usuario,
          nombre_completo,
          rol_id
        )
      `,
      fromISO,
      toISO,
    });

    // Roles reales
    const roleIdsSet = new Set(
      thisPeriodRows
        .map((r) => r.usuario?.rol_id)
        .filter((id) => typeof id === "number")
    );

    let roles = [];
    if (roleIdsSet.size > 0) {
      roles = await safeQuery(
        "rol (full)",
        auditClient
          .from("rol")
          .select("id, nombre")
          .in("id", Array.from(roleIdsSet)),
        []
      );
    }
    const roleById = new Map(roles.map((r) => [r.id, r.nombre]));

    // --- Agrupaciones por usuario / rol / día / semana / origen ---
    const userCounts = new Map();
    const roleCounts = new Map();
    const searchesByDayMap = new Map(); // bucket -> count
    const searchesByWeekMap = new Map(); // solo para vista mensual
    const searchesByOriginMap = new Map(); // sistema_origen -> count

    for (const row of thisPeriodRows) {
      const user = row.usuario;
      const d = new Date(row.fecha_hora_busqueda);

      if (user) {
        const roleName = user.rol_id
          ? roleById.get(user.rol_id) || "Sin rol"
          : "Sin rol";

        const prevUser = userCounts.get(user.id_usuario) || {
          id: user.id_usuario,
          name: user.nombre_completo,
          role: roleName,
          searches: 0,
        };
        prevUser.searches += 1;
        prevUser.role = roleName;
        userCounts.set(user.id_usuario, prevUser);

        const prevRole = roleCounts.get(roleName) || {
          role: roleName,
          count: 0,
        };
        prevRole.count += 1;
        roleCounts.set(roleName, prevRole);
      }

      // bucket de "día" según tipo de período
      let bucket;
      if (periodType === "year") {
        // 1..12 → meses
        bucket = d.getMonth() + 1;
      } else {
        // 1..31 → día del mes
        bucket = d.getDate();
      }

      searchesByDayMap.set(bucket, (searchesByDayMap.get(bucket) || 0) + 1);

      // semanas solo tiene sentido en vista mensual
      if (periodType === "month") {
        const dayOfMonth = d.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7) + 1;
        const weekLabel = `Sem ${weekIndex}`;
        searchesByWeekMap.set(
          weekLabel,
          (searchesByWeekMap.get(weekLabel) || 0) + 1
        );
      }

      const origin = row.sistema_origen || "DESCONOCIDO";
      searchesByOriginMap.set(
        origin,
        (searchesByOriginMap.get(origin) || 0) + 1
      );
    }

    let topUser = null;
    for (const v of userCounts.values()) {
      if (!topUser || v.searches > topUser.searches) topUser = v;
    }

    const searchesByRole = Array.from(roleCounts.values());
    let topRole = null;
    for (const v of searchesByRole.values()) {
      if (!topRole || v.count > topRole.count) topRole = v;
    }

    const totalRoleSearches = thisPeriodRows.length || 1;
    const topRolePayload = topRole
      ? {
          name: topRole.role,
          searches: topRole.count,
          percentage: Number(
            ((topRole.count / totalRoleSearches) * 100).toFixed(1)
          ),
        }
      : null;

    const searchesByDay = Array.from(searchesByDayMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bucket, searches]) => ({ day: bucket, searches }));

    const searchesByWeek =
      periodType === "month"
        ? Array.from(searchesByWeekMap.entries())
            .sort((a, b) => {
              const na = parseInt(a[0].replace(/\D/g, ""), 10);
              const nb = parseInt(b[0].replace(/\D/g, ""), 10);
              return na - nb;
            })
            .map(([week, searches]) => ({ week, searches }))
        : [];

    const searchesByOrigin = Array.from(searchesByOriginMap.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);

    // 3) TOP LOGIN (login_auditoria) en el mismo período
    const loginRows = await safeQuery(
      "login_auditoria (full)",
      auditClient
        .from("login_auditoria")
        .select(
          `
          usuario_id,
          fecha_hora_login,
          exitoso,
          usuario:usuario_id (
            id_usuario,
            nombre_completo,
            rol_id
          )
        `
        )
        .gte("fecha_hora_login", fromISO)
        .lt("fecha_hora_login", toISO)
        .eq("exitoso", true),
      []
    );

    const extraRoleIds = new Set(
      loginRows
        .map((r) => r.usuario?.rol_id)
        .filter((id) => typeof id === "number" && !roleById.has(id))
    );
    if (extraRoleIds.size > 0) {
      const extraRoles = await safeQuery(
        "rol (full extra for login)",
        auditClient
          .from("rol")
          .select("id, nombre")
          .in("id", Array.from(extraRoleIds)),
        []
      );
      for (const r of extraRoles) {
        roleById.set(r.id, r.nombre);
      }
    }

    const loginCounts = new Map();
    for (const row of loginRows) {
      const user = row.usuario;
      if (!user) continue;
      const roleName = user.rol_id
        ? roleById.get(user.rol_id) || "Sin rol"
        : "Sin rol";

      const prev = loginCounts.get(user.id_usuario) || {
        id: user.id_usuario,
        name: user.nombre_completo,
        role: roleName,
        logins: 0,
      };
      prev.logins += 1;
      prev.role = roleName;
      loginCounts.set(user.id_usuario, prev);
    }

    const topLoginUsers = Array.from(loginCounts.values())
      .sort((a, b) => b.logins - a.logins)
      .slice(0, 5);

    // 4) DISTRIBUCIÓN GEOGRÁFICA
    const thisPeriodRuts = thisPeriodRows
      .map((r) => (r.rut_buscado ? r.rut_buscado.trim() : null))
      .filter(Boolean);

    const uniqueRuts = Array.from(new Set(thisPeriodRuts));

    let pacientesAps = [];
    let pacientesCore = [];

    if (uniqueRuts.length > 0) {
      pacientesAps = await safeQuery(
        "paciente_aps (dashboard full)",
        rayenClient
          .from("paciente_aps")
          .select("rut, dv, nombre_completo, sector_aps_id")
          .in("rut", uniqueRuts),
        []
      );

      pacientesCore = await safeQuery(
        "paciente_core (dashboard full)",
        coreClient
          .from("paciente_core")
          .select("rut, dv, nombre_completo, establecimiento_id")
          .in("rut", uniqueRuts),
        []
      );
    }

    const sectorIds = new Set(
      pacientesAps
        .map((p) => p.sector_aps_id)
        .filter((id) => typeof id === "number")
    );
    const estIds = new Set(
      pacientesCore
        .map((p) => p.establecimiento_id)
        .filter((id) => typeof id === "number")
    );

    let sectores = [];
    let establecimientos = [];

    if (sectorIds.size > 0) {
      sectores = await safeQuery(
        "sector_aps (dashboard full)",
        rayenClient
          .from("sector_aps")
          .select("id, nombre")
          .in("id", Array.from(sectorIds)),
        []
      );
    }

    if (estIds.size > 0) {
      establecimientos = await safeQuery(
        "establecimiento_hosp (dashboard full)",
        coreClient
          .from("establecimiento_hosp")
          .select("id, nombre")
          .in("id", Array.from(estIds)),
        []
      );
    }

    const sectorById = new Map(sectores.map((s) => [s.id, s.nombre]));
    const estById = new Map(establecimientos.map((e) => [e.id, e.nombre]));

    const zoneByRut = new Map();

    for (const p of pacientesAps) {
      if (!p.rut) continue;
      const zone =
        sectorById.get(p.sector_aps_id) || "Sector APS no definido";
      zoneByRut.set(p.rut, zone);
    }

    for (const p of pacientesCore) {
      if (!p.rut) continue;
      if (!zoneByRut.has(p.rut)) {
        const zone =
          estById.get(p.establecimiento_id) || "Hospital sin ubicación";
        zoneByRut.set(p.rut, zone);
      }
    }

    const zoneCounts = new Map();
    for (const row of thisPeriodRows) {
      const rut = row.rut_buscado ? row.rut_buscado.trim() : null;
      if (!rut) continue;
      const zone = zoneByRut.get(rut) || "Zona desconocida";
      zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    }

    const searchesByZone = Array.from(zoneCounts.entries())
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);

    // Respuesta final
    return res.json({
      periodType, // "month" | "year"
      searchesThisMonth,
      searchesLastMonth,
      topUser: topUser || null,
      topRole: topRolePayload,
      searchesByRole,
      searchesByDay,
      searchesByWeek,
      searchesByOrigin,
      topLoginUsers,
      searchesByZone,
    });
  } catch (err) {
    console.error("💥 Error inesperado en getDashboardFull:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener estadísticas completas" });
  }
}
