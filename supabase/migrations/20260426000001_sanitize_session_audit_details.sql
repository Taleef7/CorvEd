-- Keep tutor_update_session audit details useful without storing tutor notes/free text.

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
  v_match_id              uuid;
  v_tutor_id              uuid;
  v_request_id            uuid;
  v_prev_status           public.session_status_enum;
  v_scheduled_start_utc   timestamptz;
  v_old_consuming         boolean;
  v_new_consuming         boolean;
begin
  select status, match_id, scheduled_start_utc
  into   v_prev_status, v_match_id, v_scheduled_start_utc
  from   public.sessions
  where  id = p_session_id;

  if v_match_id is null then
    raise exception 'session not found';
  end if;

  select tutor_user_id, request_id
  into   v_tutor_id, v_request_id
  from   public.matches
  where  id = v_match_id;

  if v_tutor_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if p_status not in ('done', 'no_show_student', 'no_show_tutor')
     and not public.is_admin(auth.uid()) then
    raise exception 'invalid status for tutor update';
  end if;

  if p_status in ('done', 'no_show_student', 'no_show_tutor')
     and v_scheduled_start_utc > now()
     and not public.is_admin(auth.uid()) then
    raise exception 'session has not started yet';
  end if;

  update public.sessions
  set status             = p_status,
      tutor_notes        = p_notes,
      updated_by_user_id = auth.uid(),
      updated_at         = now()
  where id = p_session_id;

  v_old_consuming := v_prev_status in ('done', 'no_show_student');
  v_new_consuming := p_status      in ('done', 'no_show_student');

  if v_new_consuming and not v_old_consuming then
    perform public.increment_sessions_used(v_request_id);
  end if;

  if v_old_consuming and not v_new_consuming then
    perform public.decrement_sessions_used(v_request_id);
  end if;

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'session_status_updated',
    'session',
    p_session_id,
    jsonb_build_object(
      'previous_status', v_prev_status,
      'status', p_status,
      'tutor_notes_redacted', p_notes is not null and length(trim(p_notes)) > 0
    )
  );
end;
$$;
