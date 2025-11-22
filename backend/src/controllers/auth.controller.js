// backend/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { auditClient } from "../config/supabaseClients.js";

const LOGIN_TABLE = "login_auditoria";
const USER_TABLE = "usuario";

/**
 * Registra intento de login en la tabla login_auditoria
 */
async function registrarLogin({ usuarioId, exitoso, req, detalle }) {
  try {
    const ip_origen =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;

    const user_agent = req.headers["user-agent"] || null;

    await auditClient.from(LOGIN_TABLE).insert({
      usuario_id: usuarioId || null,
      exitoso,
      ip_origen,
      user_agent,
      detalle_error: detalle || null,
    });
  } catch (e) {
    console.error("Error registrando login en auditoría:", e.message);
    // No rompemos el flujo de login por un error de auditoría
  }
}

/**
 * POST /api/auth/login
 * Body:
 *   { "rutOrEmail": "21409625-0" | "abaquio@saludunificada.cl", "password": "Abaquio2025!" }
 */
export async function login(req, res) {
  try {
    const { rutOrEmail, password } = req.body || {};

    if (!rutOrEmail || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan credenciales" });
    }

    // Detectamos si viene un RUT o un correo
    const cleaned = String(rutOrEmail).replace(/\./g, "").replace(/\s/g, "");
    const isRutLike = cleaned.includes("-");

    let query = auditClient
      .from(USER_TABLE)
      .select(
        `
        id_usuario,
        nombre_completo,
        correo,
        rut,
        dv,
        telefono,
        direccion,
        password_hash,
        es_activo,
        created_at,
        updated_at,
        rol:rol_id (
          id,
          nombre
        )
        `
      ) // :contentReference[oaicite:0]{index=0}
      .eq("es_activo", true);

    if (isRutLike) {
      const [rutNumRaw, dvRaw] = cleaned.split("-");
      const rutNum = rutNumRaw.replace(/\D/g, ""); // por si acaso
      const dv = dvRaw?.toUpperCase();

      query = query.eq("rut", rutNum).eq("dv", dv);
    } else {
      // Tratamos como correo
      query = query.ilike("correo", rutOrEmail);
    }

    const { data: user, error } = await query.single();

    if (error && error.code !== "PGRST116") {
      console.error("Error Supabase usuario:", error);
      await registrarLogin({
        usuarioId: null,
        exitoso: false,
        req,
        detalle: `Error Supabase: ${error.message}`,
      });
      return res
        .status(500)
        .json({ ok: false, message: "Error al validar usuario" });
    }

    if (!user || !user.password_hash) {
      await registrarLogin({
        usuarioId: user?.id_usuario,
        exitoso: false,
        req,
        detalle: "Usuario no encontrado o sin password_hash",
      });
      return res
        .status(401)
        .json({ ok: false, message: "Usuario o contraseña incorrectos" });
    }

    // Validar contraseña
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      await registrarLogin({
        usuarioId: user.id_usuario,
        exitoso: false,
        req,
        detalle: "Password incorrecta",
      });
      return res
        .status(401)
        .json({ ok: false, message: "Usuario o contraseña incorrectos" });
    }

    // Login OK → registramos en auditoría
    await registrarLogin({
      usuarioId: user.id_usuario,
      exitoso: true,
      req,
      detalle: null,
    });

    // Devolvemos datos limpios al frontend, con alias en camelCase y snake_case
    return res.json({
      ok: true,
      user: {
        id: user.id_usuario,
        nombre: user.nombre_completo,
        nombre_completo: user.nombre_completo,

        // correo / email
        correo: user.correo,
        email: user.correo,

        rut: `${user.rut}-${user.dv}`,

        // rol
        rol: user.rol?.nombre || null,
        role: user.rol?.nombre || null,
        rol_id: user.rol?.id ?? null,

        // contacto
        telefono: user.telefono || null,
        phone: user.telefono || null,
        direccion: user.direccion || null,
        address: user.direccion || null,

        // estado
        es_activo: user.es_activo,
        isActive: user.es_activo,

        // fechas
        created_at: user.created_at,
        createdAt: user.created_at,
        updated_at: user.updated_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err) {
    console.error("Error inesperado en login:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al procesar el login" });
  }
}
