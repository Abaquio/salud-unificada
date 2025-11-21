"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function SIGTEDerivations({ rut, onBack, compact = false }) {
  const [filters, setFilters] = useState({
    status: "all",
    specialty: "all",
  })

  const derivations = [
    {
      id: 1,
      especialidad: "Cardiología",
      prioridad: "Preferente",
      fechaEnvio: "10/03/2024",
      estado: "Con hora",
      fechaAsignada: "25/04/2024",
      profesionalDeriva: "Dra. Ana Muñoz",
      observaciones: "Paciente con HTA no controlada, requiere evaluación cardiológica",
    },
    {
      id: 2,
      especialidad: "Gastroenterología",
      prioridad: "Normal",
      fechaEnvio: "15/01/2024",
      estado: "En lista de espera",
      fechaAsignada: null,
      profesionalDeriva: "Dr. Roberto Campos",
      observaciones: "Dolor abdominal recurrente, descartar patología digestiva",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Con hora":
        return "bg-success text-white"
      case "En lista de espera":
        return "bg-warning text-white"
      case "Rechazada":
        return "bg-destructive text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgente":
        return "destructive"
      case "Preferente":
        return "default"
      default:
        return "secondary"
    }
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {derivations.map((derivation) => (
          <div key={derivation.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs">
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-foreground">{derivation.especialidad}</span>
              <Badge className={getStatusColor(derivation.estado) + " text-xs"}>{derivation.estado}</Badge>
            </div>
            <div className="space-y-1 text-muted-foreground">
              <p>Prioridad: {derivation.prioridad}</p>
              <p>Enviada: {derivation.fechaEnvio}</p>
              {derivation.fechaAsignada && (
                <p className="text-success font-medium">Fecha: {derivation.fechaAsignada}</p>
              )}
            </div>
          </div>
        ))}
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Derivaciones SIGTE</h3>
          <p className="text-sm text-muted-foreground mt-1">Derivaciones desde APS a nivel hospitalario</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {derivations.length} derivaciones
        </Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="lista">En lista de espera</SelectItem>
            <SelectItem value="hora">Con hora</SelectItem>
            <SelectItem value="resuelta">Resuelta</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.specialty} onValueChange={(val) => setFilters({ ...filters, specialty: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            <SelectItem value="cardiologia">Cardiología</SelectItem>
            <SelectItem value="gastro">Gastroenterología</SelectItem>
            <SelectItem value="traumatologia">Traumatología</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {derivations.map((derivation) => (
          <div key={derivation.id} className="p-4 rounded-lg border border-gray-200 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-1">{derivation.especialidad}</h4>
                <p className="text-sm text-muted-foreground">Enviada el {derivation.fechaEnvio}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(derivation.prioridad)}>{derivation.prioridad}</Badge>
                <Badge className={getStatusColor(derivation.estado)}>{derivation.estado}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm text-muted-foreground">Profesional que deriva: </span>
                <span className="text-sm text-foreground">{derivation.profesionalDeriva}</span>
              </div>
              {derivation.fechaAsignada && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha asignada: </span>
                  <span className="text-sm font-medium text-success">{derivation.fechaAsignada}</span>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-200">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Observaciones: </span>
                {derivation.observaciones}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
