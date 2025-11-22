"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PatientInfo({ rut, isLoading = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // 🔄 Buscar datos reales según rut
  useEffect(() => {
    if (!rut) {
      setData(null);
      setError("");
      return;
    }

    const fetchData = async () => {
      try {
        setError("");
        const res = await fetch(`${API_URL}/api/patient/${rut}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message);

        setData(json);
      } catch (err) {
        setData(null);
        setError(err.message);
      }
    };

    fetchData();
  }, [rut]);

  // 🦴 Skeleton reutilizable
  const renderSkeleton = () => (
    <Card className="p-6">
      <div className="animate-pulse space-y-6 ">
        {/* encabezado */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-52 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
        </div>

        {/* grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row}>
                  <div className="h-3 w-28 bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* pie */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-32 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  // 🟦 Prioridad: si está cargando (desde App), mostramos skeleton
  if (isLoading) {
    return renderSkeleton();
  }

  // 🟦 Si aún no hay rut (y tampoco estamos cargando) → mensaje original
  if (!rut) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Busca un paciente para ver su información básica.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-500">{error}</p>
      </Card>
    );
  }

  // 🟦 Si hay rut pero aún no llegan los datos de la API → skeleton local
  if (rut && !data) {
    return renderSkeleton();
  }

  // 🔍 Tomar datos desde Rayen (APS) o CORE (hospital)
  const pAps = data.paciente?.aps || null;
  const pCore = data.paciente?.core || null;

  const p = pAps || pCore || {};

  // --- Campos específicos ---

  // Previsión + tramo (CORE usa tramo_fonasa)
  const previsionBase =
    pAps?.prevision || pCore?.prevision || p.prevision || "—";

  const tramo =
    pAps?.tramo_fonasa ||
    pAps?.tramo_prevision ||
    pCore?.tramo_fonasa ||
    pCore?.tramo_prevision ||
    p.tramo_fonasa ||
    p.tramo_prevision ||
    "";

  const prevision =
    previsionBase === "—"
      ? "—"
      : tramo
      ? `${previsionBase} ${tramo}`
      : previsionBase;

  const medicoCabecera =
    pAps?.medico_cabecera ||
    pAps?.medico_cabecera_nombre ||
    p.medico_cabecera ||
    data.medico_cabecera ||
    data.medico_cabecera_nombre ||
    "—";

  const sectorAPS =
    pAps?.sector ||
    pAps?.sector_nombre ||
    pAps?.sector_aps ||
    p.sector ||
    data.sector_aps ||
    data.sector_nombre ||
    data.sector_aps_nombre ||
    "—";

  const discapacidad =
    pAps?.situacion_discapacidad ||
    p.discapacidad ||
    "No registra";

  const puebloIndigena =
    pAps?.pueblo_indigena ||
    p.pueblo_indigena ||
    "No";

  const patientData = {
    nombre: p.nombre_completo || "Sin información",
    rut,
    edad: p.edad || "—",
    sexo: p.sexo || "—",
    fechaNacimiento: p.fecha_nacimiento || "—",
    direccion: p.direccion || "—",
    telefono: p.telefono || "—",
    estadoCivil: p.estado_civil || "—",
    medicoCabecera,
    sectorAPS,
    prevision,
    discapacidad,
    puebloIndigena,
    idRayen: pAps?.numero_ficha_aps || pAps?.numero_ficha || "—",
    idCore: pCore?.id_paciente_interno || pCore?.id_paciente_core || "—",
  };

  return (
    <Card className="p-6">
      {/* Título */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {patientData.nombre}
          </h2>
          <p className="text-sm text-muted-foreground">RUT: {patientData.rut}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Paciente Activo
        </Badge>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Edad
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.edad} años
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sexo
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.sexo}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fecha de Nacimiento
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.fechaNacimiento}
            </p>
          </div>

          {/* Pueblo indígena */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pueblo indígena
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.puebloIndigena}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Teléfono
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.telefono}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estado Civil
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.estadoCivil}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dirección
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.direccion}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Médico de Cabecera
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.medicoCabecera}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sector APS
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.sectorAPS}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Previsión
            </label>
            <p className="text-base text-foreground mt-1">
              {patientData.prevision}
            </p>
          </div>
        </div>
      </div>

      {/* PIE DE FICHA */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Discapacidad
          </label>
          <p className="text-base text-foreground mt-1">
            {patientData.discapacidad}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            ID Rayen (APS)
          </label>
          <p className="text-sm font-mono text-foreground mt-1">
            {patientData.idRayen}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            ID CORE (Hospital)
          </label>
          <p className="text-sm font-mono text-foreground mt-1">
            {patientData.idCore}
          </p>
        </div>
      </div>
    </Card>
  );
}
