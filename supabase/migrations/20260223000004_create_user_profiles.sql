-- E3 T3.1: user_profiles + user_roles tables, helper functions, trigger, RLS
-- Closes #20

-- ── Tables ───────────────────────────────────────────────────────────────────

create table public.user_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  whatsapp_number text,
  timezone      text not null default 'Asia/Karachi',
  primary_role  public.role_enum not null default 'student',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.user_roles (
  user_id    uuid references public.user_profiles(user_id) on delete cascade,
  role       public.role_enum not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ── Helper functions ─────────────────────────────────────────────────────────

create or replace function public.has_role(p_uid uuid, p_role public.role_enum)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = p_uid and ur.role = p_role
  );
$$;

create or replace function public.is_admin(p_uid uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.has_role(p_uid, 'admin');
$$;

create or replace function public.is_tutor(p_uid uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.has_role(p_uid, 'tutor');
$$;

-- ── Auto-create profile on signup ────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_profiles (user_id, display_name, timezone, primary_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Karachi'),
    'student'
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.user_profiles_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.user_profiles_set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;

-- user_profiles: users see own row; admins see all
create policy "profiles_select_own_or_admin"
  on public.user_profiles for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- user_profiles: users update own row; admins update any
create policy "profiles_update_own_or_admin"
  on public.user_profiles for update to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- user_roles: users see own roles; admins see all
create policy "roles_select_own_or_admin"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- user_roles: only admins can write
create policy "roles_admin_write"
  on public.user_roles for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ── TODO (E2 backfill): update leads RLS to allow admin-role users ───────────
-- Once is_admin() helper exists, add to leads policy:
-- create policy "Admin can read leads"
--   on public.leads for select to authenticated
--   using (public.is_admin(auth.uid()));
-- create policy "Admin can update leads"
--   on public.leads for update to authenticated
--   using (public.is_admin(auth.uid()))
--   with check (public.is_admin(auth.uid()));
