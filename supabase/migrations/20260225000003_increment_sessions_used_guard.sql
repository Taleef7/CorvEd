-- E10 T10.3: Add sessions_used < sessions_total guard to increment_sessions_used RPC
-- Prevents over-incrementing when a package is fully consumed (sessions_used exceeding sessions_total)
-- Closes #70

-- Recreate increment_sessions_used with the safety guard and safe search_path
create or replace function public.increment_sessions_used(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.packages
  set sessions_used = sessions_used + 1,
      updated_at    = now()
  where request_id = p_request_id
    and status = 'active'
    and sessions_used < sessions_total;
end;
$$;

-- Restrict direct RPC invocation: revoke from public/authenticated so only
-- trusted security-definer callers (tutor_update_session, admin service role)
-- can increment sessions_used — prevents any authenticated user from calling
-- this directly with an arbitrary request_id.
revoke execute on function public.increment_sessions_used(uuid) from public, authenticated;
grant execute on function public.increment_sessions_used(uuid) to service_role;
