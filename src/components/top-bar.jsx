"use client";

export default function TopBar({
  userName = "Administrador Salud Unificada",
  onProfileClick,
  onLogout,
}) {
  const safeName = userName || "Usuario";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
  };

  const handleLogoutClick = () => {
    // Si el padre pasa una función, usamos esa
    if (onLogout) {
      onLogout();
      return;
    }

    // Fallback genérico: limpiar token y mandar a /login
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("authToken");
      } catch (e) {
        console.error("No se pudo limpiar el token:", e);
      }
      window.location.href = "/login";
    }
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

        {/* USUARIO + AVATAR + LOGOUT */}
        <div className="flex items-center gap-3">
          {/* Nombre de usuario */}
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-xs text-gray-500">Usuario</span>
            <span className="text-sm font-semibold text-gray-900">
              {safeName}
            </span>
          </div>

          {/* Avatar: abre el perfil */}
          <button
            type="button"
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border border-primary/80 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Ver perfil de usuario"
          >
            <span className="text-sm font-bold text-white">{initials}</span>
          </button>

          {/* Ícono cerrar sesión: siempre el último, bien a la derecha */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Cerrar sesión"
          >
            {/* Ícono típico de logout */}
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H3m4-4l-4 4m4 4l-4-4m9-7h4a2 2 0 012 2v10a2 2 0 01-2 2h-4"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
