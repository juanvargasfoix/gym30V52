-- Migration: kudos_read_ids on profiles
-- Date: 2026-04-22
-- Reason: persist "which kudos has the user marked as read" cross-device.
-- Currently lives in browser localStorage, so users on a new device
-- see all kudos as unread again.
--
-- Safe to apply multiple times (uses IF NOT EXISTS).
-- Safe to deploy code BEFORE applying this SQL: the helpers in
-- src/lib/supabase-helpers.ts fall back to localStorage if the column
-- is missing.

-- 1. Add nullable column with empty array default.
alter table profiles
    add column if not exists kudos_read_ids text[] default '{}'::text[];

-- 2. Backfill existing rows whose value ended up NULL (edge case if column
--    pre-existed without default). No-op on fresh installs.
update profiles
set kudos_read_ids = '{}'::text[]
where kudos_read_ids is null;

-- 3. RLS:
--    No new policy needed — the existing
--      "Users can update their own profile" policy
--    already covers writes to any profiles column for the row owner,
--    and reads to profiles in the same company are already permitted.
--    The ID list is not sensitive (kudo IDs the user has dismissed).

-- Verification query (optional, run after applying):
-- select id, username, coalesce(array_length(kudos_read_ids, 1), 0) as read_count
-- from profiles
-- order by read_count desc nulls last
-- limit 10;
