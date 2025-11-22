"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SectionsSidebar({
  rut,
  onSectionSelect,
  activeSection,
  isLoading = false,
}) {
  // Si no hay RUT y no estamos cargando, no mostramos nada
  if (!rut && !isLoading) return null;

  // 🦴 Skeleton mientras se está buscando el paciente
  if (isLoading) {
    return (
      <Card className="p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-200 rounded-lg" />
          ))}
          <div className="h-9 w-40 bg-gray-100 rounded-lg" />
        </div>
      </Card>
    );
  }

  const sections = [
    { id: "aps-attentions", label: "Atenciones APS", icon: "📋" },
    { id: "sigte-derivations", label: "Derivaciones SIGTE", icon: "🔄" },
    { id: "hospital-attentions", label: "Hospital", icon: "🏥" },
    { id: "examinations", label: "Exámenes", icon: "🔬" },
    { id: "medications", label: "Medicamentos", icon: "💊" },
  ];

  return (
    <Card className="p-4 rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-3 ">
        <h2 className="text-base  font-semibold text-gray-900">
          Historial Clínico
        </h2>

        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <Button
              key={section.id}
              type="button"
              variant={isActive ? "default" : "outline"}
              className="w-full justify-start px-4 py-3 text-sm rounded-lg"
              onClick={() => onSectionSelect(section.id)}
            >
              <span className="mr-2 text-lg">{section.icon}</span>
              {section.label}
            </Button>
          );
        })}

        {activeSection && (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start mt-2 text-sm"
            onClick={() => onSectionSelect(null)}
          >
            <span className="mr-2 text-lg">👤</span>
            Ver Datos del Paciente
          </Button>
        )}
      </div>
    </Card>
  );
}
