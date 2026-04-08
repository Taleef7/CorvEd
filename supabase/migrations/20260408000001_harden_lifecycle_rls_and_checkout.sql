-- Harden client-controlled lifecycle state and move package checkout into one RPC.

-- Guard against duplicate pending/active packages for the same request.
create unique index if not exists packages_one_open_package_per_request
  on public.packages (request_id)
  where status in ('pending', 'active');

-- Requests: users can create only their own initial request state.
drop policy if exists "requests_insert_self" on public.requests;
create policy "requests_insert_self"
  on public.requests for insert to authenticated
  with check (
    requests.created_by_user_id = auth.uid()
    and requests.status = 'new'
    and requests.requester_role in ('student', 'parent')
  );

-- Packages: client inserts must remain initial, owned, and internally consistent.
drop policy if exists "packages_insert_creator" on public.packages;
create policy "packages_insert_creator"
  on public.packages for insert to authenticated
  with check (
    packages.status = 'pending'
    and packages.tier_sessions in (8, 12, 20)
    and packages.sessions_total = packages.tier_sessions
    and packages.sessions_used = 0
    and packages.end_date >= packages.start_date
    and exists (
      select 1
      from public.requests r
      where r.id = packages.request_id
        and r.created_by_user_id = auth.uid()
        and r.status in ('new', 'payment_pending')
    )
  );

-- Payments: client inserts/updates must stay pending, owned, and unverified.
drop policy if exists "payments_insert_payer" on public.payments;
create policy "payments_insert_payer"
  on public.payments for insert to authenticated
  with check (
    payments.payer_user_id = auth.uid()
    and payments.status = 'pending'
    and payments.method = 'bank_transfer'
    and payments.rejection_note is null
    and payments.verified_by_user_id is null
    and payments.verified_at is null
    and exists (
      select 1
      from public.packages p
      join public.requests r on r.id = p.request_id
      where p.id = payments.package_id
        and r.created_by_user_id = auth.uid()
        and payments.amount_pkr = case p.tier_sessions
          when 8 then 8000
          when 12 then 11000
          when 20 then 16000
        end
    )
  );

drop policy if exists "payments_update_payer_limited" on public.payments;
create policy "payments_update_payer_limited"
  on public.payments for update to authenticated
  using (
    payments.payer_user_id = auth.uid()
    and payments.status = 'pending'
  )
  with check (
    payments.payer_user_id = auth.uid()
    and payments.status = 'pending'
    and payments.method = 'bank_transfer'
    and payments.rejection_note is null
    and payments.verified_by_user_id is null
    and payments.verified_at is null
    and exists (
      select 1
      from public.packages p
      join public.requests r on r.id = p.request_id
      where p.id = payments.package_id
        and r.created_by_user_id = auth.uid()
        and payments.amount_pkr = case p.tier_sessions
          when 8 then 8000
          when 12 then 11000
          when 20 then 16000
        end
    )
  );

create or replace function public.checkout_package(
  p_request_id uuid,
  p_tier_sessions int
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_package_id uuid;
  v_existing_tier int;
  v_amount int;
  v_start_date date := current_date;
  v_end_date date := (current_date + interval '1 month')::date;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_tier_sessions not in (8, 12, 20) then
    raise exception 'invalid package tier';
  end if;

  select case p_tier_sessions
    when 8 then 8000
    when 12 then 11000
    when 20 then 16000
  end into v_amount;

  select p.id, p.tier_sessions
  into v_package_id, v_existing_tier
  from public.packages p
  join public.requests r on r.id = p.request_id
  where p.request_id = p_request_id
    and r.created_by_user_id = v_user_id
    and p.status in ('pending', 'active')
  order by p.created_at desc
  limit 1;

  if v_package_id is not null then
    select case v_existing_tier
      when 8 then 8000
      when 12 then 11000
      when 20 then 16000
    end into v_amount;

    insert into public.payments (
      package_id,
      payer_user_id,
      amount_pkr,
      method,
      status
    )
    select
      v_package_id,
      v_user_id,
      v_amount,
      'bank_transfer',
      'pending'
    where not exists (
      select 1 from public.payments pay where pay.package_id = v_package_id
    );

    return v_package_id;
  end if;

  perform 1
  from public.requests r
  where r.id = p_request_id
    and r.created_by_user_id = v_user_id
    and r.status in ('new', 'payment_pending')
  for update;

  if not found then
    raise exception 'request not available for checkout';
  end if;

  insert into public.packages (
    request_id,
    tier_sessions,
    start_date,
    end_date,
    sessions_total,
    sessions_used,
    status
  )
  values (
    p_request_id,
    p_tier_sessions,
    v_start_date,
    v_end_date,
    p_tier_sessions,
    0,
    'pending'
  )
  returning id into v_package_id;

  update public.requests
  set status = 'payment_pending',
      updated_at = now()
  where id = p_request_id
    and created_by_user_id = v_user_id
    and status = 'new';

  insert into public.payments (
    package_id,
    payer_user_id,
    amount_pkr,
    method,
    status
  )
  values (
    v_package_id,
    v_user_id,
    v_amount,
    'bank_transfer',
    'pending'
  );

  return v_package_id;
end;
$$;

revoke execute on function public.checkout_package(uuid, int) from public, anon;
grant execute on function public.checkout_package(uuid, int) to authenticated;

-- Replace tutor_update_session with a future-session guard plus existing usage delta logic.
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
      'tutor_notes', p_notes
    )
  );
end;
$$;
