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

// Botón UI
import { Button } from "@/components/ui/button";

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

  // Cargar usuario desde localStorage
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

      // 👤 Tomamos el id del usuario logueado para enviarlo al backend
      const usuarioId = currentUser?.id || currentUser?.id_usuario || null;

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
    }
  };

  const handleSectionSelect = (section) => setSelectedSection(section);

  const handleBackToPatient = () => setSelectedSection(null);

  // Volver al menú principal
  const handleBackToMenu = () => {
    setHomeMode("options");
    setSearchedRut(null);
    setSelectedSection(null);
    setErrorMessage("");
  };

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
  };

  // Login si no hay usuario
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
        onLogout={handleLogout}
      />

      <div className="pt-20">
        <main className="mx-auto max-w-6xl px-4 pb-6">
          {/* BOTÓN VOLVER ARRIBA */}
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

          {/* BARRA DE BÚSQUEDA */}
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

          {/* ESTADO SIN PACIENTE */}
          {!searchedRut && !errorMessage && (
            <>
              {/* MENÚ PRINCIPAL */}
              {homeMode === "options" && (
                <div className="mt-24 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <p className="text-lg font-semibold text-foreground">
                    ¿Qué deseas hacer?
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Selecciona una opción para comenzar.
                  </p>

                  <div
                    className={`mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 ${
                      isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
                    }`}
                  >
                    {/* Buscar registro */}
                    <button
                      type="button"
                      onClick={() => setHomeMode("search")}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                    >
                      <div className="flex h-32 items-center justify-center">
                        <div className="scale-90 md:scale-100 transition group-hover:scale-105">
                          <BuscarRegistro />
                        </div>
                      </div>

                      <p className="mt-4 text-base font-semibold text-slate-800">
                        Buscar registro
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ingresar RUT y ver resumen clínico unificado.
                      </p>
                    </button>

                    {/* Ver historial */}
                    <button
                      type="button"
                      onClick={() => setHomeMode("historial")}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                    >
                      <div className="flex h-32 items-center justify-center">
                        <div className="scale-75 md:scale-90 transition group-hover:scale-100">
                          <VerHistorial />
                        </div>
                      </div>

                      <p className="mt-4 text-base font-semibold text-slate-800">
                        Ver historial
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Próximamente: historial de RUT consultados.
                      </p>
                    </button>

                    {/* Gestionar usuarios — SOLO ADMIN */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowUserManagement(true)}
                        className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 py-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
                      >
                        <div className="flex h-32 items-center justify-center">
                          <div className="transition group-hover:scale-105">
                            <GestionarUsuariosIcon />
                          </div>
                        </div>

                        <p className="mt-4 text-base font-semibold text-slate-800">
                          Gestionar usuarios
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Crear, editar y administrar cuentas de acceso.
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODO BUSCAR */}
              {homeMode === "search" && (
                <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
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
                    <span className="font-semibold">“Buscar”</span> para ver el
                    resumen clínico unificado del paciente.
                  </p>
                </div>
              )}

              {/* MODO HISTORIAL */}
              {homeMode === "historial" && (
                <div className="mt-24 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <p className="text-lg font-semibold text-foreground">
                    Historial de consultas
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Este módulo se encuentra en desarrollo.
                  </p>
                </div>
              )}
            </>
          )}

          {/* PACIENTE CARGADO */}
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

      {/* Gestión de usuarios */}
      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
          onShowUserProfile={(user) => {
            setProfileUser(mapUserForProfile(user));
            setShowProfile(true);
          }}
        />
      )}

      {/* Perfil de usuario */}
      {showProfile && profileUser && (
        <UserProfile
          user={profileUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
