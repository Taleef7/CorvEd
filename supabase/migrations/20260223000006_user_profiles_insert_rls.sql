-- Fix: add missing INSERT policy on user_profiles so authenticated users can
-- upsert their own row during profile setup (trigger covers new signups, but
-- this policy is needed as a safety net if the trigger row is absent).

create policy "profiles_insert_own"
  on public.user_profiles for insert to authenticated
  with check (user_id = auth.uid());
