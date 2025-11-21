"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function Examinations({ rut, onBack, compact = false }) {
  const [filter, setFilter] = useState("all")

  const laboratorio = [
    {
      id: 1,
      fecha: "10/03/2024",
      tipo: "Hemograma completo",
      resultado: "Normal",
      detalles: "Glóbulos blancos: 7.200/mm³, Hemoglobina: 13.5 g/dL",
      profesional: "Dr. Pedro González",
      estado: "Informado",
    },
    {
      id: 2,
      fecha: "10/03/2024",
      tipo: "Perfil lipídico",
      resultado: "Colesterol elevado",
      detalles: "Colesterol total: 245 mg/dL, LDL: 165 mg/dL, HDL: 45 mg/dL",
      profesional: "Dr. Pedro González",
      estado: "Informado",
    },
  ]

  const imagenologia = [
    {
      id: 1,
      tipo: "Radiografía de tórax",
      fecha: "05/01/2024",
      informe: "Infiltrado pulmonar bilateral compatible con proceso infeccioso. Silueta cardíaca normal.",
      profesional: "Dr. Andrés Medina",
      estado: "Informado",
    },
  ]

  if (compact) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Laboratorio</h4>
          {laboratorio.map((exam) => (
            <div key={exam.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{exam.tipo}</p>
              <p className="text-muted-foreground">{exam.fecha}</p>
              <p className="text-foreground mt-1">{exam.resultado}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Imagenología</h4>
          {imagenologia.map((img) => (
            <div key={img.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{img.tipo}</p>
              <p className="text-muted-foreground">{img.fecha}</p>
            </div>
          ))}
        </div>
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
          <h3 className="text-xl font-semibold text-foreground">Exámenes</h3>
          <p className="text-sm text-muted-foreground mt-1">Resultados de laboratorio e imagenología</p>
        </div>
      </div>

      <Tabs defaultValue="laboratorio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="laboratorio">Laboratorio</TabsTrigger>
          <TabsTrigger value="imagenologia">Imagenología</TabsTrigger>
        </TabsList>

        <TabsContent value="laboratorio" className="mt-6">
          <div className="mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="informado">Informados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {laboratorio.map((exam) => (
              <div key={exam.id} className="p-4 rounded-lg border border-gray-200 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">{exam.tipo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{exam.fecha}</p>
                  </div>
                  <Badge variant={exam.estado === "Informado" ? "secondary" : "default"}>{exam.estado}</Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Resultado: </span>
                    <span className="text-sm text-foreground">{exam.resultado}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{exam.detalles}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <span className="text-xs text-muted-foreground">Validado por: {exam.profesional}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="imagenologia" className="mt-6">
          <div className="space-y-4">
            {imagenologia.map((img) => (
              <div key={img.id} className="p-4 rounded-lg border border-gray-200 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">{img.tipo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{img.fecha}</p>
                  </div>
                  <Badge variant="secondary">{img.estado}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded bg-muted/50">
                    <p className="text-sm font-medium text-foreground mb-1">Informe radiológico:</p>
                    <p className="text-sm text-foreground leading-relaxed">{img.informe}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Informado por: {img.profesional}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
