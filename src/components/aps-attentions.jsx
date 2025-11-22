"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function APSAttentions({ rut, compact = false, onBack }) {
  const [filters, setFilters] = useState({
    professional: "all",
    period: "all",
    activity: "all",
  });

  const [attentions, setAttentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rut) {
      setAttentions([]);
      setError("");
      return;
    }

    const fetchAttentions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/patient/${rut}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "No se pudieron cargar las atenciones APS"
          );
        }

        const apsAttentions = data?.aps?.atenciones ?? [];

        const mapped = apsAttentions.map((a) => {
          // Fecha y hora legible
          let fechaTexto = "";
          const isoDate = a.fecha_atencion;
          const timePart = a.hora_atencion || "00:00";

          if (isoDate) {
            const dateObj = new Date(`${isoDate}T${timePart}`);
            const fecha = dateObj.toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            const hora = dateObj.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            });
            fechaTexto = `${fecha} ${hora}`;
          }

          // Tomamos primero campos “aplanados”, si no, los anidados
          const profesionalNombre =
            a.profesional_nombre ||
            a.profesional_aps?.nombre_completo ||
            "Profesional APS";

          const profesionalTipo =
            a.profesional_tipo ||
            a.profesional_aps?.tipo_profesional_aps?.nombre ||
            "Profesional";

          const establecimientoNombre =
            a.establecimiento_nombre ||
            a.establecimiento_aps?.nombre ||
            "Establecimiento APS";

          return {
            id:
              a.id_atencion ||
              a.id ||
              (typeof crypto !== "undefined"
                ? crypto.randomUUID()
                : `${isoDate || ""}-${timePart}`),
            fecha: fechaTexto || "Sin fecha",
            diagnostico:
              a.diagnostico_principal_text ||
              a.diagnostico_principal ||
              "Sin diagnóstico principal registrado",
            profesional: profesionalNombre,
            tipo: profesionalTipo,
            establecimiento: establecimientoNombre,
            actividad: a.actividades_resumen || "Sin actividad registrada",
            indicaciones: a.indicaciones_resumen || "Sin indicaciones registradas",
            tipoAtencion: a.ambito_atencion || "Atención APS",
          };
        });

        setAttentions(mapped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar las atenciones APS");
        setAttentions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttentions();
  }, [rut]);

  // Filtros en memoria
  const filteredAttentions = attentions.filter((att) => {
    if (filters.professional !== "all") {
      const tipoLower = (att.tipo || "").toLowerCase();
      if (
        filters.professional === "medico" &&
        !tipoLower.includes("médico") &&
        !tipoLower.includes("medico")
      ) {
        return false;
      }
      if (filters.professional === "enfermera" && !tipoLower.includes("enfermer")) {
        return false;
      }
      if (filters.professional === "matrona" && !tipoLower.includes("matron")) {
        return false;
      }
      if (filters.professional === "odontologo" && !tipoLower.includes("odonto")) {
        return false;
      }
    }

    if (filters.period !== "all" && att.fecha) {
      const months = Number(filters.period);
      const limit = new Date();
      limit.setMonth(limit.getMonth() - months);

      const [fechaParte] = att.fecha.split(" ");
      const [dia, mes, anio] = fechaParte.split("/").map(Number);
      if (dia && mes && anio) {
        const attDate = new Date(anio, mes - 1, dia);
        if (attDate < limit) return false;
      }
    }

    if (filters.activity !== "all") {
      const actividadLower = (att.actividad || "").toLowerCase();
      if (filters.activity === "control" && !actividadLower.includes("control")) {
        return false;
      }
      if (filters.activity === "urgencia" && !actividadLower.includes("urgenc")) {
        return false;
      }
      if (
        filters.activity === "consulta" &&
        !actividadLower.includes("consulta") &&
        !actividadLower.includes("evaluación") &&
        !actividadLower.includes("evaluacion")
      ) {
        return false;
      }
    }

    return true;
  });

  // Modo compacto
  if (compact) {
    if (loading) {
      return (
        <p className="text-xs text-muted-foreground">
          Cargando atenciones APS...
        </p>
      );
    }

    if (error) {
      return <p className="text-xs text-red-500">{error}</p>;
    }

    if (filteredAttentions.length === 0) {
      return (
        <p className="text-xs text-muted-foreground">
          No hay atenciones registradas en APS.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {filteredAttentions.map((attention) => (
          <div
            key={attention.id}
            className="p-3 rounded-lg border border-gray-200 bg-card text-xs"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-foreground">
                {attention.fecha}
              </span>
              <Badge
                variant={
                  attention.tipoAtencion === "Urgencia APS"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs"
              >
                {attention.tipoAtencion}
              </Badge>
            </div>
            <p className="text-foreground font-medium mb-1">
              {attention.diagnostico}
            </p>
            <p className="text-muted-foreground">
              {/* tipo afuera, nombre dentro del paréntesis */}
              {attention.tipo} ({attention.profesional}) ·{" "}
              {attention.establecimiento}
            </p>
            <p className="text-muted-foreground mt-1">
              <span className="font-medium">Actividad: </span>
              {attention.actividad}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Vista completa
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

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Atenciones APS (Rayen)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de atenciones en Atención Primaria
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredAttentions.length} atenciones
        </Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          value={filters.professional}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, professional: val }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por profesional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los profesionales</SelectItem>
            <SelectItem value="medico">Médicos</SelectItem>
            <SelectItem value="enfermera">Enfermeras</SelectItem>
            <SelectItem value="matrona">Matronas</SelectItem>
            <SelectItem value="odontologo">Odontólogos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.period}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, period: val }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
            <SelectItem value="24">Últimos 24 meses</SelectItem>
            <SelectItem value="36">Últimos 36 meses</SelectItem>
            <SelectItem value="48">Últimos 48 meses</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.activity}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, activity: val }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Actividad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las actividades</SelectItem>
            <SelectItem value="control">Controles</SelectItem>
            <SelectItem value="urgencia">Urgencias</SelectItem>
            <SelectItem value="consulta">Consultas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">
            Cargando atenciones APS...
          </p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && filteredAttentions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay atenciones registradas para este paciente en APS.
          </p>
        )}

        {!loading &&
          !error &&
          filteredAttentions.map((attention) => (
            <div
              key={attention.id}
              className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      attention.tipoAtencion === "Urgencia APS"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {attention.tipoAtencion}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {attention.fecha}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="px-2 py-1 rounded-full bg-muted text-foreground">
                    {attention.establecimiento}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="text-sm font-medium text-foreground">
                    Diagnóstico:{" "}
                  </span>
                  <span className="text-sm text-foreground">
                    {attention.diagnostico}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Profesional: </span>
                    <span className="text-foreground">
                      {/* tipo afuera, nombre dentro del paréntesis */}
                      {attention.tipo} ({attention.profesional})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Actividad:{" "}
                  </span>
                  <span className="text-sm text-foreground">
                    {attention.actividad}
                  </span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Indicaciones: </span>
                  {attention.indicaciones}
                </p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
