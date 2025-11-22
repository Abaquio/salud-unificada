"use client";

import { useState } from "react";

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

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  // estado “login”
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // estados originales
  const [searchedRut, setSearchedRut] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // estado para manejar errores de búsqueda (rut no existe, error backend, etc.)
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (rut) => {
    try {
      // limpiar antes de nueva búsqueda
      setErrorMessage("");
      setSearchedRut(null);
      setSelectedSection(null);

      const res = await fetch(`${API_URL}/api/patient/${rut}`);
      const data = await res.json();

      if (!res.ok) {
        // si backend responde 404 u otro error
        setErrorMessage(data.message || "Paciente no encontrado");
        return;
      }

      // si todo ok, guardamos el rut normalizado que devuelve el backend
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

  // Si NO está logueado → solo login
  if (!isLoggedIn) {
    return <Login onEnter={() => setIsLoggedIn(true)} />;
  }

  // Si ya entró → visor clínico
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />

      {/* wrapper con padding top para no quedar bajo el header fijo */}
      <div className="pt-20">
        <main className="mx-auto max-w-6xl px-4 pb-6">
          <SearchBar onSearch={handleSearch} />

          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}

          {searchedRut && (
            <div className="mt-6 flex gap-6">
              <div className="flex-1">
                {/* vista general del paciente */}
                {!selectedSection && (
                  <PatientInfo
                    rut={searchedRut}
                    onSectionSelect={handleSectionSelect}
                  />
                )}

                {/* secciones detalle */}
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

              {/* sidebar de secciones */}
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
    </div>
  );
}

export default App;