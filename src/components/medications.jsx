"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export default function Medications({ rut, compact = false, onBack }) {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!rut) {
      setMedications([])
      setError("")
      return
    }

    const fetchMedications = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/patient/${rut}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "No se pudieron cargar los medicamentos")
        }

        // Medicamentos desde CORE (tabla medicamento_hosp)
        const coreMeds = data?.core?.medicamentos ?? []
        const today = new Date()

        const mapped = coreMeds.map((m, idx) => {
          const fechaInicioDate = m.fecha_inicio ? new Date(m.fecha_inicio) : null
          const fechaTerminoDate = m.fecha_termino ? new Date(m.fecha_termino) : null

          const fechaInicio = fechaInicioDate
            ? fechaInicioDate.toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Sin registro"

          const fechaTermino = fechaTerminoDate
            ? fechaTerminoDate.toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Indefinido"

          const estadoLower = (m.estado || "").toLowerCase()
          // Vigente si estado = 'Vigente' o no tiene fecha de término / es a futuro
          const vigente =
            estadoLower === "vigente" ||
            (!fechaTerminoDate || fechaTerminoDate.getTime() >= today.setHours(0, 0, 0, 0))

          const via = m.via ? `, vía ${m.via}` : ""
          let indicacion = ""
          if (m.dosis && m.frecuencia) {
            indicacion = `${m.dosis}, ${m.frecuencia}${via}`
          } else if (m.dosis || m.frecuencia) {
            indicacion = `${m.dosis || ""} ${m.frecuencia || ""}${via}`.trim()
          } else {
            indicacion = "Sin indicación registrada"
          }

          const profesionalNombre =
            m.profesional_nombre ||
            m.profesional_hosp?.nombre_completo ||
            "Profesional tratante"

          return {
            id: m.id_medicamento || m.id || idx,
            nombre: m.nombre_medicamento || "Medicamento sin nombre",
            origen: m.origen || "Hospital", // si en la tabla viene 'APS', se mostrará como APS
            fechaInicio,
            fechaTermino,
            profesional: profesionalNombre,
            indicacion,
            vigente,
          }
        })

        setMedications(mapped)
      } catch (err) {
        console.error(err)
        setError(err.message || "Error al cargar los medicamentos")
        setMedications([])
      } finally {
        setLoading(false)
      }
    }

    fetchMedications()
  }, [rut])

  const vigentes = medications.filter((m) => m.vigente)
  const historicos = medications.filter((m) => !m.vigente)

  // ================= MODO COMPACTO (sidebar) =================
  if (compact) {
    if (loading) {
      return (
        <p className="text-xs text-muted-foreground">
          Cargando medicamentos...
        </p>
      )
    }

    if (error) {
      return <p className="text-xs text-red-500">{error}</p>
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Vigentes
          </h4>
          {vigentes.map((med) => (
            <div
              key={med.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">{med.nombre}</p>
              <p className="text-muted-foreground">{med.indicacion}</p>
              <Badge
                variant={med.origen === "APS" ? "secondary" : "default"}
                className="mt-2 text-xs"
              >
                {med.origen}
              </Badge>
            </div>
          ))}
          {vigentes.length === 0 && !loading && !error && (
            <p className="text-xs text-muted-foreground">
              No hay medicamentos vigentes registrados.
            </p>
          )}
        </div>

        {historicos.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Históricos
            </h4>
            {historicos.map((med) => (
              <div
                key={med.id}
                className="p-3 rounded-lg border border-gray-200 bg-muted/30 text-xs mb-2"
              >
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

  // ================= VISTA COMPLETA =================
  return (
    <Card className="p-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a Datos del Paciente
        </Button>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">Medicamentos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Prescripciones desde APS y Hospital
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">
          Cargando medicamentos...
        </p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Vigentes */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              Medicamentos Vigentes
              <Badge variant="default" className="bg-success text-white">
                {vigentes.length}
              </Badge>
            </h4>
            <div className="space-y-3">
              {vigentes.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-base font-semibold text-foreground">
                        {med.nombre}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        {med.indicacion}
                      </p>
                    </div>
                    <Badge variant={med.origen === "APS" ? "secondary" : "default"}>
                      {med.origen}
                    </Badge>
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

              {vigentes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay medicamentos vigentes registrados.
                </p>
              )}
            </div>
          </div>

          {/* Históricos */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-4">
              Medicamentos Históricos
            </h4>
            <div className="space-y-3">
              {historicos.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-lg border border-gray-200 bg-muted/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-base font-medium text-foreground">
                        {med.nombre}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        {med.indicacion}
                      </p>
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

              {historicos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay medicamentos históricos registrados.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
