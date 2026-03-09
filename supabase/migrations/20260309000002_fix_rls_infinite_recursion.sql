-- Fix infinite recursion in RLS policies.
--
-- Problem: profiles_select_match_participant queries matches,
-- matches_select_participants queries requests,
-- requests_select_assigned_tutor queries matches → infinite recursion.
--
-- Solution: wrap the cross-table checks in SECURITY DEFINER functions
-- that bypass RLS, eliminating the circular dependency.

-- ── Helper function: check if a user is a tutor assigned via matches ────────
-- Returns TRUE if p_tutor_uid is the tutor on a match whose request
-- was created by p_student_uid (or vice versa for lookup direction).

CREATE OR REPLACE FUNCTION public.is_match_participant(
  p_viewer_uid uuid,
  p_profile_uid uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    JOIN public.requests r ON r.id = m.request_id
    WHERE
      -- viewer is the tutor, profile owner is the student (request creator)
      (m.tutor_user_id = p_viewer_uid AND r.created_by_user_id = p_profile_uid)
      OR
      -- viewer is the student (request creator), profile owner is the tutor
      (r.created_by_user_id = p_viewer_uid AND m.tutor_user_id = p_profile_uid)
  );
$$;

-- ── Helper: check if tutor is assigned to a request via matches ─────────────
CREATE OR REPLACE FUNCTION public.is_tutor_for_request(
  p_tutor_uid uuid,
  p_request_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.tutor_user_id = p_tutor_uid
      AND m.request_id = p_request_id
  );
$$;

-- ── Helper: check if student owns a request matched to a tutor ──────────────
CREATE OR REPLACE FUNCTION public.is_student_for_tutor(
  p_student_uid uuid,
  p_tutor_uid uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    JOIN public.requests r ON r.id = m.request_id
    WHERE r.created_by_user_id = p_student_uid
      AND m.tutor_user_id = p_tutor_uid
  );
$$;

-- ── Drop and recreate the three policies that caused the recursion ───────────

-- 1. Replace profiles_select_match_participant (user_profiles)
DROP POLICY IF EXISTS "profiles_select_match_participant" ON public.user_profiles;
CREATE POLICY "profiles_select_match_participant"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (public.is_match_participant(auth.uid(), user_profiles.user_id));

-- 2. Replace requests_select_assigned_tutor (requests)
DROP POLICY IF EXISTS "requests_select_assigned_tutor" ON public.requests;
CREATE POLICY "requests_select_assigned_tutor"
  ON public.requests FOR SELECT TO authenticated
  USING (public.is_tutor_for_request(auth.uid(), requests.id));

-- 3. Replace tutor_profiles_select_matched_student (tutor_profiles)
DROP POLICY IF EXISTS "tutor_profiles_select_matched_student" ON public.tutor_profiles;
CREATE POLICY "tutor_profiles_select_matched_student"
  ON public.tutor_profiles FOR SELECT TO authenticated
  USING (public.is_student_for_tutor(auth.uid(), tutor_profiles.tutor_user_id));
