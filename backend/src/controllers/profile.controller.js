import { auditClient } from "../config/supabaseClients.js";
import bcrypt from "bcryptjs";

export async function updateProfile(req, res) {
  try {
    const userId = req.params.id; // viene desde la URL (/api/profile/:id)
    const { email, telefono, password } = req.body;

    const updateData = {
      correo: email,
      telefono: telefono,
    };

    // Si viene nueva contraseña → hashear antes
    if (password && password.trim().length > 0) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await auditClient
      .from("usuario")
      .update(updateData)
      .eq("id_usuario", userId)
      .select(
        `
        id_usuario,
        nombre_completo,
        correo,
        telefono,
        rut,
        dv,
        rol:rol_id(id, nombre),
        es_activo,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ ok: false, message: "Error al actualizar perfil" });
    }

    return res.json({ ok: true, user: data });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({
      ok: false,
      message: "Error inesperado al actualizar el perfil",
    });
  }
}
