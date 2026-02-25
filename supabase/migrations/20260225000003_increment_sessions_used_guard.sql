-- E10 T10.3: Add sessions_used < sessions_total guard to increment_sessions_used RPC
-- Prevents over-decrementing when a package is fully consumed
-- Closes #70

-- Recreate increment_sessions_used with the safety guard
create or replace function public.increment_sessions_used(p_request_id uuid)
returns void
language plpgsql
security definer
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
