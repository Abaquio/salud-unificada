"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function UserProfile({ user = {}, onClose }) {
  const safeName = user.name || "Usuario Salud Unificada";

  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    password: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios (llamar API, etc.)
    console.log("[Visor Salud Unificada] Guardando cambios:", formData);
    setIsEditing(false);
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

        {/* Content */}
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
                      {user.role || "Usuario"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado del Usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className="text-base px-3 py-1"
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Rol</p>
                    <p className="text-lg font-medium">
                      {user.role || "Médico"}
                    </p>
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
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Fecha de Creación
                    </p>
                    <p className="text-lg font-medium">
                      {user.createdAt || "01/01/2023"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Última Actualización
                    </p>
                    <p className="text-lg font-medium">
                      {user.updatedAt || "15/03/2024"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Edición */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información de Contacto</CardTitle>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                    placeholder="correo@ejemplo.com"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={!isEditing}
                    placeholder="+56 9 1234 5678"
                    className="text-base"
                  />
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Nueva Contraseña (opcional)
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value)
                      }
                      placeholder="••••••••"
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Deja en blanco si no deseas cambiar la contraseña
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} size="lg">
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          email: user?.email ?? "",
                          phone: user?.phone ?? "",
                          password: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
