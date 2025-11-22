"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ onSearch }) {
  const [rut, setRut] = useState("");
  const [error, setError] = useState("");

  // Solo permite números y K, formateado como 11222333-4
  const handleChange = (e) => {
    let value = e.target.value;

    // Quitar todo lo que no sea dígito o K/k
    value = value.replace(/[^\dkK]/g, "").toUpperCase();

    // Separar cuerpo y DV
    let body = value.slice(0, -1);
    let dv = value.slice(-1);

    // Limitar cuerpo a máximo 8 dígitos
    body = body.slice(0, 8);

    if (!dv) {
      setRut(body);
    } else {
      setRut(`${body}-${dv}`);
    }

    if (error) setError("");
  };

  const isValidRutFormat = (value) => {
    // 7 u 8 dígitos + guion + dígito o K
    return /^\d{7,8}-[\dK]$/.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rut) {
      setError("Ingresa un RUT");
      return;
    }

    if (!isValidRutFormat(rut)) {
      setError("Formato de RUT inválido. Usa 11222333-4");
      return;
    }

    setError("");
    onSearch(rut);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
              />
            </svg>
          </span>
          <Input
            type="text"
            placeholder="RUT del paciente (ej: 11222333-4)"
            value={rut}
            onChange={handleChange}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="px-8 btn-neon">
          Buscar
        </Button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}

