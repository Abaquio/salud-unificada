"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export default function HospitalAttentions({ rut, onBack, compact }) {
  const [urgencias, setUrgencias] = useState([])
  const [consultasCAE, setConsultasCAE] = useState([])
  const [hospitalizaciones, setHospitalizaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!rut) {
      setUrgencias([])
      setConsultasCAE([])
      setHospitalizaciones([])
      setError("")
      return
    }

    const fetchHospitalData = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/patient/${rut}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(
            data.message || "No se pudieron cargar las atenciones hospitalarias"
          )
        }

        // ---------- URGENCIAS ----------
        const rawUrg = data?.core?.urgencias ?? []
        const mappedUrg = rawUrg.map((u, idx) => {
          // Fecha y hora de ingreso (o campo fecha_hora_ingreso si lo tuvieras)
          let fechaTexto = ""
          if (u.fecha_ingreso && u.hora_ingreso) {
            const d = new Date(`${u.fecha_ingreso}T${u.hora_ingreso}`)
            const fecha = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            const hora = d.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })
            fechaTexto = `${fecha} ${hora}`
          } else if (u.fecha_ingreso) {
            const d = new Date(u.fecha_ingreso)
            const fecha = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            fechaTexto = `${fecha}`
          }

          const profesionalNombre =
            u.profesional_nombre ||
            u.profesional_hosp?.nombre_completo ||
            "Profesional hospitalario"

          return {
            id: u.id_urgencia || u.id || idx,
            fecha: fechaTexto || "Sin fecha",
            motivo: u.motivo_consulta || u.motivo || "Sin motivo registrado",
            diagnostico:
              u.diagnostico_urgencia ||
              u.diagnostico_egreso ||
              u.diagnostico_principal ||
              "Sin diagnóstico registrado",
            procedimientos: u.procedimientos || "Sin procedimientos registrados",
            profesional: profesionalNombre,
            indicaciones:
              u.indicaciones ||
              u.indicaciones_egreso ||
              "Sin indicaciones registradas",
            resultado: u.resultado_atencion || u.resultado || "Alta",
          }
        })

        // ---------- CONSULTAS CAE ----------
        const rawCae = data?.core?.consultas_cae ?? []
        const mappedCae = rawCae.map((c, idx) => {
          let fechaTexto = ""
          if (c.fecha_hora) {
            const d = new Date(c.fecha_hora)
            const fecha = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            const hora = d.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })
            fechaTexto = `${fecha} ${hora}`
          }

          const profesionalNombre =
            c.profesional_nombre ||
            c.profesional_hosp?.nombre_completo ||
            "Profesional hospitalario"

          const especialidadNombre =
            c.especialidad_nombre ||
            c.especialidad_hosp?.nombre ||
            "Especialidad no especificada"

          return {
            id: c.id_consulta || c.id || idx,
            especialidad: especialidadNombre,
            fecha: fechaTexto || "Sin fecha",
            profesional: profesionalNombre,
            diagnostico:
              c.diagnostico_principal ||
              c.diagnostico ||
              "Sin diagnóstico registrado",
            actividades: c.actividades || "Sin actividades registradas",
            plan: c.plan_indicado || "Sin plan indicado registrado",
            indicaciones:
              c.indicaciones || "Sin indicaciones registradas",
          }
        })

        // ---------- HOSPITALIZACIONES ----------
        const rawHosp = data?.core?.hospitalizaciones ?? []
        const mappedHosp = rawHosp.map((h, idx) => {
          let fechaIngreso = ""
          let fechaAlta = ""
          let ingresoTexto = ""
          let altaTexto = ""

          if (h.fecha_ingreso) {
            const d = h.hora_ingreso
              ? new Date(`${h.fecha_ingreso}T${h.hora_ingreso}`)
              : new Date(h.fecha_ingreso)
            const fecha = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            const hora = d.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })
            fechaIngreso = fecha
            ingresoTexto = h.hora_ingreso ? `${fecha} ${hora}` : fecha
          }

          if (h.fecha_alta) {
            const d = h.hora_alta
              ? new Date(`${h.fecha_alta}T${h.hora_alta}`)
              : new Date(h.fecha_alta)
            const fecha = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            const hora = d.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })
            fechaAlta = fecha
            altaTexto = h.hora_alta ? `${fecha} ${hora}` : fecha
          }

          const servicioNombre =
            h.servicio_nombre ||
            h.servicio_clinico?.nombre ||
            "Servicio clínico no especificado"

          return {
            id: h.id_hosp || h.id_hospitalizacion || h.id || idx,
            fechaIngreso: fechaIngreso || "Sin fecha ingreso",
            fechaAlta: fechaAlta || "Sin fecha alta",
            ingresoTexto: ingresoTexto || "Sin fecha ingreso",
            altaTexto: altaTexto || "",
            cama: h.cama || "Cama no registrada",
            sala: h.sala || "Sala no registrada",
            servicio: servicioNombre,
            diagnosticoIngreso:
              h.diagnostico_ingreso ||
              h.diagnostico_principal ||
              "Sin diagnóstico de ingreso registrado",
            diagnosticoAlta:
              h.diagnostico_egreso ||
              h.diagnostico_alta ||
              "Sin diagnóstico de alta registrado",
            evolucion:
              h.evolucion_resumen ||
              h.evolucion ||
              "Sin evolución registrada",
            estaAlta: Boolean(h.fecha_alta),
          }
        })

        setUrgencias(mappedUrg)
        setConsultasCAE(mappedCae)
        setHospitalizaciones(mappedHosp)
      } catch (err) {
        console.error(err)
        setError(
          err.message || "Error al cargar las atenciones hospitalarias"
        )
        setUrgencias([])
        setConsultasCAE([])
        setHospitalizaciones([])
      } finally {
        setLoading(false)
      }
    }

    fetchHospitalData()
  }, [rut])

  // ----- MODO COMPACTO (igual diseño) -----
  if (compact) {
    if (loading) {
      return (
        <p className="text-xs text-muted-foreground">
          Cargando atenciones hospitalarias...
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
            Urgencias
          </h4>
          {urgencias.map((urgencia) => (
            <div
              key={urgencia.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">
                {urgencia.fecha}
              </p>
              <p className="text-foreground">{urgencia.diagnostico}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Consultas CAE
          </h4>
          {consultasCAE.map((consulta) => (
            <div
              key={consulta.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">
                {consulta.especialidad}
              </p>
              <p className="text-muted-foreground">{consulta.fecha}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Hospitalizaciones
          </h4>
          {hospitalizaciones.map((hosp) => (
            <div
              key={hosp.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">
                {hosp.servicio}
              </p>
              <p className="text-muted-foreground">
                {hosp.fechaIngreso} - {hosp.fechaAlta}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ----- VISTA COMPLETA (mismo diseño, más datos) -----
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
        <h3 className="text-xl font-semibold text-foreground">
          Atenciones Hospitalarias (CORE)
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Historial de atenciones a nivel hospitalario
        </p>
      </div>

      <Tabs defaultValue="urgencias" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="urgencias">Urgencias</TabsTrigger>
          <TabsTrigger value="consultas">Consultas CAE</TabsTrigger>
          <TabsTrigger value="hospitalizaciones">Hospitalizaciones</TabsTrigger>
        </TabsList>

        {/* URGENCIAS */}
        <TabsContent value="urgencias" className="mt-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Cargando urgencias...
            </p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {urgencias.map((urgencia) => (
                <div
                  key={urgencia.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {urgencia.fecha}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {urgencia.profesional}
                      </p>
                    </div>
                    <Badge
                      variant={
                        urgencia.resultado === "Alta" ? "secondary" : "default"
                      }
                    >
                      {urgencia.resultado}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Motivo de consulta:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {urgencia.motivo}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Diagnóstico:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {urgencia.diagnostico}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Procedimientos:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {urgencia.procedimientos}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Indicaciones: </span>
                        {urgencia.indicaciones}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {urgencias.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay urgencias registradas para este paciente.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* CONSULTAS CAE */}
        <TabsContent value="consultas" className="mt-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Cargando consultas CAE...
            </p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {consultasCAE.map((consulta) => (
                <div
                  key={consulta.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {consulta.especialidad}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {consulta.fecha}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Profesional:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {consulta.profesional}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Diagnóstico:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {consulta.diagnostico}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Actividades:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {consulta.actividades}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Indicaciones:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {consulta.indicaciones}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Plan indicado: </span>
                        {consulta.plan}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {consultasCAE.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay consultas CAE registradas para este paciente.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* HOSPITALIZACIONES */}
        <TabsContent value="hospitalizaciones" className="mt-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Cargando hospitalizaciones...
            </p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {hospitalizaciones.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h4 className="text-base font-semibold text-foreground">
                        {hosp.servicio}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {hosp.ingresoTexto}
                        </Badge>
                        {hosp.estaAlta && hosp.altaTexto && (
                          <Badge className="bg-green-100 text-green-800 border border-green-200">
                            {hosp.altaTexto}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hosp.sala} • {hosp.cama}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Diagnóstico de ingreso:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {hosp.diagnosticoIngreso}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Diagnóstico de alta:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {hosp.diagnosticoAlta}
                      </span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Evolución (resumen):
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {hosp.evolucion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {hospitalizaciones.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay hospitalizaciones registradas para este paciente.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
