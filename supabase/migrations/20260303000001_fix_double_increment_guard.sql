-- B1: Fix double-increment guard in tutor_update_session RPC
-- The existing RPC increments sessions_used whenever the NEW status is
-- 'done' or 'no_show_student', regardless of what the PREVIOUS status was.
-- This means changing done → no_show_student (or re-submitting the same
-- status) double-increments sessions_used.
--
-- This migration replaces tutor_update_session with a version that:
--   a) Fetches the session's current status BEFORE updating
--   b) Only increments sessions_used when transitioning INTO a consuming
--      status (done / no_show_student) FROM a non-consuming status
--   c) Decrements sessions_used when transitioning OUT OF a consuming
--      status back to a non-consuming status (e.g. admin reverting to
--      'scheduled')
--   d) Keeps all existing authorization checks and audit logging intact

-- ── Helper: decrement_sessions_used ─────────────────────────────────────────
-- Mirror of increment_sessions_used — reduces sessions_used by 1 on the
-- active package, with a floor guard so it never goes below 0.

create or replace function public.decrement_sessions_used(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.packages
  set sessions_used = sessions_used - 1,
      updated_at    = now()
  where request_id = p_request_id
    and status = 'active'
    and sessions_used > 0;
end;
$$;

-- Restrict direct invocation — same policy as increment_sessions_used
revoke execute on function public.decrement_sessions_used(uuid) from public, authenticated;
grant execute on function public.decrement_sessions_used(uuid) to service_role;

-- ── Replace tutor_update_session with double-increment guard ────────────────

create or replace function public.tutor_update_session(
  p_session_id uuid,
  p_status     public.session_status_enum,
  p_notes      text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_match_id       uuid;
  v_tutor_id       uuid;
  v_request_id     uuid;
  v_prev_status    public.session_status_enum;
  v_old_consuming  boolean;
  v_new_consuming  boolean;
begin
  -- Fetch current session status and match_id BEFORE updating
  select status, match_id
  into   v_prev_status, v_match_id
  from   public.sessions
  where  id = p_session_id;

  if v_match_id is null then
    raise exception 'session not found';
  end if;

  -- Verify caller is the assigned tutor or admin
  select tutor_user_id, request_id
  into   v_tutor_id, v_request_id
  from   public.matches
  where  id = v_match_id;

  if v_tutor_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Tutors can only set: done, no_show_student, no_show_tutor
  if p_status not in ('done', 'no_show_student', 'no_show_tutor')
     and not public.is_admin(auth.uid()) then
    raise exception 'invalid status for tutor update';
  end if;

  -- Update session
  update public.sessions
  set status             = p_status,
      tutor_notes        = p_notes,
      updated_by_user_id = auth.uid(),
      updated_at         = now()
  where id = p_session_id;

  -- Determine whether old and new statuses are "consuming" (count against package)
  v_old_consuming := v_prev_status in ('done', 'no_show_student');
  v_new_consuming := p_status      in ('done', 'no_show_student');

  -- Only increment if transitioning INTO a consuming status from a non-consuming one
  if v_new_consuming and not v_old_consuming then
    perform public.increment_sessions_used(v_request_id);
  end if;

  -- Decrement if transitioning OUT OF a consuming status to a non-consuming one
  if v_old_consuming and not v_new_consuming then
    perform public.decrement_sessions_used(v_request_id);
  end if;

  -- Audit log (includes previous status for traceability)
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'session_status_updated',
    'session',
    p_session_id,
    jsonb_build_object(
      'previous_status', v_prev_status,
      'status', p_status,
      'tutor_notes', p_notes
    )
  );
end;
$$;
