"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export default function SIGTEDerivations({ rut, onBack, compact = false }) {
  const [filters, setFilters] = useState({
    status: "all",
    specialty: "all",
  })

  const [derivations, setDerivations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!rut) {
      setDerivations([])
      setError("")
      return
    }

    const fetchDerivations = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/patient/${rut}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "No se pudieron cargar las derivaciones SIGTE")
        }

        const raw = data?.aps?.derivaciones ?? []

        const mapped = raw.map((d, idx) => {
          // fecha_derivacion → dd/mm/yyyy
          let fechaEnvio = ""
          if (d.fecha_derivacion) {
            const dateObj = new Date(d.fecha_derivacion)
            fechaEnvio = dateObj.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          }

          return {
            id: d.id_derivacion || d.id || idx,
            especialidad: d.especialidad_solicitada || "Especialidad no especificada",
            prioridad: d.prioridad || "Normal",
            fechaEnvio: fechaEnvio || "Sin fecha",
            estado: d.estado_sigte || "Pendiente",
            // si en el futuro el backend trae fecha asignada, la mapeamos aquí
            fechaAsignada: d.fecha_asignada || null,
            profesionalDerivaNombre:
              d.profesional_deriva_nombre ||
              d.profesional_aps?.nombre_completo ||
              "Profesional APS",
            observaciones: d.observaciones || "Sin observaciones registradas",
          }
        })

        setDerivations(mapped)
      } catch (err) {
        console.error(err)
        setError(err.message || "Error al cargar las derivaciones SIGTE")
        setDerivations([])
      } finally {
        setLoading(false)
      }
    }

    fetchDerivations()
  }, [rut])

  const getStatusColor = (status) => {
    switch (status) {
      case "Con hora":
        return "bg-success text-white"
      case "En lista de espera":
        return "bg-warning text-white"
      case "Rechazada":
        return "bg-destructive text-white"
      case "Resuelta":
        return "bg-secondary text-secondary-foreground"
      case "Pendiente":
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

  // opciones dinámicas de especialidad según lo que venga de la BD
  const specialtyOptions = Array.from(
    new Set(derivations.map((d) => d.especialidad).filter(Boolean))
  ).sort()

  // estados típicos de SIGTE
  const statusOptions = ["Pendiente", "En lista de espera", "Con hora", "Resuelta", "Rechazada"]

  const filteredDerivations = derivations.filter((d) => {
    // filtro por estado
    if (filters.status !== "all" && d.estado !== filters.status) {
      return false
    }
    // filtro por especialidad
    if (filters.specialty !== "all" && d.especialidad !== filters.specialty) {
      return false
    }
    return true
  })

  // --- MODO COMPACTO ---
  if (compact) {
    if (loading) {
      return <p className="text-xs text-muted-foreground">Cargando derivaciones SIGTE...</p>
    }

    if (error) {
      return <p className="text-xs text-red-500">{error}</p>
    }

    if (filteredDerivations.length === 0) {
      return <p className="text-xs text-muted-foreground">No hay derivaciones registradas.</p>
    }

    return (
      <div className="space-y-3">
        {filteredDerivations.map((derivation) => (
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

  // --- VISTA COMPLETA ---
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
          {filteredDerivations.length} derivaciones
        </Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Filtro por estado */}
        <Select
          value={filters.status}
          onValueChange={(val) => setFilters({ ...filters, status: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por especialidad */}
        <Select
          value={filters.specialty}
          onValueChange={(val) => setFilters({ ...filters, specialty: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            {specialtyOptions.map((esp) => (
              <SelectItem key={esp} value={esp}>
                {esp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Cargando derivaciones SIGTE...</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && filteredDerivations.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay derivaciones registradas para este paciente.
          </p>
        )}

        {!loading &&
          !error &&
          filteredDerivations.map((derivation) => (
            <div key={derivation.id} className="p-4 rounded-lg border border-gray-200 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {derivation.especialidad}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Enviada el {derivation.fechaEnvio}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(derivation.prioridad)}>
                    {derivation.prioridad}
                  </Badge>
                  <Badge className={getStatusColor(derivation.estado)}>
                    {derivation.estado}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Profesional que deriva:{" "}
                  </span>
                  <span className="text-sm text-foreground">
                    {derivation.profesionalDerivaNombre}
                  </span>
                </div>
                {derivation.fechaAsignada && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Fecha asignada:{" "}
                    </span>
                    <span className="text-sm font-medium text-success">
                      {derivation.fechaAsignada}
                    </span>
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
