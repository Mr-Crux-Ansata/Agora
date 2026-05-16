/* =========================================
    DATOS INICIALES - Demo de Presupuesto Participativo
    ========================================= */

USE [agora];
GO

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

/* =========================================
    Limpiar datos iniciales existentes (seguro para reejecutar)
    ========================================= */
DELETE FROM pb.votes WHERE cycle_id IN (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DELETE FROM pb.winning_projects WHERE cycle_id IN (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DELETE FROM pb.proposals WHERE cycle_id IN (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DELETE FROM pb.cycle_phases WHERE cycle_id IN (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DELETE FROM pb.voter_eligibility WHERE cycle_id IN (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DELETE FROM pb.participatory_cycles WHERE [year] = 2026;
DELETE FROM pb.user_roles
WHERE user_id IN (
    SELECT id FROM pb.users
    WHERE email LIKE '%@ciudadano.local' OR email = 'moderator@agora.local'
);
DELETE FROM pb.users
WHERE email LIKE '%@ciudadano.local' OR email = 'moderator@agora.local';
GO

/* =========================================
    1. BARRIOS
    ========================================= */
INSERT INTO pb.neighborhoods (code, name, population)
SELECT v.code, v.name, v.population
FROM (VALUES
    ('NORTE', 'Zona Norte', 45000),
    ('SUR', 'Zona Sur', 38000),
    ('ESTE', 'Zona Este', 52000),
    ('OESTE', 'Zona Oeste', 41000),
    ('CENTRO', 'Centro', 28000)
) AS v(code, name, population)
WHERE NOT EXISTS (
    SELECT 1 FROM pb.neighborhoods n WHERE n.code = v.code
);
GO

/* =========================================
    2. CATEGORIAS
    ========================================= */
MERGE pb.categories AS target
USING (VALUES
    ('INFRA', 'Infraestructura', 'Proyectos de vías, calles y servicios básicos'),
    ('PARQUES', 'Parques y Recreación', 'Espacios públicos, parques y áreas recreativas'),
    ('EDUCACION', 'Educación', 'Escuelas, centros de formación y bibliotecas'),
    ('SALUD', 'Salud', 'Clínicas, centros de salud y bienestar'),
    ('AMBIENTE', 'Ambiente', 'Sostenibilidad, reciclaje y protección ambiental'),
    ('CULTURA', 'Cultura', 'Espacios culturales, museos y eventos comunitarios')
) AS src(code, name, description)
ON target.code = src.code
WHEN MATCHED THEN
    UPDATE SET
        name = src.name,
        description = src.description
WHEN NOT MATCHED THEN
    INSERT (code, name, description)
    VALUES (src.code, src.name, src.description);
GO

/* =========================================
    3. ROLES
    ========================================= */
INSERT INTO pb.roles (role_code, role_name)
SELECT v.role_code, v.role_name
FROM (VALUES
    ('admin', 'Administrador'),
    ('moderator', 'Moderador'),
    ('citizen', 'Ciudadano'),
    ('author', 'Autor')
) AS v(role_code, role_name)
WHERE NOT EXISTS (
    SELECT 1 FROM pb.roles r WHERE r.role_code = v.role_code
);
GO

/* =========================================
    4. USUARIOS
    ========================================= */
DECLARE @adminId UNIQUEIDENTIFIER = NEWID();
DECLARE @moderatorId UNIQUEIDENTIFIER = NEWID();

IF EXISTS (SELECT 1 FROM pb.users WHERE email = 'admin@agora.local')
BEGIN
    SELECT @adminId = id FROM pb.users WHERE email = 'admin@agora.local';
END
ELSE
BEGIN
    INSERT INTO pb.users (id, email, full_name, is_verified, is_active)
    VALUES (@adminId, 'admin@agora.local', 'Admin Agora', 1, 1);
END;

INSERT INTO pb.users (id, email, full_name, is_verified, is_active)
VALUES (@moderatorId, 'moderator@agora.local', 'Moderador', 1, 1);

-- Ciudadanos / autores
INSERT INTO pb.users (email, full_name, is_verified, is_active, neighborhood_id)
SELECT v.email, v.full_name, 1, 1, n.id
FROM (VALUES
    ('juan@ciudadano.local', 'Juan Pérez', 'NORTE'),
    ('maria@ciudadano.local', 'María García', 'SUR'),
    ('carlos@ciudadano.local', 'Carlos López', 'ESTE'),
    ('elena@ciudadano.local', 'Elena Rodríguez', 'OESTE'),
    ('diego@ciudadano.local', 'Diego Martínez', 'CENTRO'),
    ('sofia@ciudadano.local', 'Sofía Hernández', 'NORTE'),
    ('pablo@ciudadano.local', 'Pablo Sánchez', 'SUR'),
    ('ana@ciudadano.local', 'Ana Gómez', 'ESTE')
) AS v(email, full_name, neighborhood_code)
INNER JOIN pb.neighborhoods n ON n.code = v.neighborhood_code
WHERE NOT EXISTS (
    SELECT 1 FROM pb.users u WHERE u.email = v.email
);

-- Asignar roles
INSERT INTO pb.user_roles (user_id, role_id)
SELECT @adminId, r.id
FROM pb.roles r
WHERE r.role_code = 'admin'
    AND NOT EXISTS (
            SELECT 1 FROM pb.user_roles ur WHERE ur.user_id = @adminId AND ur.role_id = r.id
    );

INSERT INTO pb.user_roles (user_id, role_id)
SELECT @moderatorId, r.id
FROM pb.roles r
WHERE r.role_code = 'moderator'
    AND NOT EXISTS (
            SELECT 1 FROM pb.user_roles ur WHERE ur.user_id = @moderatorId AND ur.role_id = r.id
    );

INSERT INTO pb.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM pb.users u
CROSS JOIN pb.roles r
WHERE u.email LIKE '%@ciudadano.local'
    AND r.role_code = 'citizen'
    AND NOT EXISTS (
            SELECT 1 FROM pb.user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
    );
GO

/* =========================================
    5. CICLO PARTICIPATIVO 2026
    ========================================= */
DECLARE @cycleId UNIQUEIDENTIFIER;

INSERT INTO pb.participatory_cycles ([year], title, description, total_budget, [status], starts_at, ends_at, created_by)
SELECT 
    2026,
    'Presupuesto Participativo 2026',
    'Ciclo anual de presupuesto participativo con fases de deliberación y votación',
    500000.00,
    'active',
    DATEFROMPARTS(2026, 5, 1),
    DATEFROMPARTS(2026, 12, 31),
    (SELECT id FROM pb.users WHERE email = 'admin@agora.local');

SET @cycleId = (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);

/* =========================================
    6. FASES DEL CICLO
    ========================================= */
DECLARE @today DATE = CAST(SYSUTCDATETIME() AS DATE);

INSERT INTO pb.cycle_phases (cycle_id, phase, starts_at, ends_at, is_current)
VALUES
    (@cycleId, 'discovery', DATEADD(DAY, -150, @today), DATEADD(DAY, -121, @today), 0),
    (@cycleId, 'proposal_submission', DATEADD(DAY, -120, @today), DATEADD(DAY, -91, @today), 0),
    (@cycleId, 'institutional_evaluation', DATEADD(DAY, -90, @today), DATEADD(DAY, -61, @today), 0),
    (@cycleId, 'community_deliberation', DATEADD(DAY, -40, @today), DATEADD(DAY, -11, @today), 0),
    (@cycleId, 'voting', DATEADD(DAY, -10, @today), DATEADD(DAY, 10, @today), 1),
    (@cycleId, 'results_publication', DATEADD(DAY, 41, @today), DATEADD(DAY, 70, @today), 0);
GO

/* =========================================
    7. PROPUESTAS (varios estados)
    ========================================= */
DECLARE @cycleId UNIQUEIDENTIFIER = (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);

-- Propuesta 1: En deliberacion (discusion abierta)
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested, 
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'juan@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'NORTE'),
    (SELECT id FROM pb.categories WHERE code = 'INFRA'),
    'Reparación de vías - Avenida Principal',
    'Reparación integral de las vías principales de la zona norte incluyendo reemplazo de señalización.',
    45000.00,
    'ready_for_deliberation',
    'approved',
    'discussion_open',
    'not_selected',
    'not_started';

-- Propuesta 2: En deliberacion (discusion abierta)
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'maria@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'SUR'),
    (SELECT id FROM pb.categories WHERE code = 'PARQUES'),
    'Construcción de Parque Recreativo Sur',
    'Nuevo parque con zona de juegos, canchas deportivas y área de descanso para la comunidad.',
    75000.00,
    'ready_for_deliberation',
    'approved',
    'discussion_open',
    'not_selected',
    'not_started';

-- Propuesta 3: Lista para votacion
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'carlos@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'ESTE'),
    (SELECT id FROM pb.categories WHERE code = 'EDUCACION'),
    'Ampliación de Biblioteca Municipal Este',
    'Expansión de la biblioteca con nuevas salas de estudio y colección digital.',
    55000.00,
    'open_for_voting',
    'approved',
    'voting_open',
    'not_selected',
    'not_started';

-- Propuesta 4: Lista para votacion
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'elena@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'OESTE'),
    (SELECT id FROM pb.categories WHERE code = 'AMBIENTE'),
    'Programa de Reciclaje Comunitario',
    'Instalación de puntos de acopio y educación ambiental en toda la zona oeste.',
    30000.00,
    'open_for_voting',
    'approved',
    'voting_open',
    'not_selected',
    'not_started';

-- Propuesta 5: Abierta para votacion
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'diego@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'CENTRO'),
    (SELECT id FROM pb.categories WHERE code = 'SALUD'),
    'Centro de Salud Comunitario Centro',
    'Clínica de atención básica con servicios de prevención y educación sanitaria.',
    90000.00,
    'open_for_voting',
    'approved',
    'voting_open',
    'not_selected',
    'not_started';

-- Propuesta 6: Abierta para votacion
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'sofia@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'NORTE'),
    (SELECT id FROM pb.categories WHERE code = 'CULTURA'),
    'Espacio Cultural Zona Norte',
    'Centro cultural con sala de exposiciones y talleres comunitarios.',
    65000.00,
    'open_for_voting',
    'approved',
    'voting_open',
    'not_selected',
    'not_started';

-- Propuesta 7: Rechazada
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status,
                          rejection_reason_code, technical_feedback)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'pablo@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'SUR'),
    (SELECT id FROM pb.categories WHERE code = 'INFRA'),
    'Viaducto Experimental',
    'Construcción experimental de viaducto para mejorar la conectividad de la zona sur.',
    120000.00,
    'rejected',
    'rejected',
    'not_open',
    'not_selected',
    'not_started',
    'technical_constraints',
    'El proyecto no cumple con estándares estructurales mínimos requeridos.';

-- Propuesta 8: Abierta para votacion
INSERT INTO pb.proposals (cycle_id, author_id, neighborhood_id, category_id, title, description, budget_requested,
                          lifecycle_stage, institutional_status, participation_status, selection_status, execution_status,
                          impact_status)
SELECT 
    @cycleId,
    (SELECT id FROM pb.users WHERE email = 'ana@ciudadano.local'),
    (SELECT id FROM pb.neighborhoods WHERE code = 'ESTE'),
    (SELECT id FROM pb.categories WHERE code = 'PARQUES'),
    'Renovación Parque Central Este',
    'Remodelación completa del parque central con nuevas áreas verdes y mobiliario.',
    40000.00,
    'open_for_voting',
    'approved',
    'voting_open',
    'not_selected',
    'not_started',
    'not_assessed';
GO

/* =========================================
    8. ELEGIBILIDAD DE VOTANTES
    ========================================= */
DECLARE @cycleId UNIQUEIDENTIFIER = (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);

INSERT INTO pb.voter_eligibility (user_id, cycle_id, is_eligible)
SELECT id, @cycleId, 1
FROM pb.users 
WHERE email LIKE '%@ciudadano.local'
   OR email IN ('admin@agora.local', 'moderator@agora.local');
GO

/* =========================================
    9. VOTOS DE EJEMPLO (en propuestas abiertas para votacion)
    ========================================= */
DECLARE @cycleId UNIQUEIDENTIFIER = (SELECT id FROM pb.participatory_cycles WHERE [year] = 2026);
DECLARE @prop3Id UNIQUEIDENTIFIER = (SELECT id FROM pb.proposals WHERE title = 'Ampliación de Biblioteca Municipal Este');
DECLARE @prop4Id UNIQUEIDENTIFIER = (SELECT id FROM pb.proposals WHERE title = 'Programa de Reciclaje Comunitario');

-- Voto para propuesta 3 (Biblioteca)
INSERT INTO pb.votes (proposal_id, voter_id, cycle_id, cast_at)
SELECT @prop3Id, u.id, @cycleId, SYSUTCDATETIME()
FROM pb.users u
WHERE email IN ('juan@ciudadano.local', 'maria@ciudadano.local', 'carlos@ciudadano.local', 'elena@ciudadano.local', 'diego@ciudadano.local')
  AND u.id IN (SELECT user_id FROM pb.voter_eligibility WHERE cycle_id = @cycleId AND is_eligible = 1);

-- Voto para propuesta 4 (Reciclaje)
INSERT INTO pb.votes (proposal_id, voter_id, cycle_id, cast_at)
SELECT @prop4Id, u.id, @cycleId, SYSUTCDATETIME()
FROM pb.users u
WHERE email IN ('sofia@ciudadano.local', 'pablo@ciudadano.local', 'ana@ciudadano.local', 'diego@ciudadano.local')
  AND u.id IN (SELECT user_id FROM pb.voter_eligibility WHERE cycle_id = @cycleId AND is_eligible = 1);
GO

/* =========================================
    10. PROYECTOS GANADORES (para votacion cerrada)
    ========================================= */
-- No se insertan proyectos ganadores durante la fase actual de votacion.
GO

/* =========================================
    MENSAJE DE EXITO
    ========================================= */
PRINT '✓ Datos iniciales cargados correctamente!';
PRINT '';
PRINT 'Inicializado:';
PRINT '  • 5 barrios';
PRINT '  • 6 categorias';
PRINT '  • 8 usuarios (1 administrador, 1 moderador, 6 ciudadanos)';
PRINT '  • 1 ciclo participativo (2026)';
PRINT '  • 6 fases del ciclo';
PRINT '  • 8 propuestas (discusion, votacion, rechazadas)';
PRINT '  • 8 elegibilidades de votantes';
PRINT '  • 10 votos de ejemplo';
PRINT '  • 0 proyectos ganadores (fase de votacion)';
GO
