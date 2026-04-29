-- Migration: user_progress.evaluation_data
-- Date: 2026-04-29
-- Reason: persistir el detalle de evaluación de cada skill (scores por
-- criterio, feedback del coach IA y transcripción) para poder mostrarlo
-- al re-entrar a una skill ya completada.
--
-- Hoy si un participante vuelve a una skill C (Roleplay) ya conquistada,
-- la pantalla arranca de cero el chat — pierde el feedback que recibió.
-- Con esta columna podemos rehidratar la pantalla de resultados.
--
-- Shape sugerido para Tipo C:
--   {
--     "type": "C",
--     "scores": [85, 90, 75],
--     "feedback": "...",
--     "criteria": ["Comunicación", "Empatía", "Cierre"],
--     "transcript": [{"rol": "...", "texto": "..."}, ...]
--   }
-- Otros tipos (B, D) podrían usar la misma columna con shape distinto.
--
-- Safe to apply multiple times (uses IF NOT EXISTS).
-- Safe to deploy code BEFORE applying this SQL: el helper
-- updateSkillProgress detecta el error 42703 y reintenta sin el campo.

-- 1. Add nullable jsonb column.
alter table user_progress
    add column if not exists evaluation_data jsonb;

-- 2. RLS:
--    No hace falta nueva policy. La policy existente
--      "Users can manage their own progress"
--    cubre lectura/escritura de cualquier columna en filas propias, y
--    "Coordinators/supervisors can view their company's progress"
--    cubre la lectura para supervisores.

-- Verification query (optional):
-- select skill_id, status, evaluation_data->>'type' as eval_type
-- from user_progress
-- where evaluation_data is not null
-- limit 10;
