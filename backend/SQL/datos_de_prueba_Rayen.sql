-- 1) CATÁLOGOS APS (Valdivia)
-- Sectores APS
insert into sector_aps (nombre) values
('Las Ánimas'),
('Centro'),
('Isla Teja'),
('Collico');

-- Establecimientos APS de Valdivia
insert into establecimiento_aps (nombre, codigo, direccion) values
('CESFAM Gil de Castro', 'APS-GC01', 'Lord Cochrane 625, Valdivia'),
('CESFAM Jorge Sabat', 'APS-JS02', 'Av. Pedro Montt s/n, Valdivia'),
('CESFAM Las Ánimas', 'APS-LA03', 'Los Laureles 1880, Las Ánimas, Valdivia'),
('CESFAM Niebla', 'APS-NB04', 'Camino Costero Niebla 1400, Valdivia');

-- Tipos de profesionales
insert into tipo_profesional_aps (nombre) values
('Médico'),
('Enfermera'),
('Matrona'),
('TENS'),
('Nutricionista');


-- 2) PROFESIONALES APS (Valdivia)

insert into profesional_aps (nombre_completo, tipo_profesional_id, rut, establecimiento_aps_id) values
('Dr. Sebastián Aguilera', 1, '12345678-9', 1), -- Gil de Castro
('Enf. Carolina Soto', 2, '11223344-5', 1),
('Dra. Marcela Rivas', 1, '99887766-3', 2), -- Jorge Sabat
('Mat. Daniela Pizarro', 3, '22334455-6', 3), -- Las Ánimas
('Dr. Pablo Araya', 1, '33445566-7', 4); -- Niebla


--3) PACIENTES APS (4 pacientes reales de Valdivia)
insert into paciente_aps
(numero_ficha_aps, rut, dv, nombre_completo, fecha_nacimiento, sexo, edad, direccion, telefono, estado_civil, situacion_discapacidad, pueblo_indigena, estado_inscripcion, sector_aps_id, medico_cabecera_id, establecimiento_aps_id)
values
('APS-GC-1001', '17896543', '5', 'María Fernanda López', '1985-03-12', 'Femenino', 39,
 'Pje. Las Heras 554, Valdivia', '+56977710001', 'Soltera', null, 'No', 'Inscrito', 1, 1, 1),

('APS-JS-2001', '15322456', 'K', 'Cristóbal Hernández Silva', '2001-09-14', 'Masculino', 23,
 'Las Ánimas, Valdivia', '+56977710002', 'Soltero', null, 'No', 'Inscrito', 2, 3, 2),

('APS-LA-3100', '20456789', '2', 'Daniela Rosas Martínez', '1977-05-07', 'Femenino', 47,
 'Villa Los Alcaldes 228, Las Ánimas', '+56977710003', 'Casada', 'Leve', 'Sí', 'Inscrito', 1, 4, 3),

('APS-NB-4400', '12345678', '9', 'Jorge Andrés Vargas', '1990-11-23', 'Masculino', 34,
 'Niebla, Valdivia', '+56977710004', 'Soltero', null, 'No', 'Inscrito', 3, 5, 4);


--  4) ATENCIONES APS (consultas y urgencia APS)
-- María (Gil de Castro), control crónico cardiovascular
insert into atencion_aps
(paciente_id, fecha_atencion, hora_atencion, ambito_atencion, estado_atencion, profesional_id, establecimiento_aps_id, diagnostico_principal_text, actividades_resumen, indicaciones_resumen)
select id_paciente_aps, '2025-01-05', '10:30', 'Atención Abierta', 'Cerrada',
       1, 1, 'Hipertensión arterial esencial', 'Control crónico cardiovascular', 'Aumentar hidratación, control en 3 meses'
from paciente_aps where numero_ficha_aps='APS-GC-1001';

-- Cristóbal (Jorge Sabat), consulta respiratoria leve
insert into atencion_aps
(paciente_id, fecha_atencion, hora_atencion, ambito_atencion, estado_atencion, profesional_id, establecimiento_aps_id, diagnostico_principal_text, actividades_resumen, indicaciones_resumen)
select id_paciente_aps, '2025-01-12', '11:45', 'Atención Abierta', 'Cerrada',
       3, 2, 'Infección respiratoria aguda', 'Evaluación respiratoria', 'Paracetamol + reposo'
from paciente_aps where numero_ficha_aps='APS-JS-2001';

-- Daniela (Las Ánimas), control post COVID
insert into atencion_aps
(paciente_id, fecha_atencion, hora_atencion, ambito_atencion, estado_atencion, profesional_id, establecimiento_aps_id, diagnostico_principal_text, actividades_resumen, indicaciones_resumen)
select id_paciente_aps, '2024-12-22', '09:15', 'Atención Abierta', 'Cerrada',
       4, 3, 'Secuelas post-COVID', 'Control respiratorio', 'Ejercicios respiratorios diarios'
from paciente_aps where numero_ficha_aps='APS-LA-3100';

-- Jorge (Niebla), urgencia APS por dolor abdominal
insert into atencion_aps
(paciente_id, fecha_atencion, hora_atencion, ambito_atencion, estado_atencion, profesional_id, establecimiento_aps_id, diagnostico_principal_text, actividades_resumen, indicaciones_resumen)
select id_paciente_aps, '2025-01-20', '18:10', 'Urgencia APS', 'Cerrada',
       5, 4, 'Dolor abdominal inespecífico', 'Evaluación abdominal y signos vitales', 'Reposo + hidratación'
from paciente_aps where numero_ficha_aps='APS-NB-4400';


-- 5) DIAGNÓSTICOS (CIE10 reales)

-- María
insert into diagnostico_aps (atencion_id, es_principal, orden, tipo_diagnostico, codigo_cie10, descripcion)
select id_atencion, true, 1, 'Definitivo', 'I10', 'Hipertensión esencial'
from atencion_aps where diagnostico_principal_text='Hipertensión arterial esencial';

insert into diagnostico_aps (atencion_id, es_principal, orden, tipo_diagnostico, codigo_cie10, descripcion)
select id_atencion, false, 2, 'Definitivo', 'E66', 'Obesidad'
from atencion_aps where diagnostico_principal_text='Hipertensión arterial esencial';

-- Cristóbal
insert into diagnostico_aps (atencion_id, es_principal, orden, tipo_diagnostico, codigo_cie10, descripcion)
select id_atencion, true, 1, 'Definitivo', 'J06.9', 'Infección respiratoria aguda no especificada'
from atencion_aps where diagnostico_principal_text='Infección respiratoria aguda';

-- Daniela
insert into diagnostico_aps (atencion_id, es_principal, orden, tipo_diagnostico, codigo_cie10, descripcion)
select id_atencion, true, 1, 'Definitivo', 'U09.9', 'Secuelas de COVID-19'
from atencion_aps where diagnostico_principal_text='Secuelas post-COVID';

-- Jorge
insert into diagnostico_aps (atencion_id, es_principal, orden, tipo_diagnostico, codigo_cie10, descripcion)
select id_atencion, true, 1, 'Provisional', 'R10.4', 'Dolor abdominal inespecífico'
from atencion_aps where diagnostico_principal_text='Dolor abdominal inespecífico';

-- 6) ACTIVIDADES (acciones clínicas reales APS)
insert into actividad_aps (atencion_id, actividad_nombre, descripcion)
select id_atencion, 'Control Cardiovascular', 'Evaluación presión arterial, control de crónicos'
from atencion_aps where diagnostico_principal_text='Hipertensión arterial esencial';

insert into actividad_aps (atencion_id, actividad_nombre, descripcion)
select id_atencion, 'Evaluación respiratoria', 'Auscultación pulmonar y signos vitales'
from atencion_aps where diagnostico_principal_text='Infección respiratoria aguda';

insert into actividad_aps (atencion_id, actividad_nombre, descripcion)
select id_atencion, 'Control Post COVID', 'Evaluación de capacidad respiratoria'
from atencion_aps where diagnostico_principal_text='Secuelas post-COVID';

insert into actividad_aps (atencion_id, actividad_nombre, descripcion)
select id_atencion, 'Atención de Urgencia APS', 'Evaluación inicial de dolor abdominal'
from atencion_aps where diagnostico_principal_text='Dolor abdominal inespecífico';


--  7) INDICACIONES (texto clínico APS)
insert into indicacion_aps (atencion_id, texto_indicacion)
select id_atencion, 'Mantener control de presión arterial en domicilio'
from atencion_aps where diagnostico_principal_text='Hipertensión arterial esencial';

insert into indicacion_aps (atencion_id, texto_indicacion)
select id_atencion, 'Reposo y paracetamol 1g cada 8 horas'
from atencion_aps where diagnostico_principal_text='Infección respiratoria aguda';

insert into indicacion_aps (atencion_id, texto_indicacion)
select id_atencion, 'Realizar ejercicios respiratorios matinales'
from atencion_aps where diagnostico_principal_text='Secuelas post-COVID';

insert into indicacion_aps (atencion_id, texto_indicacion)
select id_atencion, 'Acudir a urgencia si aparece fiebre o vómitos'
from atencion_aps where diagnostico_principal_text='Dolor abdominal inespecífico';

-- 8) DERIVACIONES APS → SIGTE
-- María: derivación a Cardiología
insert into derivacion_aps
(paciente_id, atencion_id, especialidad_solicitada, fecha_derivacion, motivo_derivacion, prioridad, profesional_deriva_id, observaciones, estado_sigte)
select a.paciente_id, a.id_atencion,
       'Cardiología', '2025-01-05', 'Evaluación por HTA descompensada', 'Preferente',
       1, 'Paciente con antecedentes familiares de cardiopatía', 'Pendiente'
from atencion_aps a
where a.diagnostico_principal_text='Hipertensión arterial esencial';

-- Daniela: derivación a Neumología
insert into derivacion_aps
(paciente_id, atencion_id, especialidad_solicitada, fecha_derivacion, motivo_derivacion, prioridad, profesional_deriva_id, observaciones, estado_sigte)
select a.paciente_id, a.id_atencion,
       'Neumología', '2024-12-22', 'Secuelas respiratorias prolongadas', 'Normal',
       4, 'Evaluar capacidad pulmonar', 'En lista de espera'
from atencion_aps a
where a.diagnostico_principal_text='Secuelas post-COVID';