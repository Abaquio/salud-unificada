"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function APSAttentions({ rut, compact = false, onBack }) {
  const [filters, setFilters] = useState({
    professional: "all",
    period: "all",
    activity: "all",
  })

  const attentions = [
    {
      id: 1,
      fecha: "15/03/2024 09:30",
      diagnostico: "Hipertensión arterial esencial",
      profesional: "Dra. Ana Muñoz",
      tipo: "Médico",
      establecimiento: "CESFAM Centro",
      actividad: "Control de salud cardiovascular",
      indicaciones: "Continuar con tratamiento antihipertensivo. Control en 3 meses.",
      tipoAtencion: "Abierta",
    },
    {
      id: 2,
      fecha: "02/02/2024 14:15",
      diagnostico: "Control prenatal embarazo normal",
      profesional: "Matrona Carmen Silva",
      tipo: "Matrona",
      establecimiento: "CESFAM Centro",
      actividad: "Control prenatal",
      indicaciones: "Suplementación con ácido fólico y hierro. Próximo control en 4 semanas.",
      tipoAtencion: "Abierta",
    },
    {
      id: 3,
      fecha: "18/01/2024 11:00",
      diagnostico: "Dolor abdominal agudo",
      profesional: "Dr. Roberto Campos",
      tipo: "Médico",
      establecimiento: "SAPU Centro",
      actividad: "Atención de urgencia",
      indicaciones: "Analgesia con paracetamol. Derivar a gastroenterología si persiste.",
      tipoAtencion: "Urgencia APS",
    },
  ]

  if (compact) {
    return (
      <div className="space-y-3">
        {attentions.map((attention) => (
          <div key={attention.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs">
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-foreground">{attention.fecha}</span>
              <Badge
                variant={attention.tipoAtencion === "Urgencia APS" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {attention.tipoAtencion}
              </Badge>
            </div>
            <p className="text-foreground font-medium mb-1">{attention.diagnostico}</p>
            <p className="text-muted-foreground">
              {attention.profesional} ({attention.tipo})
            </p>
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
          <h3 className="text-xl font-semibold text-foreground">Atenciones APS (Rayen)</h3>
          <p className="text-sm text-muted-foreground mt-1">Historial de atenciones en Atención Primaria</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {attentions.length} atenciones
        </Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select value={filters.professional} onValueChange={(val) => setFilters({ ...filters, professional: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por profesional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los profesionales</SelectItem>
            <SelectItem value="medico">Médicos</SelectItem>
            <SelectItem value="enfermera">Enfermeras</SelectItem>
            <SelectItem value="matrona">Matronas</SelectItem>
            <SelectItem value="odontologo">Odontólogos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.period} onValueChange={(val) => setFilters({ ...filters, period: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
            <SelectItem value="24">Últimos 24 meses</SelectItem>
            <SelectItem value="36">Últimos 36 meses</SelectItem>
            <SelectItem value="48">Últimos 48 meses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.activity} onValueChange={(val) => setFilters({ ...filters, activity: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Actividad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las actividades</SelectItem>
            <SelectItem value="control">Controles</SelectItem>
            <SelectItem value="urgencia">Urgencias</SelectItem>
            <SelectItem value="consulta">Consultas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {attentions.map((attention) => (
          <div
            key={attention.id}
            className="p-4 rounded-lg border border-gray-200 bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{attention.fecha}</span>
                  <span className="text-xs text-muted-foreground">{attention.establecimiento}</span>
                </div>
              </div>
              <Badge variant={attention.tipoAtencion === "Urgencia APS" ? "destructive" : "secondary"}>
                {attention.tipoAtencion}
              </Badge>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-foreground">Diagnóstico: </span>
                <span className="text-sm text-foreground">{attention.diagnostico}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Profesional: </span>
                  <span className="text-foreground">
                    {attention.profesional} ({attention.tipo})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Actividad: </span>
                <span className="text-sm text-foreground">{attention.actividad}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Indicaciones: </span>
                  {attention.indicaciones}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
