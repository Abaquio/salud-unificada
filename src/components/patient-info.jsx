"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PatientInfo({ rut }) {
  // Datos de ejemplo - en producción vendría de API
  const patientData = {
    nombre: "María Isabel González Fernández",
    rut: rut,
    edad: 45,
    sexo: "Femenino",
    fechaNacimiento: "15/03/1979",
    direccion: "Av. Libertador Bernardo O'Higgins 1234, Santiago",
    telefono: "+56 9 8765 4321",
    estadoCivil: "Casada",
    medicoCabecera: "Dr. Carlos Martínez",
    sectorAPS: "Sector 3 - CESFAM Centro",
    prevision: "FONASA B",
    discapacidad: "No registra",
    idRayen: "RAY-2024-00543",
    idCore: "CORE-HSR-98765",
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">{patientData.nombre}</h2>
          <p className="text-sm text-muted-foreground">RUT: {patientData.rut}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Paciente Activo
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Edad</label>
            <p className="text-base text-foreground mt-1">{patientData.edad} años</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sexo</label>
            <p className="text-base text-foreground mt-1">{patientData.sexo}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fecha de Nacimiento
            </label>
            <p className="text-base text-foreground mt-1">{patientData.fechaNacimiento}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</label>
            <p className="text-base text-foreground mt-1">{patientData.telefono}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado Civil</label>
            <p className="text-base text-foreground mt-1">{patientData.estadoCivil}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección</label>
            <p className="text-base text-foreground mt-1">{patientData.direccion}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Médico de Cabecera
            </label>
            <p className="text-base text-foreground mt-1">{patientData.medicoCabecera}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sector APS</label>
            <p className="text-base text-foreground mt-1">{patientData.sectorAPS}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Previsión</label>
            <p className="text-base text-foreground mt-1">{patientData.prevision}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Discapacidad</label>
          <p className="text-base text-foreground mt-1">{patientData.discapacidad}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Rayen (APS)</label>
          <p className="text-sm font-mono text-foreground mt-1">{patientData.idRayen}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            ID CORE (Hospital)
          </label>
          <p className="text-sm font-mono text-foreground mt-1">{patientData.idCore}</p>
        </div>
      </div>
    </Card>
  )
}
