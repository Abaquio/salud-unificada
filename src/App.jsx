"use client";

import { useState, useEffect } from "react";

// Login
import Login from "./components/Login";

// Layout principal
import TopBar from "./components/top-bar";
import SearchBar from "./components/search-bar";
import PatientInfo from "./components/patient-info";
import SectionsSidebar from "./components/sections-sidebar";
import ApsAttentions from "./components/aps-attentions";
import SigteDerivations from "./components/sigte-derivations";
import HospitalAttentions from "./components/hospital-attentions";
import Examinations from "./components/examinations";
import Medications from "./components/medications";

// Perfil de usuario / gestión
import UserProfile from "./components/user-profile";
import UserManagement from "./components/user-management";

// Opciones de inicio
import BuscarRegistro from "./components/buscar-registro";
import VerHistorial from "./components/ver-historial";

// Lupa animada del centro
import LupaCentro from "./components/lupa-centro";

// Huella / scanner gestionar usuarios
import GestionarUsuariosIcon from "./components/gestionar-usuarios";

// Historial visual (overlay)
import PatientHistory from "./components/historial";

// Loader de datos
import LoadingDatos from "./components/loading-datos";

// Modal "¿Estás seguro?" para logout
import ConfirmLogout from "./components/estas-seguro";

import { Button } from "@/components/ui/button";

// 🧩 Dashboard visual (resumen)
import Dashboard from "./components/dashboard";
// 🧩 Dashboard full-screen
import DashboardFull from "./components/dashboard-full";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "salud_unificada_user";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const isLoggedIn = !!currentUser;

  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  const [showUserManagement, setShowUserManagement] = useState(false);

  const [searchedRut, setSearchedRut] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // "options" | "search" | "historial"
  const [homeMode, setHomeMode] = useState("options");

  // Loader mientras se consultan los datos del paciente
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Mostrar modal de confirmación de logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Modal dashboard full
  const [showDashboardFull, setShowDashboardFull] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("No se pudo leer usuario almacenado:", e);
    }
  }, []);

  const handleSearch = async (rut) => {
    try {
      setErrorMessage("");
      setSearchedRut(null);
      setSelectedSection(null);

      if (homeMode !== "search") setHomeMode("search");

      setIsLoadingPatient(true);

      // 🔐 Asegurarnos de mandar siempre el id correcto del usuario
      const usuarioId =
        currentUser?.id_usuario ??
        currentUser?.id ??
        currentUser?.usuario_id ??
        null;

      const params = new URLSearchParams();
      if (usuarioId) params.set("usuarioId", usuarioId);
      params.set("sistema_origen", "VISOR_WEB");

      const res = await fetch(
        `${API_URL}/api/patient/${rut}?${params.toString()}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Paciente no encontrado");
        return;
      }

      setSearchedRut(data.rut);
      setSelectedSection(null);
    } catch (err) {
      console.error("Error consultando backend:", err);
      setErrorMessage("Error conectando con el servidor");
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const handleSectionSelect = (section) => setSelectedSection(section);

  const handleBackToPatient = () => setSelectedSection(null);

  const handleBackToMenu = () => {
    setHomeMode("options");
    setSearchedRut(null);
    setSelectedSection(null);
    setErrorMessage("");
    setIsLoadingPatient(false);
  };

  // 🔐 Logout real (solo se llama si el usuario confirma)
  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("No se pudo limpiar usuario almacenado:", e);
    }
    setCurrentUser(null);
    setShowProfile(false);
    setProfileUser(null);
    setShowUserManagement(false);
    setSearchedRut(null);
    setSelectedSection(null);
    setErrorMessage("");
    setHomeMode("options");
    setIsLoadingPatient(false);
  };

  // Click en "Cerrar sesión" del TopBar → solo abre el modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  if (!isLoggedIn) {
    return (
      <Login
        onEnter={(userFromApi) => {
          setCurrentUser(userFromApi);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userFromApi));
          } catch (e) {
            console.error("No se pudo guardar usuario:", e);
          }
        }}
      />
    );
  }

  const currentUserDisplayName =
    currentUser?.nombre ||
    currentUser?.nombre_completo ||
    currentUser?.name ||
    "Administrador Salud Unificada";

  const currentUserRole = currentUser?.rol || currentUser?.role;
  const isAdmin = (currentUserRole || "").toLowerCase() === "administrador";

  const currentUserId =
    currentUser?.id_usuario ??
    currentUser?.id ??
    currentUser?.usuario_id ??
    null;

  const mapUserForProfile = (user) => ({
    ...user,
    name:
      user.nombre ||
      user.nombre_completo ||
      user.name ||
      "Usuario Salud Unificada",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar
        userName={currentUserDisplayName}
        role={currentUserRole}
        isAdmin={isAdmin}
        onProfileClick={() => {
          setProfileUser(mapUserForProfile(currentUser));
          setShowProfile(true);
        }}
        onManageUsers={() => setShowUserManagement(true)}
        onLogout={handleLogoutClick} // 👈 ahora muestra el modal, no cierra directo
      />

      <div className="pt-20">
        <main className="mx-auto max-w-6xl px-4 pb-6">
          {(homeMode !== "options" || searchedRut) && (
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-5xl flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToMenu}
                  className="gap-1 whitespace-nowrap"
                >
                  <span className="text-lg">←</span>
                  <span>Volver al menú</span>
                </Button>
              </div>
            </div>
          )}

          {(homeMode === "search" || searchedRut) && (
            <div className="mt-2 flex justify-center">
              <div className="w-full max-w-5xl">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}

          {!searchedRut && !errorMessage && (
            <>
              {homeMode === "options" && (
                <div className="mt-8 space-y-6">
                  {/* Título + botones arriba */}
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-lg font-semibold text-foreground">
                        ¿Qué deseas hacer?
                      </p>
                      <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        Selecciona una opción para comenzar.
                      </p>
                    </div>

                    <div
                      className={`grid w-full max-w-5xl grid-cols-1 gap-4 ${
                        isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setHomeMode("search")}
                        className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                      >
                        <div className="flex h-24 items-center justify-center">
                          <div className="scale-50 md:scale-90 transition group-hover:scale-100">
                            <BuscarRegistro />
                          </div>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          Buscar registro
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Ingresar RUT y ver resumen clínico unificado.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHomeMode("historial")}
                        className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                      >
                        <div className="flex h-24 items-center justify-center">
                          <div className="scale-[0.6] md:scale-50 transition group-hover:scale-70">
                            <VerHistorial />
                          </div>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          Ver historial
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Revisa las búsquedas recientes realizadas.
                        </p>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setShowUserManagement(true)}
                          className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                        >
                          <div className="flex h-24 items-center justify-center">
                            <div className="scale-75 md:scale-50 transition group-hover:scale-70">
                              <GestionarUsuariosIcon />
                            </div>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-800">
                            Gestionar usuarios
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Crear, editar y administrar cuentas de acceso.
                          </p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dashboard debajo ocupando el resto del espacio */}
                  <div className="mt-2">
                    <Dashboard 
                      onOpenFull={() => setShowDashboardFull(true)} 
                      onOpenHistory={() => setHomeMode("historial")}
                      />
                  </div>
                </div>
              )}

              {homeMode === "search" && (
                <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
                  {isLoadingPatient ? (
                    <div className="mb-4 flex items-center justify-center">
                      <LoadingDatos />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-center">
                        <div className="scale-75 md:scale-90">
                          <LupaCentro />
                        </div>
                      </div>

                      <p className="text-lg font-semibold text-foreground">
                        Busca un paciente
                      </p>
                      <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        Ingresa el RUT en la barra superior y presiona{" "}
                        <span className="font-semibold">“Buscar”</span> para ver
                        el resumen clínico unificado del paciente.
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {searchedRut && (
            <div className="mt-6 flex gap-6">
              <div className="flex-1">
                {!selectedSection && (
                  <PatientInfo
                    rut={searchedRut}
                    onSectionSelect={handleSectionSelect}
                  />
                )}

                {selectedSection === "aps-attentions" && (
                  <ApsAttentions
                    rut={searchedRut}
                    onBack={handleBackToPatient}
                  />
                )}

                {selectedSection === "sigte-derivations" && (
                  <SigteDerivations
                    rut={searchedRut}
                    onBack={handleBackToPatient}
                  />
                )}

                {selectedSection === "hospital-attentions" && (
                  <HospitalAttentions
                    rut={searchedRut}
                    onBack={handleBackToPatient}
                  />
                )}

                {selectedSection === "examinations" && (
                  <Examinations
                    rut={searchedRut}
                    onBack={handleBackToPatient}
                  />
                )}

                {selectedSection === "medications" && (
                  <Medications
                    rut={searchedRut}
                    onBack={handleBackToPatient}
                  />
                )}
              </div>

              <div className="w-80">
                <SectionsSidebar
                  rut={searchedRut}
                  activeSection={selectedSection}
                  onSectionSelect={handleSectionSelect}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {homeMode === "historial" && (
        <PatientHistory
          onClose={() => setHomeMode("options")}
          currentUserId={currentUserId}
          isAdmin={isAdmin} // para que el admin vea todo el historial
          onGoToRut={(rut) => {
            // cerrar historial y lanzar la búsqueda del RUT seleccionado
            setHomeMode("search");
            handleSearch(rut);
          }}
        />
      )}

      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
          onShowUserProfile={(user) => {
            setProfileUser(mapUserForProfile(user));
            setShowProfile(true);
          }}
        />
      )}

      {showProfile && profileUser && (
        <UserProfile user={profileUser} onClose={() => setShowProfile(false)} />
      )}

      {/* Modal Dashboard full-screen */}
      {showDashboardFull && (
        <DashboardFull onClose={() => setShowDashboardFull(false)} />
      )}

      {/* Modal "¿Estás seguro de cerrar sesión?" */}
      {showLogoutConfirm && (
        <ConfirmLogout
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}

export default App;
