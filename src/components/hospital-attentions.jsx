"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HospitalAttentions({ rut, onBack, compact }) {
  const urgencias = [
    {
      id: 1,
      fecha: "28/02/2024 22:15",
      motivo: "Dolor torácico",
      diagnostico: "Síndrome coronario agudo descartado - Dolor musculoesquelético",
      profesional: "Dr. Fernando Torres",
      indicaciones: "Analgesia, reposo. Alta a domicilio con control ambulatorio",
      resultado: "Alta",
    },
  ]

  const consultasCAE = [
    {
      id: 1,
      especialidad: "Cardiología",
      fecha: "15/02/2024 10:30",
      profesional: "Dr. Luis Ramírez",
      diagnostico: "Hipertensión arterial etapa 2",
      plan: "Ajuste de terapia antihipertensiva. Control en 2 meses con exámenes",
    },
  ]

  const hospitalizaciones = [
    {
      id: 1,
      fechaIngreso: "05/01/2024",
      fechaAlta: "10/01/2024",
      cama: "Cama 12",
      sala: "Sala Medicina Interna - Piso 3",
      servicio: "Medicina Interna",
      diagnosticoIngreso: "Neumonía adquirida en comunidad",
      diagnosticoAlta: "Neumonía bilateral resuelta",
      evolucion:
        "Paciente evoluciona favorablemente con antibioticoterapia endovenosa. Afebril desde día 3. Mejoría clínica y radiológica.",
    },
  ]

  if (compact) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Urgencias</h4>
          {urgencias.map((urgencia) => (
            <div key={urgencia.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{urgencia.fecha}</p>
              <p className="text-foreground">{urgencia.diagnostico}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Consultas CAE</h4>
          {consultasCAE.map((consulta) => (
            <div key={consulta.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{consulta.especialidad}</p>
              <p className="text-muted-foreground">{consulta.fecha}</p>
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Hospitalizaciones</h4>
          {hospitalizaciones.map((hosp) => (
            <div key={hosp.id} className="p-3 rounded-lg border border-gray-200 bg-card text-xs mb-2">
              <p className="font-medium text-foreground mb-1">{hosp.servicio}</p>
              <p className="text-muted-foreground">
                {hosp.fechaIngreso} - {hosp.fechaAlta}
              </p>
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

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">Atenciones Hospitalarias (CORE)</h3>
        <p className="text-sm text-muted-foreground mt-1">Historial de atenciones a nivel hospitalario</p>
      </div>

      <Tabs defaultValue="urgencias" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="urgencias">Urgencias</TabsTrigger>
          <TabsTrigger value="consultas">Consultas CAE</TabsTrigger>
          <TabsTrigger value="hospitalizaciones">Hospitalizaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="urgencias" className="mt-6">
          <div className="space-y-4">
            {urgencias.map((urgencia) => (
              <div key={urgencia.id} className="p-4 rounded-lg border border-gray-200 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{urgencia.fecha}</p>
                    <p className="text-xs text-muted-foreground mt-1">Dr. {urgencia.profesional}</p>
                  </div>
                  <Badge variant={urgencia.resultado === "Alta" ? "secondary" : "default"}>{urgencia.resultado}</Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Motivo de consulta: </span>
                    <span className="text-sm text-foreground">{urgencia.motivo}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Diagnóstico: </span>
                    <span className="text-sm text-foreground">{urgencia.diagnostico}</span>
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
          </div>
        </TabsContent>

        <TabsContent value="consultas" className="mt-6">
          <div className="space-y-4">
            {consultasCAE.map((consulta) => (
              <div key={consulta.id} className="p-4 rounded-lg border border-gray-200 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">{consulta.especialidad}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{consulta.fecha}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Profesional: </span>
                    <span className="text-sm text-foreground">{consulta.profesional}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Diagnóstico: </span>
                    <span className="text-sm text-foreground">{consulta.diagnostico}</span>
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
          </div>
        </TabsContent>

        <TabsContent value="hospitalizaciones" className="mt-6">
          <div className="space-y-4">
            {hospitalizaciones.map((hosp) => (
              <div key={hosp.id} className="p-4 rounded-lg border border-gray-200 bg-card">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-semibold text-foreground">{hosp.servicio}</h4>
                    <Badge variant="secondary">
                      {hosp.fechaIngreso} - {hosp.fechaAlta}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hosp.sala} • {hosp.cama}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Diagnóstico de ingreso: </span>
                    <span className="text-sm text-foreground">{hosp.diagnosticoIngreso}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Diagnóstico de alta: </span>
                    <span className="text-sm text-foreground">{hosp.diagnosticoAlta}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Evolución (resumen):</p>
                    <p className="text-sm text-foreground leading-relaxed">{hosp.evolucion}</p>
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
