// backend/src/controllers/user.controller.js
import { auditClient } from "../config/supabaseClients.js";
import bcrypt from "bcryptjs"; // o "bcrypt" si ya usas ese en auth.controller

const USER_TABLE = "usuario";
const ROLE_TABLE = "rol";

function mapUserRow(u) {
  return {
    id: u.id_usuario,
    nombre: u.nombre_completo,
    nombre_completo: u.nombre_completo,
    correo: u.correo,
    email: u.correo,
    rutNumero: u.rut,
    dv: u.dv,
    rut: `${u.rut}-${u.dv}`,
    telefono: u.telefono,
    phone: u.telefono,
    rol: u.rol?.nombre || null,
    rol_id: u.rol?.id ?? null,
    es_activo: u.es_activo,
    isActive: u.es_activo,
    created_at: u.created_at,
    createdAt: u.created_at,
  };
}

// GET /api/users
export async function listUsers(req, res) {
  try {
    const { data, error } = await auditClient
      .from(USER_TABLE)
      .select(
        `
        id_usuario,
        nombre_completo,
        correo,
        rut,
        dv,
        telefono,
        es_activo,
        created_at,
        rol:rol_id (
          id,
          nombre
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listando usuarios:", error);
      return res
        .status(500)
        .json({ ok: false, message: "Error al obtener usuarios" });
    }

    const users = (data || []).map(mapUserRow);
    return res.json({ ok: true, users });
  } catch (err) {
    console.error("Error inesperado en listUsers:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al obtener usuarios" });
  }
}

// PATCH /api/users/:id/status
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { es_activo } = req.body;

    if (typeof es_activo !== "boolean") {
      return res
        .status(400)
        .json({ ok: false, message: "es_activo debe ser boolean" });
    }

    const { data, error } = await auditClient
      .from(USER_TABLE)
      .update({ es_activo })
      .eq("id_usuario", id)
      .select(
        `
        id_usuario,
        nombre_completo,
        correo,
        rut,
        dv,
        telefono,
        es_activo,
        created_at,
        rol:rol_id (
          id,
          nombre
        )
      `
      )
      .single();

    if (error) {
      console.error("Error actualizando usuario:", error);
      return res
        .status(500)
        .json({ ok: false, message: "Error al actualizar usuario" });
    }

    const user = mapUserRow(data);
    return res.json({ ok: true, user });
  } catch (err) {
    console.error("Error inesperado en updateUserStatus:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al actualizar usuario" });
  }
}

// POST /api/users
export async function createUser(req, res) {
  try {
    const {
      nombre_completo,
      correo,
      rut_completo, // "21409625-0"
      rol_nombre,
      telefono,
      direccion,
      es_activo = true,
      provisional_password, // contraseña provisoria en texto plano
    } = req.body || {};

    if (!nombre_completo || !correo || !rut_completo || !rol_nombre) {
      return res.status(400).json({
        ok: false,
        message:
          "nombre_completo, correo, rut_completo y rol_nombre son obligatorios",
      });
    }

    if (!provisional_password || provisional_password.length < 8) {
      return res.status(400).json({
        ok: false,
        message:
          "La contraseña provisoria es obligatoria y debe tener al menos 8 caracteres",
      });
    }

    const [rutNumero, dvRaw] = String(rut_completo).split("-");
    if (!rutNumero || !dvRaw) {
      return res
        .status(400)
        .json({ ok: false, message: "rut_completo inválido" });
    }
    const dv = dvRaw.toUpperCase();

    // Buscar rol_id por nombre
    const { data: rolData, error: rolError } = await auditClient
      .from(ROLE_TABLE)
      .select("id, nombre")
      .eq("nombre", rol_nombre)
      .single();

    if (rolError || !rolData) {
      console.error("Error buscando rol:", rolError);
      return res
        .status(400)
        .json({ ok: false, message: "Rol no válido o no encontrado" });
    }

    // Hashear contraseña provisoria
    const password_hash = await bcrypt.hash(provisional_password, 10);

    const { data, error } = await auditClient
      .from(USER_TABLE)
      .insert({
        nombre_completo,
        correo,
        rut: rutNumero,
        dv,
        telefono,
        direccion,
        rol_id: rolData.id,
        es_activo,
        password_hash, // se almacena hasheada
      })
      .select(
        `
        id_usuario,
        nombre_completo,
        correo,
        rut,
        dv,
        telefono,
        es_activo,
        created_at,
        rol:rol_id (
          id,
          nombre
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creando usuario:", error);
      return res
        .status(500)
        .json({ ok: false, message: "Error al crear usuario" });
    }

    const user = mapUserRow(data);
    return res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error("Error inesperado en createUser:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno al crear usuario" });
  }
}
