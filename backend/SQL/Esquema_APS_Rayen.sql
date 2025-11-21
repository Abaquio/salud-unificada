-- Habilitar UUID si no está
create extension if not exists "pgcrypto";

----------------------------------------------------------------
-- 1) CATÁLOGOS BÁSICOS
----------------------------------------------------------------

create table if not exists sector_aps (
  id serial primary key,
  nombre text not null
);

create table if not exists establecimiento_aps (
  id serial primary key,
  nombre text not null,
  codigo text,
  direccion text
);

create table if not exists tipo_profesional_aps (
  id serial primary key,
  nombre text not null  -- Médico, Enfermera, Matrona, etc.
);

----------------------------------------------------------------
-- 2) PROFESIONALES APS
----------------------------------------------------------------

create table if not exists profesional_aps (
  id serial primary key,
  nombre_completo text not null,
  tipo_profesional_id integer references tipo_profesional_aps(id),
  rut text,
  establecimiento_aps_id integer references establecimiento_aps(id)
);

----------------------------------------------------------------
-- 3) PACIENTES APS
----------------------------------------------------------------

create table if not exists paciente_aps (
  id_paciente_aps uuid primary key default gen_random_uuid(),
  numero_ficha_aps text,             -- ID local Rayen (ficha APS)
  rut text not null,
  dv text,
  nombre_completo text not null,
  fecha_nacimiento date,
  sexo text,
  edad integer,                      -- opcional (se puede calcular)
  direccion text,
  telefono text,
  estado_civil text,
  situacion_discapacidad text,
  pueblo_indigena text,
  estado_inscripcion text,           -- inscrito / no inscrito, etc.
  sector_aps_id integer references sector_aps(id),
  medico_cabecera_id integer references profesional_aps(id),
  establecimiento_aps_id integer references establecimiento_aps(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice para búsqueda por RUT
create index if not exists idx_paciente_aps_rut
  on paciente_aps (rut);

----------------------------------------------------------------
-- 4) ATENCIONES APS (Rayen)
----------------------------------------------------------------

create table if not exists atencion_aps (
  id_atencion uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_aps(id_paciente_aps) on delete cascade,
  fecha_atencion date not null,
  hora_atencion time,
  ambito_atencion text,              -- Atención abierta / Urgencia APS
  estado_atencion text,              -- Abierta / Cerrada / Urgencia, etc.
  profesional_id integer references profesional_aps(id),
  establecimiento_aps_id integer references establecimiento_aps(id),

  -- Para mostrar rápido en el visor (card de la atención)
  diagnostico_principal_text text,
  actividades_resumen text,
  indicaciones_resumen text,

  created_at timestamptz default now()
);

create index if not exists idx_atencion_aps_paciente_fecha
  on atencion_aps (paciente_id, fecha_atencion desc);

----------------------------------------------------------------
-- 5) DIAGNÓSTICOS DE ATENCIÓN APS
----------------------------------------------------------------

create table if not exists diagnostico_aps (
  id_diagnostico uuid primary key default gen_random_uuid(),
  atencion_id uuid references atencion_aps(id_atencion) on delete cascade,
  es_principal boolean default false,
  orden smallint default 1,          -- 1 = principal, 2,3... secundarios
  tipo_diagnostico text,             -- Prueba / Definitivo / Descartado
  codigo_cie10 text,
  descripcion text not null
);

create index if not exists idx_diag_aps_atencion
  on diagnostico_aps (atencion_id);

create index if not exists idx_diag_aps_desc
  on diagnostico_aps using gin (to_tsvector('spanish', descripcion));

----------------------------------------------------------------
-- 6) ACTIVIDADES EN APS
----------------------------------------------------------------

create table if not exists actividad_aps (
  id_actividad uuid primary key default gen_random_uuid(),
  atencion_id uuid references atencion_aps(id_atencion) on delete cascade,
  actividad_nombre text not null,    -- p.ej. "Control prenatal", "Control cardiovascular"
  descripcion text
);

create index if not exists idx_actividad_aps_atencion
  on actividad_aps (atencion_id);

----------------------------------------------------------------
-- 7) INDICACIONES EN APS
----------------------------------------------------------------

create table if not exists indicacion_aps (
  id_indicacion uuid primary key default gen_random_uuid(),
  atencion_id uuid references atencion_aps(id_atencion) on delete cascade,
  texto_indicacion text not null
);

----------------------------------------------------------------
-- 8) DERIVACIONES APS (SIGTE DESDE APS)
----------------------------------------------------------------

create table if not exists derivacion_aps (
  id_derivacion uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_aps(id_paciente_aps) on delete cascade,
  atencion_id uuid references atencion_aps(id_atencion),

  especialidad_solicitada text not null,
  fecha_derivacion date not null,
  motivo_derivacion text,
  prioridad text,                    -- p.ej. "Preferente", "Normal"
  profesional_deriva_id integer references profesional_aps(id),

  -- Para soportar filtros y vista unificada
  observaciones text,
  estado_sigte text                  -- Pendiente / En lista de espera / Con hora / Resuelta
);

create index if not exists idx_derivacion_aps_paciente_fecha
  on derivacion_aps (paciente_id, fecha_derivacion desc);