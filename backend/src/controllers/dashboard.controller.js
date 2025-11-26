// backend/src/controllers/dashboard.controller.js
import { auditClient, rayenClient, coreClient } from "../config/supabaseClients.js";

// Helper seguro para consultas Supabase
async function safeQuery(label, queryPromise, fallback = []) {
  const { data, error } = await queryPromise;
  if (error) {
    console.error(`❌ Error en consulta ${label}:`, error.message || error);
    return fallback;
  }
  return data ?? fallback;
}

function getMonthBounds(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const next = new Date(y, m + 1, 1);
  const prevStart = new Date(y, m - 1, 1);
  return { thisStart: start, nextStart: next, lastStart: prevStart };
}

/**
 * Dashboard compacto (home)
 */
export async function getDashboardSummary(req, res) {
  try {
    const { thisStart, lastStart } = getMonthBounds(new Date());
    const fromISO = lastStart.toISOString();

    const searchRows = await safeQuery(
      "busqueda_paciente_auditoria (summary)",
      auditClient
        .from("busqueda_paciente_auditoria")
        .select(
          `
          id_busqueda,
          fecha_hora_busqueda,
          usuario_id,
          rut_buscado,
          dv_buscado,
          usuario:usuario_id (
            id_usuario,
            nombre_completo,
            rol_id
          )
        `
        )
        .gte("fecha_hora_busqueda", fromISO)
        .order("fecha_hora_busqueda", { ascending: false }),
      []
    );

    const thisMonthRows = [];
    const lastMonthRows = [];

    for (const row of searchRows) {
      const d = new Date(row.fecha_hora_busqueda);
      if (d >= thisStart) thisMonthRows.push(row);
      else if (d >= lastStart && d < thisStart) lastMonthRows.push(row);
    }

    const searchesThisMonth = thisMonthRows.length;
    const searchesLastMonth = lastMonthRows.length;

    // Roles reales
    const roleIdsSet = new Set(
      thisMonthRows
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

    for (const row of thisMonthRows) {
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

    const totalRoleSearches = thisMonthRows.length || 1;
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
 */
export async function getDashboardFull(req, res) {
  try {
    const now = new Date();
    const { thisStart, nextStart, lastStart } = getMonthBounds(now);

    // -----------------------------------------
    // 1) BÚSQUEDAS (AUDITORÍA)
    // -----------------------------------------
    const searchRows = await safeQuery(
      "busqueda_paciente_auditoria (full)",
      auditClient
        .from("busqueda_paciente_auditoria")
        .select(
          `
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
        `
        )
        .gte("fecha_hora_busqueda", lastStart.toISOString())
        .order("fecha_hora_busqueda", { ascending: false }),
      []
    );

    const thisMonthRows = [];
    const lastMonthRows = [];

    for (const row of searchRows) {
      const d = new Date(row.fecha_hora_busqueda);
      if (d >= thisStart) thisMonthRows.push(row);
      else if (d >= lastStart && d < thisStart) lastMonthRows.push(row);
    }

    const searchesThisMonth = thisMonthRows.length;
    const searchesLastMonth = lastMonthRows.length;

    // Roles reales
    const roleIdsSet = new Set(
      thisMonthRows
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
    const searchesByDayMap = new Map(); // day -> count
    const searchesByWeekMap = new Map(); // weekLabel -> count
    const searchesByOriginMap = new Map(); // sistema_origen -> count

    for (const row of thisMonthRows) {
      const user = row.usuario;
      const d = new Date(row.fecha_hora_busqueda);
      const day = d.getDate();

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

      // día
      searchesByDayMap.set(day, (searchesByDayMap.get(day) || 0) + 1);

      // semana del mes
      const weekIndex = Math.floor((day - 1) / 7) + 1;
      const weekLabel = `Sem ${weekIndex}`;
      searchesByWeekMap.set(
        weekLabel,
        (searchesByWeekMap.get(weekLabel) || 0) + 1
      );

      // sistema de origen (RAYEN / CORE / UNIFICADO)
      const origin =
        (row.sistema_origen || "Sin origen").trim().toUpperCase() || "SIN ORIGEN";
      searchesByOriginMap.set(origin, (searchesByOriginMap.get(origin) || 0) + 1);
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

    const totalRoleSearches = thisMonthRows.length || 1;
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
      .map(([day, searches]) => ({ day, searches }));

    const searchesByWeek = Array.from(searchesByWeekMap.entries())
      .sort((a, b) => {
        const na = parseInt(a[0].replace(/\D/g, ""), 10);
        const nb = parseInt(b[0].replace(/\D/g, ""), 10);
        return na - nb;
      })
      .map(([week, searches]) => ({ week, searches }));

    const searchesByOrigin = Array.from(searchesByOriginMap.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);

    // -----------------------------------------
    // 2) TOP LOGIN (login_auditoria)
    // -----------------------------------------
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
        .gte("fecha_hora_login", thisStart.toISOString())
        .eq("exitoso", true),
      []
    );

    // Puede haber roles que no estaban en búsquedas, los agregamos
    const extraRoleIds = new Set(
      loginRows
        .map((r) => r.usuario?.rol_id)
        .filter(
          (id) => typeof id === "number" && !roleById.has(id)
        )
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

    // -----------------------------------------
    // 3) DISTRIBUCIÓN GEOGRÁFICA (zona / sector)
    // -----------------------------------------
    const thisMonthRuts = thisMonthRows
      .map((r) => (r.rut_buscado ? r.rut_buscado.trim() : null))
      .filter(Boolean);

    const uniqueRuts = Array.from(new Set(thisMonthRuts));

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

    // rut -> zona
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

    // Conteo por zona: usamos TODAS las búsquedas del mes (no solo RUT único)
    const zoneCounts = new Map();
    for (const row of thisMonthRows) {
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
