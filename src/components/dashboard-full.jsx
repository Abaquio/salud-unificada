"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Search,
  TrendingUp,
  Calendar,
  Activity,
  LogIn,
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

// Pequeño componente para el gráfico de torta de zonas
function ZonePie({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay información de zona para los RUT buscados este mes.
      </p>
    )
  }

  const total = data.reduce((acc, item) => acc + item.count, 0) || 1
  const colors = [
    "#6366F1", // indigo
    "#22C55E", // green
    "#F97316", // orange
    "#EC4899", // pink
    "#0EA5E9", // sky
    "#A855F7", // purple
  ]

  let current = 0
  const segments = data.map((item, idx) => {
    const pct = (item.count / total) * 100
    const start = current
    const end = current + pct
    current = end
    return `${colors[idx % colors.length]} ${start}% ${end}%`
  })

  const backgroundImage = `conic-gradient(${segments.join(",")})`

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div
        className="w-40 h-40 rounded-full shadow-inner border border-gray-200"
        style={{ backgroundImage }}
      />
      <div className="space-y-2 w-full">
        {data.map((item, idx) => {
          const pct = ((item.count / total) * 100).toFixed(1)
          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="font-medium text-foreground">
                  {item.zone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono">
                  {item.count}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardFull({ onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/api/dashboard/full`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Error al obtener estadísticas")
        }

        setStats(data)
      } catch (e) {
        console.error("Error cargando dashboard full:", e)
        setError(
          e.message ||
            "No se pudieron cargar las estadísticas detalladas del panel de control."
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const searchesThisMonth = stats?.searchesThisMonth ?? 0
  const searchesLastMonth = stats?.searchesLastMonth ?? 0
  const topUser = stats?.topUser ?? null
  const topRole = stats?.topRole ?? null
  const searchesByRole = stats?.searchesByRole ?? []
  const searchesByDay = stats?.searchesByDay ?? []
  const searchesByWeek = stats?.searchesByWeek ?? []
  const topLoginUsers = stats?.topLoginUsers ?? []
  const searchesByZone = stats?.searchesByZone ?? []

  let percentageChange = 0
  if (searchesLastMonth === 0 && searchesThisMonth > 0) {
    percentageChange = 100
  } else if (searchesLastMonth > 0) {
    percentageChange =
      ((searchesThisMonth - searchesLastMonth) / searchesLastMonth) * 100
  }

  const maxDaily =
    searchesByDay.length > 0
      ? Math.max(...searchesByDay.map((d) => d.searches))
      : 1

  const maxWeekSearches =
    searchesByWeek.length > 0
      ? Math.max(...searchesByWeek.map((w) => w.searches))
      : 1

  const maxLogin =
    topLoginUsers.length > 0
      ? Math.max(...topLoginUsers.map((u) => u.logins))
      : 1

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full overflow-y-auto bg-background px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Panel de Control – Vista completa
            </h1>
            <p className="text-muted-foreground mt-1">
              Estadísticas detalladas de uso del sistema Salud Unificada
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="space-y-6 max-w-6xl mx-auto pb-8">
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Stats principales */}
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

            {/* Usuario más activo */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Usuario más activo (búsquedas)
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

            {/* Rol más activo */}
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

          {/* Búsquedas diarias del mes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Búsquedas Diarias del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {searchesByDay.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay búsquedas registradas en este mes."}
                  </div>
                )}
                {searchesByDay.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 gap-2"
                  >
                    <div className="text-xs font-medium text-foreground">
                      {item.searches}
                    </div>
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                      style={{
                        height: maxDaily
                          ? `${(item.searches / maxDaily) * 100}%`
                          : "0%",
                      }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {item.day}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendencia semanal + Distribución geográfica (torta) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tendencia semanal de búsquedas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-3">
                  {searchesByWeek.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      {loading
                        ? "Cargando..."
                        : "No hay búsquedas registradas en este mes."}
                    </div>
                  )}
                  {searchesByWeek.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 gap-2"
                    >
                      <div className="text-sm font-medium text-foreground">
                        {item.searches}
                      </div>
                      <div className="w-full relative">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all hover:opacity-80"
                          style={{
                            height: maxWeekSearches
                              ? `${(item.searches / maxWeekSearches) * 140}px`
                              : "0px",
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.week}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Distribución geográfica de RUT buscados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ZonePie data={searchesByZone} />
              </CardContent>
            </Card>
          </div>

          {/* Top 5 logins + Búsquedas por rol en la misma fila */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 logins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-orange-600" />
                  Top 5 usuarios con más logins exitosos (este mes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLoginUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay logins exitosos registrados en este mes."}
                  </p>
                )}
                <div className="space-y-4">
                  {topLoginUsers.map((user, index) => (
                    <div key={user.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <span className="text-muted-foreground font-mono">
                          {user.logins} logins
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all"
                          style={{
                            width: maxLogin
                              ? `${(user.logins / maxLogin) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Búsquedas por rol */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Búsquedas por rol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchesByRole.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {loading
                        ? "Cargando..."
                        : "No hay búsquedas registradas en este mes."}
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
                          className="bg-primary h-2 rounded-full transition-all"
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
          </div>
        </div>
      </div>
    </div>
  )
}
