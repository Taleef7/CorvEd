-- E7 T7.3: matches table with RLS policies
-- Closes #49

create table public.matches (
  id                  uuid primary key default gen_random_uuid(),
  request_id          uuid not null unique references public.requests(id) on delete cascade,
  tutor_user_id       uuid not null references public.tutor_profiles(tutor_user_id) on delete restrict,
  status              public.match_status_enum not null default 'matched',
  meet_link           text,
  schedule_pattern    jsonb,
  assigned_by_user_id uuid references public.user_profiles(user_id),
  assigned_at         timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on public.matches (status);
create index on public.matches (tutor_user_id);
create index on public.matches (request_id);

-- updated_at trigger
create or replace function public.matches_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_updated_at
  before update on public.matches
  for each row execute function public.matches_set_updated_at();

alter table public.matches enable row level security;

-- Admin can do everything
create policy "matches_admin_all"
  on public.matches for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Tutor assigned to the match or the request creator can select
create policy "matches_select_participants"
  on public.matches for select to authenticated
  using (
    tutor_user_id = auth.uid()
    or exists (
      select 1 from public.requests r
      where r.id = matches.request_id
        and r.created_by_user_id = auth.uid()
    )
  );
