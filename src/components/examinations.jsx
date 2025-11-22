// frontend/components/examinations.jsx
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export default function Examinations({ rut, onBack, compact = false }) {
  const [filter, setFilter] = useState("all")
  const [laboratorio, setLaboratorio] = useState([])
  const [imagenologia, setImagenologia] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!rut) {
      setLaboratorio([])
      setImagenologia([])
      setError("")
      return
    }

    const fetchExams = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/patient/${rut}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "No se pudieron cargar los exámenes")
        }

        // ---------- LABORATORIO ----------
        const rawLab = data?.core?.examenes_laboratorio ?? []
        const mappedLab = rawLab.map((exam, idx) => {
          // fecha_solicitud → dd/mm/yyyy
          let fechaTexto = ""
          if (exam.fecha_solicitud) {
            const d = new Date(exam.fecha_solicitud)
            fechaTexto = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          }

          // detalle_resultados puede venir como JSONB
          let detallesTexto = ""
          if (exam.detalle_resultados) {
            if (typeof exam.detalle_resultados === "object") {
              const entries = Object.entries(exam.detalle_resultados)
              detallesTexto =
                entries
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ") || "Sin detalles disponibles"
            } else {
              detallesTexto = exam.detalle_resultados
            }
          } else {
            detallesTexto = "Sin detalles disponibles"
          }

          const profesionalNombre =
            exam.profesional_nombre ||
            exam.profesional_hosp?.nombre_completo ||
            "Profesional de laboratorio"

          return {
            id: exam.id_examen_lab || exam.id || idx,
            fecha: fechaTexto || "Sin fecha",
            tipo: exam.nombre_examen || exam.tipo_examen || "Examen de laboratorio",
            resultado: exam.resultado || "Sin resultado informado",
            detalles: detallesTexto,
            rango: exam.rango_referencia || "Sin rango de referencia",
            unidad: exam.unidad_medida || "",
            profesional: profesionalNombre,
            estado: exam.estado || "Pendiente",
          }
        })

        // ---------- IMAGENOLOGÍA ----------
        const rawImg = data?.core?.examenes_imagen ?? []
        const mappedImg = rawImg.map((img, idx) => {
          let fechaTexto = ""
          if (img.fecha_toma) {
            const d = new Date(img.fecha_toma)
            fechaTexto = d.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          }

          const profesionalNombre =
            img.profesional_nombre ||
            img.profesional_hosp?.nombre_completo ||
            "Profesional informante"

          const informeBase = img.informe || img.informe_detalle || "Sin informe disponible"
          const conclusion = img.conclusion ? `Conclusión: ${img.conclusion}` : ""
          const informeCompleto = [informeBase, conclusion].filter(Boolean).join(" ")

          return {
            id: img.id_examen_img || img.id || idx,
            tipo: img.nombre_examen || img.tipo_examen || "Examen de imagen",
            fecha: fechaTexto || "Sin fecha",
            informe: informeCompleto,
            profesional: profesionalNombre,
            estado: img.estado || "Pendiente",
          }
        })

        setLaboratorio(mappedLab)
        setImagenologia(mappedImg)
      } catch (err) {
        console.error(err)
        setError(err.message || "Error al cargar los exámenes")
        setLaboratorio([])
        setImagenologia([])
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [rut])

  // --- FILTRO POR ESTADO EN LABORATORIO (sin tocar diseño) ---
  const filteredLaboratorio = laboratorio.filter((exam) => {
    if (filter === "all") return true
    const estadoLower = (exam.estado || "").toLowerCase()
    if (filter === "informado" || filter === "validado")
      return estadoLower === "informado" || estadoLower === "validado"
    if (filter === "pendiente") return estadoLower === "pendiente"
    return true
  })

  // ==== MODO COMPACTO ====
  if (compact) {
    if (loading) {
      return (
        <p className="text-xs text-muted-foreground">
          Cargando exámenes...
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
            Laboratorio
          </h4>
          {laboratorio.map((exam) => (
            <div
              key={exam.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">
                {exam.tipo}
              </p>
              <p className="text-muted-foreground">{exam.fecha}</p>
              <p className="text-foreground mt-1">{exam.resultado}</p>
            </div>
          ))}
          {laboratorio.length === 0 && !loading && !error && (
            <p className="text-xs text-muted-foreground">
              No hay exámenes de laboratorio registrados.
            </p>
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">
            Imagenología
          </h4>
          {imagenologia.map((img) => (
            <div
              key={img.id}
              className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2"
            >
              <p className="font-medium text-foreground mb-1">
                {img.tipo}
              </p>
              <p className="text-muted-foreground">{img.fecha}</p>
            </div>
          ))}
          {imagenologia.length === 0 && !loading && !error && (
            <p className="text-xs text-muted-foreground">
              No hay exámenes de imagen registrados.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ==== VISTA COMPLETA ====
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Exámenes
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Resultados de laboratorio e imagenología
          </p>
        </div>
      </div>

      <Tabs defaultValue="laboratorio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="laboratorio">Laboratorio</TabsTrigger>
          <TabsTrigger value="imagenologia">Imagenología</TabsTrigger>
        </TabsList>

        {/* === LABORATORIO === */}
        <TabsContent value="laboratorio" className="mt-6">
          <div className="mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="informado">Validados / Informados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">
              Cargando exámenes de laboratorio...
            </p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="space-y-4">
            {!loading &&
              !error &&
              filteredLaboratorio.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {exam.tipo}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exam.fecha}
                      </p>
                    </div>
                    <Badge
                      variant={
                        exam.estado.toLowerCase() === "pendiente"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {exam.estado}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Resultado:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {exam.resultado}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {exam.detalles}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Rango de referencia:{" "}
                      </span>
                      <span className="text-sm text-foreground">
                        {exam.rango}
                        {exam.unidad ? ` (${exam.unidad})` : ""}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <span className="text-xs text-muted-foreground">
                        Validado por: {exam.profesional}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {!loading && !error && filteredLaboratorio.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay exámenes de laboratorio que coincidan con el filtro
                seleccionado.
              </p>
            )}
          </div>
        </TabsContent>

        {/* === IMAGENOLOGÍA === */}
        <TabsContent value="imagenologia" className="mt-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Cargando exámenes de imagen...
            </p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="space-y-4">
            {!loading &&
              !error &&
              imagenologia.map((img) => (
                <div
                  key={img.id}
                  className="p-4 rounded-lg border border-gray-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {img.tipo}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {img.fecha}
                      </p>
                    </div>
                    <Badge variant="secondary">{img.estado}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Informe radiológico:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {img.informe}
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground">
                        Informado por: {img.profesional}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {!loading && !error && imagenologia.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay exámenes de imagen registrados para este paciente.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
