-- Fix subjects visibility: ensure RLS is enabled with a public SELECT policy
-- This resolves the "No subjects available" issue in the student request form.
-- The GRANT alone is not enough — RLS policies filter rows even with table-level grants.

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Allow everyone (anon + authenticated) to read subjects
-- DROP first in case a partial policy exists
DROP POLICY IF EXISTS "subjects_public_read" ON public.subjects;
CREATE POLICY "subjects_public_read"
  ON public.subjects
  FOR SELECT
  USING (true);

-- Re-grant table-level permissions (idempotent)
GRANT SELECT ON public.subjects TO anon, authenticated;
