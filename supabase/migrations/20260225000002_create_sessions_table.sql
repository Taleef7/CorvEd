-- E8 T8.1 T8.3: sessions table, RLS, and helper RPCs
-- Closes #54 #56

-- Sessions table
create table public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  match_id             uuid not null references public.matches(id) on delete cascade,
  scheduled_start_utc  timestamptz not null,
  scheduled_end_utc    timestamptz not null,
  status               public.session_status_enum not null default 'scheduled',
  tutor_notes          text,
  updated_by_user_id   uuid references public.user_profiles(user_id),
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index on public.sessions (match_id, scheduled_start_utc asc);
create index on public.sessions (status, scheduled_start_utc asc);

alter table public.sessions enable row level security;

-- Admin: full access
create policy "sessions_admin_all"
  on public.sessions for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Tutor: select their own sessions (via match)
create policy "sessions_select_tutor"
  on public.sessions for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = sessions.match_id and m.tutor_user_id = auth.uid()
    )
  );

-- Student/parent: select their own sessions (via match → request)
create policy "sessions_select_student"
  on public.sessions for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.requests r on r.id = m.request_id
      where m.id = sessions.match_id and r.created_by_user_id = auth.uid()
    )
  );

-- Tutor: update status on their own sessions
create policy "sessions_update_tutor"
  on public.sessions for update to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = sessions.match_id and m.tutor_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.matches m
      where m.id = sessions.match_id and m.tutor_user_id = auth.uid()
    )
  );

-- RPC: atomically increment sessions_used on the active package for a request
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
    and status = 'active';
end;
$$;

-- RPC: tutor-callable session status update with authorization check
create or replace function public.tutor_update_session(
  p_session_id uuid,
  p_status     public.session_status_enum,
  p_notes      text
)
returns void
language plpgsql
security definer
as $$
declare
  v_match_id   uuid;
  v_tutor_id   uuid;
  v_request_id uuid;
begin
  -- Verify session exists and get match
  select match_id into v_match_id
  from public.sessions
  where id = p_session_id;

  if v_match_id is null then
    raise exception 'session not found';
  end if;

  -- Verify caller is the assigned tutor or admin
  select tutor_user_id, request_id
  into v_tutor_id, v_request_id
  from public.matches
  where id = v_match_id;

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

  -- Increment sessions_used if status consumes a session
  if p_status in ('done', 'no_show_student') then
    perform public.increment_sessions_used(v_request_id);
  end if;

  -- Audit log
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'session_status_updated',
    'session',
    p_session_id,
    jsonb_build_object('status', p_status, 'tutor_notes', p_notes)
  );
end;
$$;
