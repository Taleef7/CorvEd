-- E6 T6.1: tutor_profiles, tutor_subjects, tutor_availability tables with RLS
-- Closes #40

-- ── tutor_profiles ────────────────────────────────────────────────────────────

create table public.tutor_profiles (
  tutor_user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
  approved      boolean not null default false,
  bio           text,
  timezone      text not null default 'Asia/Karachi',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.tutor_profiles_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tutor_profiles_updated_at
  before update on public.tutor_profiles
  for each row execute function public.tutor_profiles_set_updated_at();

-- ── tutor_subjects ────────────────────────────────────────────────────────────
-- One row per (tutor × subject × level) combination the tutor teaches.

create table public.tutor_subjects (
  tutor_user_id uuid     references public.tutor_profiles(tutor_user_id) on delete cascade,
  subject_id    smallint references public.subjects(id),
  level         public.level_enum not null,
  primary key (tutor_user_id, subject_id, level)
);

-- ── tutor_availability ────────────────────────────────────────────────────────
-- windows format: [{ "day": 0..6, "start": "18:00", "end": "20:00" }, ...]
-- day 0 = Sunday, 1 = Monday, ..., 6 = Saturday

create table public.tutor_availability (
  tutor_user_id uuid primary key references public.tutor_profiles(tutor_user_id) on delete cascade,
  windows       jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

create or replace function public.tutor_availability_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tutor_availability_updated_at
  before update on public.tutor_availability
  for each row execute function public.tutor_availability_set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.tutor_profiles    enable row level security;
alter table public.tutor_subjects    enable row level security;
alter table public.tutor_availability enable row level security;

-- tutor_profiles: tutor reads/updates own row; admin reads/updates all
create policy "tutor_profiles_select"
  on public.tutor_profiles for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_profiles_insert"
  on public.tutor_profiles for insert to authenticated
  with check (tutor_user_id = auth.uid());

create policy "tutor_profiles_update_own"
  on public.tutor_profiles for update to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());

create policy "tutor_profiles_admin_update"
  on public.tutor_profiles for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- tutor_subjects: tutor manages own rows; admin reads all
create policy "tutor_subjects_select"
  on public.tutor_subjects for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_subjects_write_own"
  on public.tutor_subjects for all to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());

-- tutor_availability: tutor manages own row; admin reads all
create policy "tutor_availability_select"
  on public.tutor_availability for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_availability_write_own"
  on public.tutor_availability for all to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());
