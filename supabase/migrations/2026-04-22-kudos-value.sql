-- Migration: kudos.value
-- Date: 2026-04-22
-- Reason: el supervisor elige un "valor demostrado" (Colaboración,
-- Iniciativa, Excelencia, Innovación, Liderazgo) al enviar un kudo, pero
-- ese campo nunca se persistía en la tabla kudos — al recargar la página,
-- todos los kudos se mostraban con el mismo texto hardcoded.
--
-- Safe to apply multiple times (uses IF NOT EXISTS).
-- Safe to deploy code BEFORE applying this SQL: el helper sendKudo en
-- src/lib/supabase-helpers.ts reintenta la inserción sin el campo si
-- detecta que la columna todavía no existe.

-- 1. Add nullable column with sensible default for legacy rows.
alter table kudos
    add column if not exists value text default 'Reconocimiento';

-- 2. Backfill existing rows whose value ended up NULL.
update kudos
set value = 'Reconocimiento'
where value is null;

-- 3. RLS:
--    No hace falta nueva policy. Los kudos ya tienen políticas para
--    select/insert que cubren cualquier columna.

-- Verification query (optional):
-- select value, count(*) from kudos group by value order by count desc;
