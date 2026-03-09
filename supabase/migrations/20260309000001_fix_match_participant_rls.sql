-- Fix RLS to allow match participants to read each other's data through joins.
-- Without these policies, tutors can't read student names/subjects via sessions→matches→requests,
-- and students can't read tutor names via sessions→matches→tutor_profiles→user_profiles.
-- This fixes blank session details on both tutor and student dashboards.

-- 1. Allow tutors to read requests they are assigned to (via matches)
create policy "requests_select_assigned_tutor"
  on public.requests for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.request_id = requests.id
        and m.tutor_user_id = auth.uid()
    )
  );

-- 2. Allow students to read tutor_profiles for tutors matched to their requests
create policy "tutor_profiles_select_matched_student"
  on public.tutor_profiles for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.requests r on r.id = m.request_id
      where m.tutor_user_id = tutor_profiles.tutor_user_id
        and r.created_by_user_id = auth.uid()
    )
  );

-- 3. Allow match participants to read each other's user_profiles
--    Tutor can read the student's profile; student can read the tutor's profile.
create policy "profiles_select_match_participant"
  on public.user_profiles for select to authenticated
  using (
    -- Tutor can read the profile of a student whose request they're matched to
    exists (
      select 1 from public.matches m
      join public.requests r on r.id = m.request_id
      where m.tutor_user_id = auth.uid()
        and r.created_by_user_id = user_profiles.user_id
    )
    or
    -- Student can read the profile of a tutor matched to their request
    exists (
      select 1 from public.matches m
      join public.requests r on r.id = m.request_id
      where r.created_by_user_id = auth.uid()
        and m.tutor_user_id = user_profiles.user_id
    )
  );
