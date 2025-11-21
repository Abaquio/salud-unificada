-- Habilitar UUID si no está
create extension if not exists "pgcrypto";

---------------------------------------------------------------
-- 1) CATÁLOGOS BÁSICOS
---------------------------------------------------------------

create table if not exists establecimiento_hosp (
  id serial primary key,
  nombre text not null,
  codigo text,
  direccion text
);

create table if not exists especialidad_hosp (
  id serial primary key,
  nombre text not null
);

create table if not exists servicio_clinico (
  id serial primary key,
  nombre text not null
);

---------------------------------------------------------------
-- 2) PROFESIONALES HOSPITALARIOS
---------------------------------------------------------------

create table if not exists profesional_hosp (
  id serial primary key,
  nombre_completo text not null,
  rut text,
  especialidad_id integer references especialidad_hosp(id),
  establecimiento_id integer references establecimiento_hosp(id)
);

---------------------------------------------------------------
-- 3) PACIENTE HOSPITALARIO (CORE)
---------------------------------------------------------------

create table if not exists paciente_core (
  id_paciente_core uuid primary key default gen_random_uuid(),
  id_paciente_interno text,      -- ID local del hospital (CORE)
  rut text not null,
  dv text,
  nombre_completo text not null,
  fecha_nacimiento date,
  sexo text,
  edad integer,                  -- opcional (se puede calcular)
  direccion text,
  telefono text,
  prevision text,
  tramo_fonasa text,
  fecha_primera_atencion date,
  fecha_ultima_atencion date,
  establecimiento_id integer references establecimiento_hosp(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Búsqueda rápida por RUT
create index if not exists idx_paciente_core_rut
  on paciente_core (rut);

---------------------------------------------------------------
-- 4) URGENCIAS HOSPITALARIAS
---------------------------------------------------------------

create table if not exists urgencia_hosp (
  id_urgencia uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  fecha_ingreso date not null,
  hora_ingreso time,
  motivo_consulta text,
  clasificacion_prioridad text,      -- prioridad de triage
  diagnostico_urgencia text,
  profesional_id integer references profesional_hosp(id),
  indicaciones text,
  procedimientos text,
  resultado_atencion text,           -- Alta / Hospitalización / Derivación
  created_at timestamptz default now()
);

create index if not exists idx_urgencia_paciente_fecha
  on urgencia_hosp (paciente_id, fecha_ingreso desc);

---------------------------------------------------------------
-- 5) CONSULTAS CAE / ESPECIALIDADES
---------------------------------------------------------------

create table if not exists consulta_cae (
  id_consulta uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  especialidad_id integer references especialidad_hosp(id),
  fecha_hora timestamptz not null,
  profesional_id integer references profesional_hosp(id),
  diagnostico text,
  actividades text,
  plan_indicado text,       -- Tratamiento / controles, etc.
  indicaciones text,        -- Para mostrar detalle en la UI
  created_at timestamptz default now()
);

create index if not exists idx_consulta_cae_paciente_fecha
  on consulta_cae (paciente_id, fecha_hora desc);

---------------------------------------------------------------
-- 6) HOSPITALIZACIONES
---------------------------------------------------------------

create table if not exists hospitalizacion (
  id_hosp uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  fecha_ingreso date not null,
  hora_ingreso time,
  fecha_alta date,
  hora_alta time,
  servicio_clinico_id integer references servicio_clinico(id),
  sala text,
  cama text,
  diagnostico_ingreso text,
  diagnostico_alta text,
  profesional_responsable_id integer references profesional_hosp(id),
  evolucion_resumen text,
  motivo_alta text,
  created_at timestamptz default now()
);

create index if not exists idx_hosp_paciente_fecha
  on hospitalizacion (paciente_id, fecha_ingreso desc);

---------------------------------------------------------------
-- 7) EXÁMENES DE LABORATORIO
---------------------------------------------------------------

create table if not exists examen_laboratorio (
  id_examen_lab uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  fecha_solicitud date not null,
  nombre_examen text,          -- p.ej. "Hemograma completo"
  tipo_examen text,            -- Código/categoría si lo necesitas
  resultado text,
  detalle_resultados jsonb,    -- opcional: valores detallados (HB, GB, etc.)
  rango_referencia text,
  unidad_medida text,
  estado text,                 -- Pendiente / Validado / Informado
  profesional_valida_id integer references profesional_hosp(id),
  created_at timestamptz default now()
);

create index if not exists idx_examen_lab_paciente_fecha
  on examen_laboratorio (paciente_id, fecha_solicitud desc);

---------------------------------------------------------------
-- 8) EXÁMENES DE IMAGENOLOGÍA
---------------------------------------------------------------

create table if not exists examen_imagen (
  id_examen_img uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  tipo_examen text not null,   -- RX, TAC, RM, ECO, etc.
  nombre_examen text,          -- p.ej. "Radiografía de tórax"
  fecha_toma date not null,
  informe text,                -- Resumen breve
  informe_detalle text,        -- Texto más largo si es necesario
  profesional_informante_id integer references profesional_hosp(id),
  conclusion text,
  estado text,                 -- Informado / Pendiente, etc.
  created_at timestamptz default now()
);

create index if not exists idx_examen_img_paciente_fecha
  on examen_imagen (paciente_id, fecha_toma desc);

---------------------------------------------------------------
-- 9) MEDICAMENTOS HOSPITALARIOS
---------------------------------------------------------------

create table if not exists medicamento_hosp (
  id_medicamento uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,
  origen text,                 -- APS / Hospital (para mezcla en visor)
  contexto text,               -- Urgencia / Hospitalizacion / CAE
  nombre_medicamento text not null,
  dosis text,
  via text,
  frecuencia text,
  fecha_inicio date,
  fecha_termino date,
  estado text,                 -- Vigente / Histórico
  profesional_prescribe_id integer references profesional_hosp(id),
  created_at timestamptz default now()
);

create index if not exists idx_medicamento_paciente_fecha
  on medicamento_hosp (paciente_id, fecha_inicio desc);

---------------------------------------------------------------
-- 10) DERIVACIONES SIGTE (VISTA DESDE EL HOSPITAL)
---------------------------------------------------------------

create table if not exists derivacion_sigte_hosp (
  id_derivacion uuid primary key default gen_random_uuid(),
  paciente_id uuid references paciente_core(id_paciente_core) on delete cascade,

  fecha_solicitud date,               -- opcional si lo quieres almacenar
  estado text,                        -- Pendiente / En lista de espera / Con hora / Resuelta
  prioridad text,                     -- Normal / Preferente, etc.
  fecha_asignada date,
  especialidad_id integer references especialidad_hosp(id),
  profesional_resuelve_id integer references profesional_hosp(id),
  fecha_atencion_realizada date,
  resolucion_clinica text,
  observaciones text,
  created_at timestamptz default now()
);

create index if not exists idx_derivacion_sigte_paciente_fecha
  on derivacion_sigte_hosp (paciente_id, fecha_asignada desc);