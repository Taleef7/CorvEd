-- leads: unauthenticated intake form submissions from the landing page
-- These are pre-auth qualification records, separate from the authenticated `requests` table.

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  -- contact info
  full_name text not null,
  whatsapp_number text not null,

  -- role context
  role text not null check (role in ('student', 'parent')),
  child_name text, -- null if role = 'student'; optional per product spec

  -- request details
  level text not null check (level in ('o_levels', 'a_levels')),
  subject text not null check (subject in (
    'math', 'physics', 'chemistry', 'biology', 'english',
    'cs', 'pak_studies', 'islamiyat', 'urdu'
  )),
  -- defaults to 'not_sure' so NULL is never stored (makes querying consistent)
  exam_board text not null default 'not_sure' check (exam_board in ('cambridge', 'edexcel', 'other', 'not_sure')),

  -- scheduling context
  availability text not null,
  city_timezone text not null,

  -- optional context
  goals text,
  preferred_package text check (preferred_package in ('8', '12', '20')),

  -- admin tracking
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'disqualified')),
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for admin inbox ordering
create index on public.leads (status, created_at desc);

-- Trigger: keep updated_at current on every row update
create or replace function public.leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on public.leads
  for each row
  execute function public.leads_set_updated_at();

-- RLS: enable row level security
alter table public.leads enable row level security;

-- Policy: allow anyone (including anon) to insert a lead
create policy "Anyone can submit a lead"
  on public.leads
  for insert
  with check (
    status = 'new'
    and admin_notes is null
  );

-- Policy: only the service-role key (admin server-side) can read leads.
-- auth.role() = 'service_role' is true only when the Supabase service-role key
-- is used (e.g. from the admin client / Supabase Dashboard).
-- Regular authenticated end-users (students/parents) cannot read lead records.
-- TODO (E3): once the is_admin() helper and user_roles table are in place,
-- add OR public.is_admin(auth.uid()) to also allow admin-role users.
create policy "Service role can read leads"
  on public.leads
  for select
  using (auth.role() = 'service_role');

-- Policy: only the service-role key can update leads
create policy "Service role can update leads"
  on public.leads
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
