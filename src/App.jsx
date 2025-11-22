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

// Perfil de usuario
import UserProfile from "./components/user-profile";
// Gestión de usuarios
import UserManagement from "./components/user-management";

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

  // recuperar usuario desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
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

      const res = await fetch(`${API_URL}/api/patient/${rut}`);
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

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };

  const handleBackToPatient = () => {
    setSelectedSection(null);
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
  };

  // Si NO está logueado → login
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
        isAdmin={(currentUserRole || "").toLowerCase() === "administrador"}
        onProfileClick={() => {
          setProfileUser(mapUserForProfile(currentUser));
          setShowProfile(true);
        }}
        onManageUsers={() => setShowUserManagement(true)}
        onLogout={handleLogout}
      />

      <div className="pt-20">
        <main className="mx-auto max-w-6xl px-4 pb-6">
          <SearchBar onSearch={handleSearch} />

          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}

          {!searchedRut && !errorMessage && (
            <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-primary/60 bg-primary/5 animate-pulse">
                <span className="text-3xl">👤</span>
                <span className="absolute -right-1 -bottom-1 text-xl">
                  🔍
                </span>
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

      {/* Overlay gestión de usuarios (solo admins) */}
      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
          onShowUserProfile={(user) => {
            setProfileUser(mapUserForProfile(user));
            setShowProfile(true);
          }}
        />
      )}

      {/* Overlay perfil (propio u otro usuario) */}
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
