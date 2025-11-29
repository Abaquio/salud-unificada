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
  Download,
} from "lucide-react"

// MUI
import Box from "@mui/material/Box"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { PieChart } from "@mui/x-charts/PieChart"

// Excel
import * as XLSX from "xlsx"

const API_URL = import.meta.env.VITE_API_URL

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

  const now = new Date()
  const monthFormatterLong = new Intl.DateTimeFormat("es-CL", {
    month: "long",
  })
  const monthFormatterShort = new Intl.DateTimeFormat("es-CL", {
    month: "short",
  })

  const currentMonthName = monthFormatterLong.format(now).toUpperCase()
  const currentMonthShort = monthFormatterShort.format(now).toUpperCase()

  const dailyLabels = searchesByDay.map((d) => `${d.day} ${currentMonthShort}`)
  const dailyValues = searchesByDay.map((d) => d.searches)

  const weeklyLabels = searchesByWeek.map((w) => w.week)
  const weeklyValues = searchesByWeek.map((w) => w.searches)

  const zonePieData = searchesByZone
    .filter(
      (z) =>
        z.zone &&
        z.zone.toLowerCase() !== "zona desconocida" &&
        z.zone.toLowerCase() !== "desconocida"
    )
    .map((z, idx) => ({
      id: idx,
      value: z.count,
      label: z.zone,
    }))

  const topLoginLabels = topLoginUsers.map((u) => u.name)
  const topLoginValues = topLoginUsers.map((u) => u.logins)

  const roleLabels = searchesByRole.map((r) => r.role)
  const roleValues = searchesByRole.map((r) => r.count)

  const totalRoleSearches = roleValues.reduce((acc, v) => acc + v, 0)
  const rolePercentages =
    totalRoleSearches > 0
      ? roleValues.map((v) => (v * 100) / totalRoleSearches)
      : roleValues.map(() => 0)

  const zoneValueFormatter = (item) => `${item.value} búsquedas`

  // Colores para el gráfico de Top Logins (uno por usuario)
  const loginBarColors = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"]

  // ===================== EXPORTAR A EXCEL (XLSX) =====================
  const handleExport = () => {
    if (!stats) {
      alert("Los datos aún se están cargando. Intenta nuevamente en unos segundos.")
      return
    }

    // ---- Hoja RESUMEN ----
    const resumenSheetData = [
      ["Resumen general del dashboard"],
      [],
      ["Métrica", "Valor"],
      ["Búsquedas este mes", searchesThisMonth],
      ["Búsquedas mes anterior", searchesLastMonth],
      [
        "Variación %",
        Number.isFinite(percentageChange)
          ? `${percentageChange.toFixed(1)}%`
          : "0%",
      ],
      [],
      ["Usuario más activo (búsquedas)"],
      [],
      ["Nombre", "Rol", "Búsquedas"],
    ]

    if (topUser) {
      resumenSheetData.push([
        topUser.name || "Sin datos",
        topUser.role || "Sin rol",
        topUser.searches ?? 0,
      ])
    } else {
      resumenSheetData.push(["Sin datos", "", ""])
    }

    resumenSheetData.push([], ["Rol más activo"], [], ["Rol", "Búsquedas", "Porcentaje"])

    if (topRole) {
      resumenSheetData.push([
        topRole.name || "Sin datos",
        topRole.searches ?? 0,
        topRole.percentage != null ? `${topRole.percentage}%` : "",
      ])
    } else {
      resumenSheetData.push(["Sin datos", "", ""])
    }

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenSheetData)

    // ---- Hoja BÚSQUEDAS DIARIAS ----
    const dailySheetData = [
      ["Búsquedas diarias del mes"],
      [`Mes: ${currentMonthName}`],
      [],
      ["Día", "Búsquedas"],
      ...searchesByDay.map((d) => [`${d.day} ${currentMonthShort}`, d.searches]),
    ]
    const dailySheet = XLSX.utils.aoa_to_sheet(dailySheetData)

    // ---- Hoja SEMANAS ----
    const weeklySheetData = [
      ["Tendencia semanal de búsquedas"],
      [],
      ["Semana", "Búsquedas"],
      ...searchesByWeek.map((w) => [w.week, w.searches]),
    ]
    const weeklySheet = XLSX.utils.aoa_to_sheet(weeklySheetData)

    // ---- Hoja TOP LOGINS ----
    const loginsSheetData = [
      ["Top 5 usuarios con más logins exitosos (este mes)"],
      [],
      ["Usuario", "Logins"],
      ...topLoginUsers.map((u) => [u.name, u.logins]),
    ]
    const loginsSheet = XLSX.utils.aoa_to_sheet(loginsSheetData)

    // ---- Hoja ROLES ----
    const rolesSheetData = [
      ["Búsquedas por rol"],
      [],
      ["Rol", "Búsquedas", "% del total"],
      ...roleLabels.map((label, idx) => [
        label,
        roleValues[idx],
        Number.isFinite(rolePercentages[idx])
          ? `${rolePercentages[idx].toFixed(1)}%`
          : "0%",
      ]),
    ]
    const rolesSheet = XLSX.utils.aoa_to_sheet(rolesSheetData)

    // ---- Hoja ZONAS ----
    const zonasSheetData = [
      ["Distribución geográfica de RUT buscados"],
      [],
      ["Zona", "Búsquedas"],
      ...searchesByZone.map((z) => [z.zone || "Sin zona", z.count]),
    ]
    const zonasSheet = XLSX.utils.aoa_to_sheet(zonasSheetData)

    // Crear libro y añadir hojas
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, resumenSheet, "Resumen")
    XLSX.utils.book_append_sheet(wb, dailySheet, "Busquedas_diarias")
    XLSX.utils.book_append_sheet(wb, weeklySheet, "Semanas")
    XLSX.utils.book_append_sheet(wb, loginsSheet, "Top_logins")
    XLSX.utils.book_append_sheet(wb, rolesSheet, "Roles")
    XLSX.utils.book_append_sheet(wb, zonasSheet, "Zonas")

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `dashboard_salud_unificada_${now
      .toISOString()
      .slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white border-none"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-1" />
              exportar
            </Button>

            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="space-y-6 max-w-6xl mx-auto pb-8">
          {error && <p className="text-sm text-red-500">{error}</p>}

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
              <p className="text-xs text-muted-foreground mt-1">
                Mes actual: <span className="font-semibold">{currentMonthName}</span>
              </p>
            </CardHeader>
            <CardContent>
              {dailyValues.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? "Cargando..."
                    : "No hay búsquedas registradas en este mes."}
                </p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <LineChart
                    xAxis={[
                      {
                        data: dailyLabels,
                        scaleType: "point",
                      },
                    ]}
                    yAxis={[{ width: 40 }]}
                    series={[
                      {
                        data: dailyValues,
                        label: "Búsquedas",
                        color: "#2563eb",
                      },
                    ]}
                    margin={{ right: 24 }}
                    width={720}
                    height={260}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tendencia semanal + Distribución geográfica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia semanal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tendencia semanal de búsquedas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyValues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay búsquedas registradas en este mes."}
                  </p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <BarChart
                      xAxis={[
                        {
                          data: weeklyLabels,
                          scaleType: "band",
                        },
                      ]}
                      series={[
                        {
                          data: weeklyValues,
                          label: "Búsquedas",
                          color: "#22c55e",
                        },
                      ]}
                      width={600}
                      height={260}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribución geográfica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Distribución geográfica de RUT buscados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {zonePieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay información de zona para los RUT buscados este mes."}
                  </p>
                ) : (
                  <div className="flex justify-center">
                    <PieChart
                      series={[
                        {
                          data: zonePieData,
                          innerRadius: 40,
                          outerRadius: 80,
                          paddingAngle: 2,
                          cornerRadius: 2,
                          highlightScope: { fade: "global", highlight: "item" },
                          faded: {
                            innerRadius: 40,
                            additionalRadius: -20,
                            color: "gray",
                          },
                          valueFormatter: zoneValueFormatter,
                        },
                      ]}
                      width={360}
                      height={260}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top 5 logins + Búsquedas por rol */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 logins – ahora VERTICAL y con un color por barra */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-orange-600" />
                  Top 5 usuarios con más logins exitosos (este mes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLoginValues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay logins exitosos registrados en este mes."}
                  </p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <BarChart
                      // layout por defecto: vertical
                      xAxis={[
                        {
                          scaleType: "band",
                          data: topLoginLabels,
                          colorMap: {
                            type: "ordinal",
                            values: topLoginLabels,
                            colors: loginBarColors.slice(
                              0,
                              topLoginLabels.length
                            ),
                          },
                        },
                      ]}
                      yAxis={[{}]}
                      series={[
                        {
                          data: topLoginValues,
                          label: "Logins",
                        },
                      ]}
                      width={600}
                      height={260}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Búsquedas por rol */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Búsquedas por rol</CardTitle>
              </CardHeader>
              <CardContent>
                {roleValues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Cargando..."
                      : "No hay búsquedas registradas en este mes."}
                  </p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Box sx={{ width: "100%", height: 260 }}>
                      <LineChart
                        series={[
                          {
                            data: roleValues,
                            label: "Búsquedas",
                            color: "#2563eb",
                          },
                          {
                            data: rolePercentages,
                            label: "% del total",
                            color: "#f97316",
                          },
                        ]}
                        xAxis={[{ scaleType: "point", data: roleLabels }]}
                        yAxis={[{ width: 40 }]}
                        margin={{ right: 24 }}
                        height={260}
                      />
                    </Box>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
