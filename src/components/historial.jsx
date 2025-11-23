"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const API_URL = import.meta.env.VITE_API_URL

export default function PatientHistory({ onClose, currentUserId, isAdmin, onGoToRut }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 6

  const normalizeRut = (rut) => (rut || "").replace(/[^0-9Kk]/g, "").toUpperCase()

  const formatRutInput = (value) => {
    let clean = value.replace(/[^0-9]/g, "")
    if (clean.length > 9) clean = clean.slice(0, 9)
    if (clean.length <= 8) return clean
    return `${clean.slice(0, 8)}-${clean.slice(8)}`
  }

  const handleSearchChange = (e) => {
    const formatted = formatRutInput(e.target.value)
    setSearchTerm(formatted)
    setCurrentPage(1)
  }

  // 🛰️ Cargar historial
  useEffect(() => {
    const fetchHistory = async () => {
      // si NO es admin y no tenemos currentUserId, no hacemos nada
      if (!isAdmin && !currentUserId) return

      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()

        // si no es admin, filtramos por usuarioId
        if (!isAdmin && currentUserId) {
          params.set("usuarioId", currentUserId)
        }

        const queryString = params.toString()
        const url = `${API_URL}/api/auditoria/busquedas${
          queryString ? `?${queryString}` : ""
        }`

        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Error al cargar historial")
        }

        setHistory(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError(err.message || "Error al cargar historial")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [currentUserId, isAdmin])

  // 🧾 Filtrado en el frontend por RUT
  const filteredHistory = history.filter((item) => {
    if (!searchTerm) return true

    const itemRutNorm = normalizeRut(`${item.rut_buscado || ""}${item.dv_buscado || ""}`)
    const searchNorm = normalizeRut(searchTerm)

    return itemRutNorm.includes(searchNorm)
  })

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

  const formatRutDisplay = (rut, dv) => {
    if (!rut) return "-"
    const clean = rut.replace(/\./g, "")
    return dv ? `${clean}-${dv}` : clean
  }

  const formatFecha = (iso) => {
    if (!iso) return "-"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    })
  }

  const handleGoClick = (item) => {
    if (!onGoToRut) return
    const rutFormateado = formatRutDisplay(item.rut_buscado, item.dv_buscado)
    if (rutFormateado && rutFormateado !== "-") {
      onGoToRut(rutFormateado)
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-[100] overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-gray-200 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              type="button"
            >
              <span className="text-lg leading-none">←</span>
              <span>Volver</span>
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
            <CardTitle className="text-lg">Buscar por RUT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              type="text"
              placeholder="11222333-4"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ingresa el RUT sin puntos y con guion antes del dígito verificador.
            </p>
          </CardContent>
        </Card>

        {/* Estado de carga / error */}
        {loading && (
          <p className="mb-4 text-sm text-muted-foreground">
            Cargando historial de búsquedas...
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Tabla de historial */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-secondary/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Fecha búsqueda
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      RUT buscado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Resultado
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length > 0 ? (
                    paginatedHistory.map((item) => (
                      <tr
                        key={item.id_busqueda}
                        className="border-b border-gray-200 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground">
                          {formatFecha(item.fecha_hora_busqueda)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-foreground">
                            {formatRutDisplay(item.rut_buscado, item.dv_buscado)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">
                            {item.nombre_paciente || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">
                            {item.usuario?.nombre_completo || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={item.resultado_encontrado ? "outline" : "destructive"}
                            className="text-xs"
                          >
                            {item.resultado_encontrado ? "Encontrado" : "No encontrado"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleGoClick(item)}
                          >
                            Ir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No se encontraron resultados
                        {searchTerm ? ` para "${searchTerm}"` : ""}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 px-6 py-4">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1
                  return (
                    <Button
                      key={page}
                      type="button"
                      size="sm"
                      variant={page === safeCurrentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
