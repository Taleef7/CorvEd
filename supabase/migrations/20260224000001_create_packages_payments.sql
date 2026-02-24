-- E5 T5.1: packages and payments tables with RLS policies
-- Closes #33

-- ─── packages ───────────────────────────────────────────────────────────────

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  tier_sessions int not null check (tier_sessions in (8, 12, 20)),
  start_date date not null,
  end_date date not null,
  sessions_total int not null,
  sessions_used int not null default 0,
  status public.package_status_enum not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.packages (status, start_date desc);
create index on public.packages (request_id);

-- updated_at trigger
create or replace function public.packages_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger packages_updated_at
  before update on public.packages
  for each row execute function public.packages_set_updated_at();

-- Row Level Security
alter table public.packages enable row level security;

create policy "packages_insert_creator"
  on public.packages for insert to authenticated
  with check (
    exists (
      select 1 from public.requests r
      where r.id = packages.request_id and r.created_by_user_id = auth.uid()
    )
  );

create policy "packages_select_creator_or_admin"
  on public.packages for select to authenticated
  using (
    public.is_admin(auth.uid()) or
    exists (
      select 1 from public.requests r
      where r.id = packages.request_id and r.created_by_user_id = auth.uid()
    )
  );

create policy "packages_admin_update"
  on public.packages for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── payments ────────────────────────────────────────────────────────────────

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  payer_user_id uuid not null references public.user_profiles(user_id) on delete restrict,
  amount_pkr int not null check (amount_pkr > 0),
  method text not null default 'bank_transfer' check (method = 'bank_transfer'),
  reference text,
  proof_path text,
  status public.payment_status_enum not null default 'pending',
  rejection_note text,
  verified_by_user_id uuid references public.user_profiles(user_id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.payments (status, created_at desc);
create index on public.payments (package_id);
create index on public.payments (payer_user_id);

-- updated_at trigger
create or replace function public.payments_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.payments_set_updated_at();

-- Row Level Security
alter table public.payments enable row level security;

create policy "payments_insert_payer"
  on public.payments for insert to authenticated
  with check (payer_user_id = auth.uid());

create policy "payments_select_payer_or_admin"
  on public.payments for select to authenticated
  using (payer_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "payments_update_payer_limited"
  on public.payments for update to authenticated
  using (payer_user_id = auth.uid() and status = 'pending')
  with check (payer_user_id = auth.uid() and status = 'pending');

create policy "payments_admin_update"
  on public.payments for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── audit_logs ──────────────────────────────────────────────────────────────
-- Lightweight audit table for admin actions (payment verification etc.)

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.user_profiles(user_id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index on public.audit_logs (entity_type, entity_id);
create index on public.audit_logs (actor_user_id);

alter table public.audit_logs enable row level security;

create policy "audit_logs_admin_select"
  on public.audit_logs for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "audit_logs_admin_insert"
  on public.audit_logs for insert to authenticated
  with check (public.is_admin(auth.uid()));
