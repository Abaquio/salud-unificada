"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Medications({ rut, compact = false, onBack }) {
  const medications = [
    {
      id: 1,
      nombre: "Enalapril 10mg",
      origen: "APS",
      fechaInicio: "01/01/2024",
      fechaTermino: "Indefinido",
      profesional: "Dra. Ana Muñoz",
      indicacion: "1 comprimido cada 12 horas",
      vigente: true,
    },
    {
      id: 2,
      nombre: "Atorvastatina 20mg",
      origen: "Hospital",
      fechaInicio: "15/02/2024",
      fechaTermino: "Indefinido",
      profesional: "Dr. Luis Ramírez",
      indicacion: "1 comprimido cada noche",
      vigente: true,
    },
    {
      id: 3,
      nombre: "Amoxicilina 500mg",
      origen: "Hospital",
      fechaInicio: "05/01/2024",
      fechaTermino: "12/01/2024",
      profesional: "Dr. Fernando Torres",
      indicacion: "1 comprimido cada 8 horas por 7 días",
      vigente: false,
    },
  ]

  const vigentes = medications.filter((m) => m.vigente)
  const historicos = medications.filter((m) => !m.vigente)

  if (compact) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Vigentes</h4>
          {vigentes.map((med) => (
            <div key={med.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{med.nombre}</p>
              <p className="text-muted-foreground">{med.indicacion}</p>
              <Badge variant={med.origen === "APS" ? "secondary" : "default"} className="mt-2 text-xs">
                {med.origen}
              </Badge>
            </div>
          ))}
        </div>
        {historicos.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Históricos</h4>
            {historicos.map((med) => (
              <div key={med.id} className="p-3 rounded-lg border border-gray-200 bg-muted/30 text-xs mb-2">
                <p className="font-medium text-foreground mb-1">{med.nombre}</p>
                <p className="text-muted-foreground">
                  {med.fechaInicio} - {med.fechaTermino}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Datos del Paciente
        </Button>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">Medicamentos</h3>
        <p className="text-sm text-muted-foreground mt-1">Prescripciones desde APS y Hospital</p>
      </div>

      <div className="mb-6">
        <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          Medicamentos Vigentes
          <Badge variant="default" className="bg-success text-white">
            {vigentes.length}
          </Badge>
        </h4>
        <div className="space-y-3">
          {vigentes.map((med) => (
            <div key={med.id} className="p-4 rounded-lg border border-gray-200 bg-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-base font-semibold text-foreground">{med.nombre}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{med.indicacion}</p>
                </div>
                <Badge variant={med.origen === "APS" ? "secondary" : "default"}>{med.origen}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Fecha inicio: </span>
                  <span className="text-foreground">{med.fechaInicio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prescrito por: </span>
                  <span className="text-foreground">{med.profesional}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-foreground mb-4">Medicamentos Históricos</h4>
        <div className="space-y-3">
          {historicos.map((med) => (
            <div key={med.id} className="p-4 rounded-lg border border-gray-200 bg-muted/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-base font-medium text-foreground">{med.nombre}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{med.indicacion}</p>
                </div>
                <Badge variant="outline">{med.origen}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Inicio: </span>
                  <span className="text-foreground">{med.fechaInicio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Término: </span>
                  <span className="text-foreground">{med.fechaTermino}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prescriptor: </span>
                  <span className="text-foreground">{med.profesional}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
