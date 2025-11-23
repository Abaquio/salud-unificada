"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function PatientHistory({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Datos de ejemplo del historial de búsquedas
  const historyData = [
    { id: 1, rut: "12.345.678-9", nombre: "María Isabel González Fernández", ciudad: "Santiago" },
    { id: 2, rut: "98.765.432-1", nombre: "Carlos Alberto Muñoz Pérez", ciudad: "Valparaíso" },
    { id: 3, rut: "15.678.234-5", nombre: "Ana Patricia Rojas Silva", ciudad: "Concepción" },
    { id: 4, rut: "20.123.456-7", nombre: "José Miguel Hernández Castro", ciudad: "La Serena" },
    { id: 5, rut: "18.765.432-0", nombre: "Claudia Andrea Espinoza Torres", ciudad: "Temuco" },
    { id: 6, rut: "22.456.789-3", nombre: "Roberto Carlos Díaz Morales", ciudad: "Antofagasta" },
    { id: 7, rut: "11.234.567-8", nombre: "Patricia Elena Ramírez Vega", ciudad: "Rancagua" },
    { id: 8, rut: "19.876.543-2", nombre: "Luis Fernando Soto Contreras", ciudad: "Puerto Montt" },
  ]

  const filteredHistory = historyData.filter(
    (item) =>
      item.rut.includes(searchTerm) ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 bg-background z-[100] overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-gray-200 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-foreground">Historial de Búsquedas</h2>
            <Badge variant="secondary" className="ml-2">
              {filteredHistory.length} registros
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Buscador */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Buscar en Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Buscar por RUT, nombre o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Tabla de historial */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-secondary/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">RUT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre Completo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ciudad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-foreground">{item.rut}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">{item.nombre}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{item.ciudad}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        No se encontraron resultados para "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
