-- 1) CATÁLOGOS CON CONTEXTO VALDIVIA
-- Establecimientos (todos en Valdivia)
insert into establecimiento_hosp (nombre, codigo, direccion)
values 
('Hospital Base Valdivia', 'HBV01', 'Av. Simpson 850, Valdivia'),
('CESFAM Gil de Castro', 'CESC01', 'Lord Cochrane 625, Valdivia'),
('CESFAM Jorge Sabat', 'CESC02', 'Av. Pedro Montt s/n, Valdivia');

-- Especialidades
insert into especialidad_hosp (nombre)
values
('Medicina Interna'),
('Cardiología'),
('Traumatología'),
('Pediatría'),
('Neurología');

-- Servicios Clínicos (del Hospital Base Valdivia)
insert into servicio_clinico (nombre)
values
('Medicina'),
('Cirugía'),
('Pediatría'),
('Unidad Coronaria'),
('Trauma');

-- 2) PROFESIONALES (ASOCIADOS A ESTOS ESTABLECIMIENTOS)
insert into profesional_hosp (nombre_completo, rut, especialidad_id, establecimiento_id)
values
('Dr. Carlos Pérez Soto', '12345678-9', 1, 1),  -- Med. Interna, HBV
('Dra. Ana Muñoz Rivas', '98765432-1', 2, 1),   -- Cardio, HBV
('Dr. Felipe Arancibia Torres', '11223344-5', 3, 1), -- Trauma, HBV
('Dra. Valentina Herrera López', '55667788-3', 4, 2), -- Pediatría, CESFAM Gil de Castro
('Dr. Nicolás Paredes Silva', '19283746-K', 1, 3);    -- Med. Interna, CESFAM Jorge Sabat

-- 3) PACIENTES (4 PACIENTES DE VALDIVIA)
insert into paciente_core 
(id_paciente_interno, rut, dv, nombre_completo, fecha_nacimiento, sexo, edad, direccion, telefono, prevision, tramo_fonasa, fecha_primera_atencion, fecha_ultima_atencion, establecimiento_id)
values
('HBV-001', '17896543', '5', 'María Fernanda López', '1985-03-12', 'Femenino', 39,
 'Pje. Las Heras 554, Valdivia', '+56955510001', 'FONASA', 'B',
 '2022-06-01', '2025-01-10', 1),

('HBV-002', '12345678', '9', 'Jorge Andrés Vargas', '1990-11-23', 'Masculino', 34,
 'Av. Picarte 2100, Valdivia', '+56955510002', 'ISAPRE CruzBlanca', null,
 '2023-01-14', '2025-01-18', 1),

('CESC-GC-010', '20456789', '2', 'Daniela Rosas Martínez', '1977-05-07', 'Femenino', 47,
 'Villa Los Alcaldes 228, Valdivia', '+56955510003', 'FONASA', 'C',
 '2021-08-29', '2024-12-30', 2),

('CESC-JS-021', '15322456', 'K', 'Cristóbal Hernández Silva', '2001-09-14', 'Masculino', 23,
 'Las Ánimas, Valdivia', '+56955510004', 'ISAPRE Consalud', null,
 '2024-04-12', '2025-01-20', 3);

 -- 4) URGENCIAS (EN HOSPITAL BASE VALDIVIA)
 -- María: dolor torácico -> hospitalización
insert into urgencia_hosp 
(paciente_id, fecha_ingreso, hora_ingreso, motivo_consulta, clasificacion_prioridad, diagnostico_urgencia, profesional_id, indicaciones, procedimientos, resultado_atencion)
select id_paciente_core, '2025-01-10', '14:30',
       'Dolor torácico súbito', 'Naranja', 'Sospecha de síndrome coronario agudo', 2,
       'Reposo, ECG y enzimas cardíacas', 'ECG, toma de enzimas cardíacas', 'Hospitalización'
from paciente_core where id_paciente_interno = 'HBV-001';

-- Jorge: lumbago agudo -> alta
insert into urgencia_hosp 
(paciente_id, fecha_ingreso, hora_ingreso, motivo_consulta, clasificacion_prioridad, diagnostico_urgencia, profesional_id, indicaciones, procedimientos, resultado_atencion)
select id_paciente_core, '2025-01-18', '10:15',
       'Dolor lumbar intenso tras esfuerzo', 'Amarillo', 'Lumbago mecánico agudo', 3,
       'Analgesia, reposo relativo', 'Examen físico columna lumbar', 'Alta'
from paciente_core where id_paciente_interno = 'HBV-002';

-- Daniela: fiebre alta -> hospitalización
insert into urgencia_hosp 
(paciente_id, fecha_ingreso, hora_ingreso, motivo_consulta, clasificacion_prioridad, diagnostico_urgencia, profesional_id, indicaciones, procedimientos, resultado_atencion)
select id_paciente_core, '2024-12-30', '22:50',
       'Fiebre alta y tos productiva', 'Rojo', 'Infección respiratoria baja', 1,
       'Antipiréticos, hidratación', 'Hemograma, PCR, radiografía de tórax', 'Hospitalización'
from paciente_core where id_paciente_interno = 'CESC-GC-010';

--5) CONSULTAS CAE (CARDIO Y TRAUMA, HBV)
-- María: control en Cardiología post urgencia
insert into consulta_cae 
(paciente_id, especialidad_id, fecha_hora, profesional_id, diagnostico, actividades, plan_indicado, indicaciones)
select id_paciente_core, 2, '2025-01-15 09:30', 2,
       'Angina estable en control', 'Evaluación clínica, revisión ECG', 
       'Aspirina diaria, control en 3 meses', 'Evitar esfuerzos intensos, controlar factores de riesgo'
from paciente_core where id_paciente_interno = 'HBV-001';

-- Jorge: consulta de Traumatología
insert into consulta_cae 
(paciente_id, especialidad_id, fecha_hora, profesional_id, diagnostico, actividades, plan_indicado, indicaciones)
select id_paciente_core, 3, '2025-01-20 16:00', 3,
       'Lumbago crónico mecánico', 'Examen físico, revisión de radiografías previas', 
       'Kinesiología 10 sesiones + AINES', 'Evitar cargas pesadas y mala postura'
from paciente_core where id_paciente_interno = 'HBV-002';

-- 6) HOSPITALIZACIÓN (UN EPISODIO EN UNIDAD CORONARIA HBV)
insert into hospitalizacion
(paciente_id, fecha_ingreso, hora_ingreso, fecha_alta, hora_alta, servicio_clinico_id, sala, cama, diagnostico_ingreso, diagnostico_alta, profesional_responsable_id, evolucion_resumen, motivo_alta)
select id_paciente_core,
       '2025-01-10', '15:00',
       '2025-01-13', '11:00',
       4, 'UCOR', 'Cama 3',
       'Síndrome coronario agudo', 'Angina estable controlada', 
       2,
       'Paciente con buena respuesta a tratamiento antiisquémico y sin nuevos episodios de dolor.', 
       'Mejoría clínica'
from paciente_core where id_paciente_interno = 'HBV-001';


-- 7) EXÁMENES DE LABORATORIO (HBV)
-- María: hemograma alterado
insert into examen_laboratorio
(paciente_id, fecha_solicitud, nombre_examen, tipo_examen, resultado, detalle_resultados, rango_referencia, unidad_medida, estado, profesional_valida_id)
select id_paciente_core, '2025-01-10', 'Hemograma Completo', 'LAB-001',
       'Leucocitos elevados', '{"hemoglobina": "12.1", "leucocitos": "14.2"}',
       'HB 12-16 / GB 4-11', 'g/dL', 'Validado', 1
from paciente_core where id_paciente_interno='HBV-001';

-- Jorge: PCR levemente elevada
insert into examen_laboratorio
(paciente_id, fecha_solicitud, nombre_examen, tipo_examen, resultado, rango_referencia, unidad_medida, estado)
select id_paciente_core, '2025-01-18', 'Proteína C Reactiva (PCR)', 'LAB-002',
       '8 mg/L', '0-5', 'mg/L', 'Informado'
from paciente_core where id_paciente_interno='HBV-002';


-- 8) EXÁMENES DE IMAGEN (RADIOGRAFÍA EN HBV)
insert into examen_imagen
(paciente_id, tipo_examen, nombre_examen, fecha_toma, informe, informe_detalle, profesional_informante_id, conclusion, estado)
select id_paciente_core, 'RX', 'Radiografía de Tórax PA y Lateral', '2024-12-30',
       'Infiltrados en base pulmonar derecha.', 
       'Se observan opacidades en base derecha compatibles con proceso neumónico en fase inicial.',
       1, 'Hallazgos compatibles con neumonía basal derecha.', 'Informado'
from paciente_core where id_paciente_interno='CESC-GC-010';


-- 9) MEDICAMENTOS (VIGENTES E HISTÓRICOS
-- María: tratamiento durante hospitalización
insert into medicamento_hosp
(paciente_id, origen, contexto, nombre_medicamento, dosis, via, frecuencia, fecha_inicio, fecha_termino, estado, profesional_prescribe_id)
select id_paciente_core, 'Hospital', 'Hospitalizacion', 
       'Aspirina', '100 mg', 'Oral', 'Cada 24 horas',
       '2025-01-10', '2025-01-13', 'Histórico', 2
from paciente_core where id_paciente_interno='HBV-001';

-- Jorge: analgésico post urgencia, vigente
insert into medicamento_hosp
(paciente_id, origen, contexto, nombre_medicamento, dosis, via, frecuencia, fecha_inicio, estado, profesional_prescribe_id)
select id_paciente_core, 'Hospital', 'Urgencia',
       'Paracetamol', '1 g', 'Oral', 'Cada 8 horas',
       '2025-01-18', 'Vigente', 3
from paciente_core where id_paciente_interno='HBV-002';

-- 10) DERIVACIÓN SIGTE (VALDIVIA → CARDIOLOGÍA HBV)
insert into derivacion_sigte_hosp
(paciente_id, fecha_solicitud, estado, prioridad, fecha_asignada, especialidad_id, profesional_resuelve_id, fecha_atencion_realizada, resolucion_clinica, observaciones)
select id_paciente_core, 
       '2025-01-15', 'En lista de espera', 'Normal', null, 
       2, 2, null,
       null, 'Derivación a Cardiología del Hospital Base Valdivia por angina estable en estudio.'
from paciente_core where id_paciente_interno='HBV-001';