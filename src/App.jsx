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

function App() {
  // estado “login”
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // estados originales
  const [searchedRut, setSearchedRut] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleSearch = (rut) => {
    setSearchedRut(rut);
    setSelectedSection(null);
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

      {/* 👇 ESTE DIV ES LA CLAVE: deja espacio bajo el header fijo */}
      <div className="pt-20">
        <main className="mx-auto max-w-6xl px-4 pb-6">
          <SearchBar onSearch={handleSearch} />

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
    </div>
  );
}

export default App;