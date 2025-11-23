"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Confirmacion from "./confirmacion"; // 👈 ajusta la ruta si es necesario

const API_URL = import.meta.env.VITE_API_URL;

export default function UserProfile({ user = {}, onClose }) {
  const safeName =
    user.name ||
    user.nombre ||
    user.nombre_completo ||
    "Usuario Salud Unificada";

  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const email = user.email || user.correo || "";
  const phone = user.phone || user.telefono || "";
  const rol = user.role || user.rol || "Usuario";
  const isActive = user.isActive ?? user.es_activo ?? true;

  // -----------------------------------------
  // 🟦 FORMATO DE FECHAS (ÚNICO CAMBIO REAL)
  // -----------------------------------------
  const formatFecha = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const createdAtRaw = user.createdAt || user.created_at || "—";
  const updatedAtRaw = user.updatedAt || user.updated_at || "—";

  const createdAt = formatFecha(createdAtRaw);
  const updatedAt = formatFecha(updatedAtRaw);
  // -----------------------------------------

  const [saving, setSaving] = useState(false);

  // Estados de edición individual
  const [editingField, setEditingField] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email,
    phone,
    password: "",
  });

  // Confirmación
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      setSaving(true);

      const payload = {};
      if (field === "email") payload.email = formData.email;
      if (field === "phone") payload.telefono = formData.phone;
      if (field === "password") payload.password = formData.password;

      const res = await fetch(
        `${API_URL}/api/profile/${user.id || user.id_usuario}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!data.ok) {
        alert("❌ Error al actualizar: " + data.message);
        return;
      }

      let msg = "Los cambios se guardaron correctamente.";
      if (field === "email") msg = "Tu correo electrónico fue actualizado correctamente.";
      if (field === "phone") msg = "Tu teléfono fue actualizado correctamente.";
      if (field === "password") msg = "Tu contraseña fue actualizada correctamente.";

      setSuccessMessage(msg);
      setShowSuccess(true);

      setEditingField(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error inesperado al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Información del Usuario */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 p-6 bg-secondary rounded-lg">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {initials}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{safeName}</h2>
                    <p className="text-muted-foreground">
                      {rol}
                      {user.rut ? ` · ${user.rut}` : ""}
                    </p>
                    {email && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {email}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información general */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rol</p>
                    <p className="font-medium">{rol}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Fecha de Creación
                    </p>
                    <p className="font-medium">{createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Última Actualización
                    </p>
                    <p className="font-medium">{updatedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Editar Información</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* EMAIL */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium">
                      Correo electrónico
                    </label>
                    <Input
                      type="email"
                      disabled={editingField !== "email"}
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  {editingField !== "email" ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditingField("email")}
                    >
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave("email")}
                        disabled={saving}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingField(null);
                          setFormData((p) => ({ ...p, email }));
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>

                {/* TELÉFONO */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input
                      type="tel"
                      disabled={editingField !== "phone"}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  {editingField !== "phone" ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditingField("phone")}
                    >
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave("phone")}
                        disabled={saving}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingField(null);
                          setFormData((p) => ({ ...p, phone }));
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>

                {/* CONTRASEÑA */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        disabled={editingField !== "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.964 9.964 0 012.547-4.391M9.878 9.878a3 3 0 104.243 4.243"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Déjalo vacío si no deseas cambiar tu contraseña.
                    </p>
                  </div>

                  {editingField !== "password" ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditingField("password")}
                    >
                      Cambiar
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave("password")}
                        disabled={saving}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingField(null);
                          setFormData((p) => ({ ...p, password: "" }));
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <Confirmacion
            title="Actualización exitosa"
            message={successMessage}
            onClose={() => setShowSuccess(false)}
          />
        </div>
      )}
    </div>
  );
}
