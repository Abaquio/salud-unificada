"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Search, TrendingUp, Calendar, ChevronRight } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

function formatRut(rut, dv) {
  if (!rut) return "-"
  const body = String(rut)
  const reversed = body.split("").reverse().join("")
  const chunks = []
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3))
  }
  const withDots = chunks.join(".").split("").reverse().join("")
  return dv ? `${withDots}-${dv}` : withDots
}

function formatDateTime(iso) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Dashboard({ onOpenFull, onOpenHistory }) {
  const [stats, setStats] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        // Resumen + SOLO las últimas N búsquedas (limit=3)
        const [summaryRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/summary`),
          fetch(`${API_URL}/api/auditoria/busquedas?limit=3`),
        ])

        if (!summaryRes.ok) {
          throw new Error("No se pudo obtener el resumen del dashboard")
        }

        const summaryData = await summaryRes.json()
        let historyData = historyRes.ok ? await historyRes.json() : []

        if (cancelled) return

        historyData = Array.isArray(historyData) ? historyData : []

        // Ordenamos por fecha/hora desc por si el backend no lo hace
        historyData.sort((a, b) => {
          const da = new Date(a.fecha_hora_busqueda || 0)
          const db = new Date(b.fecha_hora_busqueda || 0)
          return db - da
        })

        const lastThree = historyData.slice(0, 3)

        setStats(summaryData)
        setRecentSearches(lastThree)
      } catch (e) {
        console.error("Error cargando dashboard:", e)
        if (!cancelled) {
          setError("No se pudieron cargar las estadísticas del panel de control.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  const searchesThisMonth = stats?.searchesThisMonth ?? 0
  const searchesLastMonth = stats?.searchesLastMonth ?? 0
  const topUser = stats?.topUser || null
  const topRole = stats?.topRole || null
  const searchesByRole = stats?.searchesByRole || []

  let percentageChange = 0
  if (searchesLastMonth === 0 && searchesThisMonth > 0) {
    percentageChange = 100
  } else if (searchesLastMonth > 0) {
    percentageChange =
      ((searchesThisMonth - searchesLastMonth) / searchesLastMonth) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-muted-foreground mt-1">
            Estadísticas de uso del sistema Salud Unificada
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
          onClick={onOpenFull}
        >
          Ver más
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Stats Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Búsquedas del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Búsquedas este mes
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {loading ? "—" : searchesThisMonth}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={percentageChange >= 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {percentageChange >= 0 ? "+" : ""}
                    {Number.isFinite(percentageChange)
                      ? percentageChange.toFixed(1)
                      : "0"}
                    %
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    vs mes anterior
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuario con más búsquedas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Usuario más activo
                </p>
                <p className="text-xl font-bold text-foreground mt-2">
                  {loading ? "—" : topUser?.name || "Sin datos"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {loading
                    ? "—"
                    : topUser?.role || (topUser ? "Rol no asignado" : "")}
                </p>
                {topUser && (
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-foreground">
                      {topUser.searches} búsquedas
                    </span>
                  </div>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rol con más búsquedas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rol más activo
                </p>
                <p className="text-xl font-bold text-foreground mt-2">
                  {loading ? "—" : topRole?.name || "Sin datos"}
                </p>
                {topRole && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {topRole.percentage}%
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {topRole.searches} búsquedas
                    </span>
                  </div>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsquedas por rol + Búsquedas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Búsquedas por Rol */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Búsquedas por Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchesByRole.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {loading ? "Cargando..." : "Sin datos de este mes."}
                </p>
              )}
              {searchesByRole.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {item.role}
                    </span>
                    <span className="text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: searchesThisMonth
                          ? `${(item.count / searchesThisMonth) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Búsquedas Recientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Búsquedas Recientes</CardTitle>
            {onOpenHistory && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-medium"
                onClick={onOpenHistory}
              >
                Ver historial
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  RUT
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  PACIENTE
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  FECHA/HORA
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  USUARIO
                </div>
              </div>
              {recentSearches.length === 0 && (
                <div className="py-3 text-sm text-muted-foreground">
                  {loading ? "Cargando..." : "No hay búsquedas recientes."}
                </div>
              )}
              {recentSearches.map((search, index) => (
                <div
                  key={search.id_busqueda ?? index}
                  className="grid grid-cols-4 gap-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="text-sm font-mono text-foreground">
                    {formatRut(search.rut_buscado, search.dv_buscado)}
                  </div>
                  <div className="text-sm text-foreground">
                    {search.nombre_paciente || "Paciente sin nombre"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(search.fecha_hora_busqueda)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {search.usuario?.nombre_completo || "Usuario desconocido"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
