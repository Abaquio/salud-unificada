"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserManagement({ onClose, onShowUserProfile }) {
  const [email, setEmail] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal para crear usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rut: "",
    rol: "Médico",
    telefono: "",
    direccion: "",
    esActivo: true,
    password: "", // contraseña provisoria
  });

  // Cargar usuarios reales
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");
        const res = await fetch(`${API_URL}/api/users`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Error al cargar usuarios");
        }
        setUsers(data.users || []);
      } catch (err) {
        console.error("Error obteniendo usuarios:", err);
        setError(err.message || "Error al obtener usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSendInvitation = (e) => {
    e.preventDefault();
    if (email) {
      setInvitationSent(true);
      setTimeout(() => {
        setInvitationSent(false);
        setEmail("");
      }, 3000);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      setActionLoadingId(user.id);
      const newStatus = !user.isActive;

      const res = await fetch(`${API_URL}/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es_activo: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar el usuario");
      }

      const updated = data.user;

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
      );
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error actualizando estado de usuario:", err);
      alert(err.message || "Error al actualizar estado del usuario");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Formateo para mostrar RUT (con puntos)
  const formatRut = (rutCompleto) => {
    if (!rutCompleto) return "";
    const [numero, dv] = String(rutCompleto).split("-");
    const clean = numero.replace(/\D/g, "");
    const reversed = clean.split("").reverse().join("");
    const chunks = reversed.match(/.{1,3}/g) || [];
    const withDots = chunks.join(".").split("").reverse().join("");
    return `${withDots}-${dv}`;
  };

  // Formateo para input de RUT (sin puntos, solo números y K)
  const formatRutInput = (value) => {
    let clean = value.toUpperCase().replace(/[^0-9K]/g, ""); // solo dígitos y K
    if (clean.length > 9) clean = clean.slice(0, 9);
    if (!clean) return "";
    if (clean.length === 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    return `${body}-${dv}`;
  };

  const [showPassword, setShowPassword] = useState(false);


  const handleChangeNewUser = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);

      const payload = {
        nombre_completo: newUser.nombre,
        correo: newUser.email,
        rut_completo: newUser.rut, // ej: "21409625-0"
        rol_nombre: newUser.rol,
        telefono: newUser.telefono,
        direccion: newUser.direccion,
        es_activo: newUser.esActivo,
        provisional_password: newUser.password,
      };

      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear el usuario");
      }

      setUsers((prev) => [data.user, ...prev]);

      setShowCreateModal(false);
      setNewUser({
        nombre: "",
        email: "",
        rut: "",
        rol: "Médico",
        telefono: "",
        direccion: "",
        esActivo: true,
        password: "",
      });
    } catch (err) {
      console.error("Error creando usuario:", err);
      alert(err.message || "Error al crear usuario");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Volver
            </Button>
            <h2 className="text-2xl font-semibold text-foreground">
              Gestión de Usuarios
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Invitar Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Invitar Nuevo Usuario
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Crear usuario
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Correo Electrónico
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="usuario@ejemplo.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" className="gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Enviar Invitación
                    </Button>
                  </div>
                </div>
                {invitationSent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Invitación enviada exitosamente a {email}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Lista de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Usuarios Registrados ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">
                  Cargando usuarios...
                </p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          RUT
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Nombre
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Rol
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Estado
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Opciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-200 hover:bg-secondary/50 transition-colors align-top"
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-foreground">
                              {formatRut(user.rut)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-primary-foreground">
                                  {(user.nombre_completo ||
                                    user.nombre ||
                                    user.name ||
                                    "")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {user.nombre_completo ||
                                  user.nombre ||
                                  user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="font-normal">
                              {user.rol || user.role || "—"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-start gap-2">
                              <button
                                type="button"
                                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                                onClick={() =>
                                  setOpenMenuId((prev) =>
                                    prev === user.id ? null : user.id
                                  )
                                }
                              >
                                <svg
                                  className="w-4 h-4 text-gray-700"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                              </button>

                              {openMenuId === user.id && (
                                <div className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onShowUserProfile?.(user);
                                    }}
                                  >
                                    Mostrar perfil
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                                    disabled={actionLoadingId === user.id}
                                    onClick={() => handleToggleActive(user)}
                                  >
                                    {user.isActive
                                      ? "Inhabilitar cuenta"
                                      : "Reactivar cuenta"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL CREAR USUARIO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-6">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Crear nuevo usuario</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
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
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre completo
                  </label>
                  <Input
                    value={newUser.nombre}
                    onChange={(e) =>
                      handleChangeNewUser("nombre", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      handleChangeNewUser("email", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    RUT (sin puntos, con guion)
                  </label>
                  <Input
                    placeholder="11222333-4"
                    value={newUser.rut}
                    onChange={(e) =>
                      handleChangeNewUser(
                        "rut",
                        formatRutInput(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                {/* Contraseña provisoria */}
                {/* Contraseña provisoria */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contraseña provisoria
                  </label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={newUser.password}
                      onChange={(e) => handleChangeNewUser("password", e.target.value)}
                      required
                    />

                    {/* Botón ojo */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? (
                        // 👁 Ojo abierto
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        // 👁‍🗨 Ojo con línea (oculto)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825a10.05 10.05 0 01-1.875.175c-4.477 0-8.268-2.943-9.542-7a9.964 9.964 0 012.547-4.391M9.878 9.878a3 3 0 104.243 4.243M3 3l18 18"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                  </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rol
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newUser.rol}
                      onChange={(e) =>
                        handleChangeNewUser("rol", e.target.value)
                      }
                    >
                      <option>Administrador</option>
                      <option>Médico</option>
                      <option>Enfermera</option>
                      <option>TENS</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <input
                      id="activoCheck"
                      type="checkbox"
                      className="w-4 h-4"
                      checked={newUser.esActivo}
                      onChange={(e) =>
                        handleChangeNewUser("esActivo", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="activoCheck"
                      className="text-sm text-muted-foreground"
                    >
                      Usuario activo
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Teléfono (opcional)
                  </label>
                  <Input
                    value={newUser.telefono}
                    onChange={(e) =>
                      handleChangeNewUser("telefono", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dirección (opcional)
                  </label>
                  <Input
                    value={newUser.direccion}
                    onChange={(e) =>
                      handleChangeNewUser("direccion", e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Creando..." : "Crear usuario"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
