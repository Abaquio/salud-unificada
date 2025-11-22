"use client";

import { useState, useRef, useEffect } from "react";

export default function TopBar({
  userName = "Administrador Salud Unificada",
  role,              // nuevo (opcional)
  isAdmin,           // nuevo (opcional)
  onProfileClick,
  onLogout,
  onManageUsers,
}) {
  const safeName = userName || "Usuario";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // si viene isAdmin lo usamos directo, si no, deducimos por el nombre del rol
  const isAdminUser =
    typeof isAdmin === "boolean"
      ? isAdmin
      : ["ADMIN", "ADMINISTRADOR", "Administrador", "Admin"].includes(
          (role || "").toUpperCase()
        );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) return onLogout();

    try {
      localStorage.removeItem("authToken");
    } catch (e) {}
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO + TITULO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0M9 12h6m-6 4h3"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">
              Salud Unificada
            </span>
            <span className="text-xs text-gray-500">
              Visor clínico integrado CESFAM + Hospital
            </span>
          </div>
        </div>

        {/* USUARIO + MENÚ */}
        <div className="flex items-center gap-3" ref={menuRef}>
          {/* Nombre */}
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-xs text-gray-500">Usuario</span>
            <span className="text-sm font-semibold text-gray-900">
              {safeName}
            </span>
          </div>

          {/* Avatar */}
          <button
            type="button"
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border border-primary/80 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Ver perfil de usuario"
          >
            <span className="text-sm font-bold text-white">{initials}</span>
          </button>

          {/* Botón de 3 puntos */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Opciones"
          >
            <svg
              className="w-4 h-4 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </button>

          {/* MENÚ DESPLEGABLE */}
          {menuOpen && (
            <div className="absolute top-16 right-6 w-48 bg-white border border-gray-200 rounded-lg shadow-lg text-sm py-2 animate-in fade-in zoom-in">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  onProfileClick?.();
                }}
              >
                Ver perfil
              </button>

              {isAdminUser && (
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onManageUsers?.();
                  }}
                >
                  Gestionar usuarios
                </button>
              )}

              <button
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                onClick={handleLogoutClick}
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
