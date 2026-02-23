-- E3 T3.1: backfill leads RLS to allow admin-role users (after is_admin() is available)
-- Closes #20

-- Allow authenticated admins to read leads (in addition to service role)
create policy "Admin role can read leads"
  on public.leads
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- Allow authenticated admins to update leads
create policy "Admin role can update leads"
  on public.leads
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
