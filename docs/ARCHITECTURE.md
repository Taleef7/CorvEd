# CorvEd architecture

Last updated: 2026-02-22  
Stack: Next.js (App Router) + Supabase (Postgres + Auth + Storage)  
Primary market: Pakistan, supports overseas students (timezone-aware)  
Primary comms: WhatsApp (manual or WhatsApp Business), platform is source of truth

This document is implementation-oriented. It defines the concrete backend schema, security model (RLS), app structure, and the core workflows exactly as required by docs/MVP.md.

Contents
1) high-level system overview
2) environment and deployment architecture
3) Next.js architecture (routes, layers, services)
4) Supabase architecture (Auth, DB, RLS, Storage)
5) database schema (tables, enums, constraints, indexes)
6) security model and RLS policies (exact intent + SQL skeleton)
7) storage (payment proofs)
8) key workflows (sequence-level detail)
9) scheduling and timezone model (canonical approach)
10) operational tooling (WhatsApp templates and deep links)
11) migrations, seeding, local development
12) observability and error handling
13) future-proofing notes (post-MVP extensions)

--------------------------------------------------------------------------------

## 1) high-level system overview

CorvEd is a managed tutoring service with a platform layer.

Core objects:
- request: created by student/parent describing level+subject+availability
- package: monthly sessions (8/12/20) purchased per subject
- payment: manual bank transfer verification; payment status gates matching
- match: admin assigns an approved tutor to a paid request, stores recurring Meet link and schedule pattern
- session: generated for the month, stored as UTC timestamps; tutors mark attendance and add notes

Core principles:
- platform is the system of record (status, schedule, remaining sessions)
- WhatsApp is the communication layer (templates, reminders, reschedules)
- matching is manual in MVP
- payments are manual verification in MVP
- online delivery is via a recurring Google Meet link per match

--------------------------------------------------------------------------------

## 2) environment and deployment architecture

2.1 components
- client: Next.js web app (mobile responsive)
- backend: Supabase Postgres + Auth + Storage
- server-side logic: Next.js Route Handlers / Server Actions using Supabase service role when necessary
- optional: Supabase Edge Functions (not required for MVP; can be used later for automation)

2.2 deployment
- Next.js deployed on Vercel
- Supabase hosted project (managed)
- domain: TBD (Vercel domain first is fine)

2.3 secrets and keys
- public:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- server-only (never exposed to browser):
  - SUPABASE_SERVICE_ROLE_KEY
  - GOOGLE_OAUTH_CLIENT_ID / SECRET (configured in Supabase provider settings; not in Next env unless needed for custom flows)
  - any SMTP / email provider keys if used beyond Supabase Auth defaults

2.4 environments
- local: Supabase local dev (supabase start) + Next.js dev server
- staging (optional): separate Supabase project + Vercel preview
- production: main Supabase project + Vercel production

--------------------------------------------------------------------------------

## 3) Next.js architecture (routes, layers, services)

3.1 Next.js structure (recommended)
Use Next.js App Router.

Suggested folder structure:
- app/
  - page.tsx (landing)
  - auth/
    - sign-in/page.tsx
    - sign-up/page.tsx
    - callback/route.ts (OAuth callback handler)
    - verify/page.tsx (post-signup instructions)
  - dashboard/
    - page.tsx (role-aware redirect)
    - requests/new/page.tsx
    - requests/[id]/page.tsx
    - packages/[id]/page.tsx
    - sessions/page.tsx
  - tutor/
    - page.tsx
    - sessions/page.tsx
    - profile/page.tsx
  - admin/
    - page.tsx
    - requests/page.tsx
    - requests/[id]/page.tsx
    - tutors/page.tsx
    - matches/[id]/page.tsx
    - payments/page.tsx
    - sessions/page.tsx
  - policies/page.tsx (optional but recommended pre-launch)
- lib/
  - supabase/
    - client.ts (browser client with anon key)
    - server.ts (server client with cookies)
    - admin.ts (service role client, server-only)
  - services/
    - requests.ts
    - payments.ts
    - matching.ts
    - scheduling.ts
    - sessions.ts
    - whatsapp.ts (template rendering + wa.me link builder)
  - validators/
    - request.ts (zod schemas)
    - payment.ts
- components/
  - ui/…
  - dashboards/…
- docs/ (already exists)

3.2 data access pattern (recommended)
- browser reads and writes only where RLS allows using anon key session
- admin actions that must bypass RLS (or perform multi-step transactions) are done server-side:
  - mark payment as paid
  - create match
  - generate sessions
  - reschedule session
- tutor session completion can be done either:
  - direct update with RLS constraints (harder to enforce column restrictions), or
  - via RPC functions with strict validation (recommended; see section 6)

3.3 route handlers / server actions (recommended)
- app/admin/* pages call Server Actions that use SUPABASE_SERVICE_ROLE_KEY (never exposed)
- avoid placing service role key in NEXT_PUBLIC variables
- always validate inputs (zod) on server boundaries

--------------------------------------------------------------------------------

## 4) Supabase architecture (Auth, DB, RLS, Storage)

4.1 Auth
Enable:
- email/password signups with email confirmation required
- Google OAuth provider enabled
Email verification requirement:
- for email/password, user must confirm email before using core features
- enforce in app: if auth.user.email_confirmed_at is null, show verify screen and restrict writes

4.2 Database
- Postgres with explicit enums
- RLS enabled on all business tables
- write operations constrained to role rules
- audit logging for admin-sensitive actions (recommended)

4.3 Storage
- private bucket for payment proofs
- access controlled by RLS policies on storage.objects

--------------------------------------------------------------------------------

## 5) database schema (tables, enums, constraints, indexes)

This is a concrete schema blueprint. Implement via Supabase migrations.

5.1 enums

```sql
-- roles
create type public.role_enum as enum ('student', 'parent', 'tutor', 'admin');

-- tutoring levels
create type public.level_enum as enum ('o_levels', 'a_levels');

-- exam boards (optional field in requests)
create type public.exam_board_enum as enum ('cambridge', 'edexcel', 'other', 'unspecified');

-- request lifecycle
create type public.request_status_enum as enum (
  'new',
  'payment_pending',
  'ready_to_match',
  'matched',
  'active',
  'paused',
  'ended'
);

-- package lifecycle
create type public.package_status_enum as enum (
  'pending',
  'active',
  'expired'
);

-- payment lifecycle
create type public.payment_status_enum as enum (
  'pending',
  'paid',
  'rejected',
  'refunded'
);

-- match lifecycle
create type public.match_status_enum as enum (
  'matched',
  'active',
  'paused',
  'ended'
);

-- session lifecycle
create type public.session_status_enum as enum (
  'scheduled',
  'done',
  'rescheduled',
  'no_show_student',
  'no_show_tutor'
);

5.2 reference tables

Subjects are fixed in MVP but stored as data.

create table public.subjects (
  id smallint generated by default as identity primary key,
  code text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

-- Seed codes (MVP):
-- math, physics, chemistry, biology, english, cs, pak_studies, islamiyat, urdu

5.3 user profile and roles

Use auth.users as the identity source. Mirror business fields in public.user_profiles.

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  whatsapp_number text,
  timezone text not null default 'Asia/Karachi',
  primary_role public.role_enum not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid references public.user_profiles(user_id) on delete cascade,
  role public.role_enum not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Optional helper for “parent signing up for child”
create table public.parent_students (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.user_profiles(user_id) on delete cascade,
  student_name text not null,
  student_age_band text, -- e.g., 'under_13', '13_15', '16_18', '18_plus' (optional)
  created_at timestamptz not null default now()
);

Notes:

primary_role drives UI routing (dashboard choice).

user_roles supports multiple roles (admin can assign tutor+admin, etc.).

parent_students is optional but useful for parent context and is low-cost to add.

5.4 tutor profile

create table public.tutor_profiles (
  tutor_user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
  approved boolean not null default false,
  bio text,
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_subjects (
  tutor_user_id uuid references public.tutor_profiles(tutor_user_id) on delete cascade,
  subject_id smallint references public.subjects(id),
  level public.level_enum not null,
  primary key (tutor_user_id, subject_id, level)
);

-- availability windows stored as JSONB for MVP simplicity
-- format: [{ "day": 0..6, "start": "18:00", "end": "20:00" }, ...]
create table public.tutor_availability (
  tutor_user_id uuid primary key references public.tutor_profiles(tutor_user_id) on delete cascade,
  windows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

5.5 requests, packages, payments

Requests are single-subject in MVP.

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references public.user_profiles(user_id) on delete restrict,

  -- who is being tutored
  requester_role public.role_enum not null default 'student', -- 'student' or 'parent'
  for_student_name text, -- if parent, store child name; optional for student

  level public.level_enum not null,
  subject_id smallint not null references public.subjects(id),
  exam_board public.exam_board_enum not null default 'unspecified',
  goals text,

  -- availability windows in requester timezone
  timezone text not null default 'Asia/Karachi',
  availability_windows jsonb not null default '[]'::jsonb,

  preferred_start_date date,
  status public.request_status_enum not null default 'new',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,

  tier_sessions int not null check (tier_sessions in (8,12,20)),
  start_date date not null,
  end_date date not null,
  sessions_total int not null,
  sessions_used int not null default 0,
  status public.package_status_enum not null default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  payer_user_id uuid not null references public.user_profiles(user_id) on delete restrict,

  amount_pkr int not null check (amount_pkr > 0),
  method text not null default 'bank_transfer', -- MVP: only bank_transfer
  reference text,
  proof_path text, -- storage path in Supabase Storage
  status public.payment_status_enum not null default 'pending',

  verified_by_user_id uuid references public.user_profiles(user_id),
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.requests (status, created_at desc);
create index on public.packages (status, start_date desc);
create index on public.payments (status, created_at desc);

5.6 matches and sessions

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete cascade,
  tutor_user_id uuid not null references public.tutor_profiles(tutor_user_id) on delete restrict,

  status public.match_status_enum not null default 'matched',

  -- recurring meet link (one per match)
  meet_link text,

  -- schedule pattern used for session generation
  -- format example:
  -- { "timezone": "Asia/Karachi", "days": [1,3], "time": "19:00", "duration_mins": 60 }
  schedule_pattern jsonb,

  assigned_by_user_id uuid references public.user_profiles(user_id),
  assigned_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,

  scheduled_start_utc timestamptz not null,
  scheduled_end_utc timestamptz not null,

  status public.session_status_enum not null default 'scheduled',
  tutor_notes text,

  updated_by_user_id uuid references public.user_profiles(user_id),
  updated_at timestamptz not null default now(),

  -- helpful denormalization for ordering
  created_at timestamptz not null default now()
);

create index on public.sessions (match_id, scheduled_start_utc asc);
create index on public.sessions (status, scheduled_start_utc asc);

-- audit log (recommended)
create table public.audit_logs (
  id bigint generated by default as identity primary key,
  actor_user_id uuid references public.user_profiles(user_id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.audit_logs (created_at desc);

5.7 derived constraints (application-level)
Some constraints are easier to enforce in code/RPC:

sessions_used = count of sessions with status in (done, no_show_student) within package window

package expiry at end_date

request status transitions

MVP approach:

store sessions_used and update it transactionally when session completes (recommended via RPC)

alternatively compute remaining sessions on the fly (simpler, but more query complexity)

6) security model and RLS policies

Goal: every read/write must be safe when using the Supabase anon key + user session.

General pattern:

enable RLS on all business tables

create helper functions for role checks

restrict admin-only actions either:

via RLS using role check functions, or

via server-side service role key

for tutor updates, prefer RPC functions to avoid “tutor editing scheduled times” problems

6.1 helper functions

create or replace function public.has_role(p_uid uuid, p_role public.role_enum)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_uid and ur.role = p_role
  );
$$;

create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
as $$
  select public.has_role(p_uid, 'admin');
$$;

create or replace function public.is_tutor(p_uid uuid)
returns boolean
language sql
stable
as $$
  select public.has_role(p_uid, 'tutor');
$$;

6.2 trigger to create profile on signup (recommended)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (user_id, display_name, timezone, primary_role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New User'), 'Asia/Karachi', 'student')
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

6.3 enable RLS

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.requests enable row level security;
alter table public.packages enable row level security;
alter table public.payments enable row level security;
alter table public.matches enable row level security;
alter table public.sessions enable row level security;
alter table public.audit_logs enable row level security;

6.4 RLS policy intent by table

user_profiles

select: user can read own profile; admin can read all

update: user can update own profile fields; admin can update all

insert: only via trigger (or admin)

user_roles

select: user can read own roles; admin can read all

insert/update/delete: admin only

tutor_profiles / tutor_subjects / tutor_availability

select:

admin can read all

tutors can read their own

request creator can read their assigned tutor profile for their match (limited data is fine)

update:

tutor can update their own profile/availability

admin can approve and edit any

requests

insert: authenticated user for themselves (student or parent)

select: creator can read; admin can read all

update:

creator can update only when status in (new, payment_pending)

admin can update any status

packages

insert: request creator can create package for their own request

select: creator can read; admin can read all; tutor can read packages for matches they teach (optional, but useful)

update:

admin can activate/expire

creator cannot set active directly

payments

insert: payer can create pending payment for their own package

select: payer can read; admin can read all

update:

payer can only edit proof/reference while status = pending

admin can set status = paid/rejected/refunded

matches

insert: admin only (manual matching)

select:

admin

tutor assigned

request creator

update:

admin only (meet link, schedule pattern, status, reassignment)

sessions

insert: admin only (generated schedule)

select:

admin

tutor assigned

request creator

update:

recommended: only via RPC functions for tutors (status, notes) and admin (reschedule)

avoid direct updates to prevent non-admin changes to schedule

audit_logs

insert: admin or security definer functions

select: admin only

6.5 example RLS policies (skeleton)

user_profiles

create policy "profiles_select_own_or_admin"
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles_update_own_or_admin"
on public.user_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

user_roles

create policy "roles_select_own_or_admin"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "roles_admin_write"
on public.user_roles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

requests

create policy "requests_insert_self"
on public.requests
for insert
to authenticated
with check (created_by_user_id = auth.uid());

create policy "requests_select_creator_or_admin"
on public.requests
for select
to authenticated
using (created_by_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "requests_update_creator_limited"
on public.requests
for update
to authenticated
using (
  created_by_user_id = auth.uid()
  and status in ('new','payment_pending')
)
with check (
  created_by_user_id = auth.uid()
  and status in ('new','payment_pending')
);

create policy "requests_admin_update"
on public.requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

packages and payments follow similar patterns.

matches select policy requires joining via request. In Postgres RLS, you can reference exists subqueries.

create policy "matches_select_participants"
on public.matches
for select
to authenticated
using (
  public.is_admin(auth.uid())
  or tutor_user_id = auth.uid()
  or exists (
    select 1 from public.requests r
    where r.id = matches.request_id
      and r.created_by_user_id = auth.uid()
  )
);

create policy "matches_admin_write"
on public.matches
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

sessions select policy similarly references matches and requests.

6.6 RPC functions (recommended for safe updates)

Because tutors should not be able to edit scheduled times, use RPC functions.

Tutor completion function:

only the assigned tutor can call it

allows setting status to done / no_show_student / no_show_tutor

updates tutor_notes

increments sessions_used on the active package if status consumes a session

writes audit log

Admin reschedule function:

only admin can call it

updates scheduled_start_utc/end_utc

sets status to rescheduled if desired

writes audit log

Admin generate sessions function:

only admin can call it

inserts N sessions based on schedule pattern and package tier

writes audit log

Example RPC outline:

create or replace function public.tutor_update_session(
  p_session_id uuid,
  p_status public.session_status_enum,
  p_notes text
)
returns void
language plpgsql
security definer
as $$
declare
  v_match_id uuid;
  v_tutor_id uuid;
begin
  select s.match_id into v_match_id
  from public.sessions s
  where s.id = p_session_id;

  if v_match_id is null then
    raise exception 'session not found';
  end if;

  select m.tutor_user_id into v_tutor_id
  from public.matches m
  where m.id = v_match_id;

  if v_tutor_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- allow only certain statuses for tutor-side updates
  if p_status not in ('done','no_show_student','no_show_tutor') and not public.is_admin(auth.uid()) then
    raise exception 'invalid status transition';
  end if;

  update public.sessions
  set status = p_status,
      tutor_notes = p_notes,
      updated_by_user_id = auth.uid(),
      updated_at = now()
  where id = p_session_id;

  -- package decrement logic is best handled in application or a dedicated function
  -- MVP approach: maintain sessions_used by counting sessions with consuming statuses within package window
  -- or update package.sessions_used here via deterministic query.

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'tutor_update_session', 'session', p_session_id, jsonb_build_object('status', p_status));

end;
$$;

If you prefer purely application-side updates (server actions + service role), you can skip RPC and keep sessions table updates admin-only. But that reduces tutor autonomy. RPC is the recommended balance.

7) storage (payment proofs)

7.1 bucket

bucket name: payment-proofs

visibility: private

7.2 file path convention

payment-proofs/{payer_user_id}/{package_id}/{timestamp}_{original_filename}

7.3 policies

insert: payer can upload into their folder

select: payer can read their own proof; admin can read all

Supabase Storage policies are implemented on storage.objects.
Use bucket_id = 'payment-proofs'.

Example intent:

allow authenticated uploads where auth.uid() matches first folder segment

allow reads if admin or owner

Implementation detail: path parsing in SQL is doable but fiddly; an easier MVP approach is:

store proof_path and enforce that only the payment owner can set it while payment status is pending

allow admin reads via service role for verification

user reads only through signed URLs generated server-side (recommended for private proofs)

Recommended MVP design:

proofs remain private

admin UI uses server-side signed URLs to view proofs

student UI does not need to view proof after upload

8) key workflows (sequence-level detail)

8.1 signup and profile creation

user signs up via Supabase Auth

trigger inserts user_profiles and user_roles default student

user completes profile fields in UI:

display_name

whatsapp_number

timezone (auto-detected, editable)

8.2 request creation

student/parent submits request (single subject)

request inserted with status = new

user selects package (8/12/20)

package created with status = pending and start/end dates for the current month window

payment created with status = pending

Recommended status transitions:

request.new → request.payment_pending immediately after package/payment creation

after admin marks payment paid:

payment.pending → payment.paid

package.pending → package.active

request.payment_pending → request.ready_to_match

8.3 manual matching

admin opens ready_to_match requests

admin selects tutor filtered by subject + level (+ availability)

admin creates match

request.ready_to_match → request.matched (then request.active once sessions exist)

admin sets meet_link and schedule_pattern on match

8.4 schedule generation (monthly)

admin selects days/time pattern and start date

system generates N sessions (N = package.tier_sessions) for the month window

request.matched → request.active

match.matched → match.active

8.5 tutoring session execution

users click Meet link from dashboard

tutor logs attendance + notes

if status consumes a session (done or no_show_student), sessions_used increments and sessions_remaining decrements

8.6 reschedule

student requests reschedule via WhatsApp

admin edits the session time in platform

session.status = rescheduled (optional; you can keep status scheduled but with updated time; better to set rescheduled for audit)

enforce 24-hour cutoff policy in ops; MVP can enforce in UI later

9) scheduling and timezone model (canonical approach)

9.1 canonical storage

all session times stored in UTC using timestamptz:

sessions.scheduled_start_utc

sessions.scheduled_end_utc

9.2 display

every user has a timezone in user_profiles.timezone (IANA string)

UI displays session time in viewer timezone:

Intl.DateTimeFormat or luxon

in admin WhatsApp templates, include:

student local time

optionally PKT time for tutor/admin convenience

9.3 schedule_pattern
Store as JSONB on matches:

timezone: where the recurrence time is defined (typically student timezone)

days: array of integers 0..6 (Sun..Sat)

time: "HH:mm" local time

duration_mins: 60

Example:

{ "timezone": "Asia/Karachi", "days": [1,3], "time": "19:00", "duration_mins": 60 }

9.4 session generation algorithm (MVP)
Inputs:

match_id

schedule_pattern (days/time/timezone)

package tier_sessions N

package window start_date/end_date

Algorithm:

iterate dates from start_date to end_date in schedule_pattern.timezone

for each date whose day-of-week is in pattern.days:

combine date + pattern.time in that timezone

convert to UTC

create session with start/end UTC

stop when N sessions created

if insufficient slots in month, admin must adjust schedule or start earlier; do not spill into next month (locked policy)

Implement in Next.js server action using luxon:

DateTime.fromObject({ year, month, day, hour, minute }, { zone })

toUTC().toISO()

10) operational tooling (WhatsApp templates and deep links)

10.1 template storage

templates are authored and maintained in docs/OPS.md

app can embed templates as constants or store in DB later

10.2 copy-to-WhatsApp helpers
Admin UI should provide:

“copy message” button

“open WhatsApp” button (wa.me) where possible

10.3 wa.me link builder

format: https://wa.me/
<E164_NUMBER>?text=<urlencoded_message>

ensure numbers are stored with country code (Pakistan +92) for consistent deep links

if users enter local format, normalize on save (application layer)

11) migrations, seeding, local development

11.1 Supabase CLI (recommended)

install Supabase CLI

in repo root:

supabase init

supabase start (runs local Postgres + Studio)

11.2 migrations

store migrations in supabase/migrations

apply locally with:

supabase db reset (applies all migrations + seed)

deploy with:

supabase db push (or migration deploy in CI)

11.3 seed data
Create supabase/seed.sql:

insert subjects and set sort_order

optionally create an initial admin user role after you create the admin account:

insert into user_roles(user_id, role) values ('<your-uuid>', 'admin');

insert tutor role similarly for testing

Seed subjects example:

insert into public.subjects (code, name, sort_order) values
('math', 'Math', 1),
('physics', 'Physics', 2),
('chemistry', 'Chemistry', 3),
('biology', 'Biology', 4),
('english', 'English', 5),
('cs', 'Computer Science', 6),
('pak_studies', 'Pakistan Studies', 7),
('islamiyat', 'Islamiyat', 8),
('urdu', 'Urdu', 9)
on conflict (code) do nothing;

11.4 Next.js local env
Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=…

NEXT_PUBLIC_SUPABASE_ANON_KEY=…

SUPABASE_SERVICE_ROLE_KEY=… (server-only)

11.5 database types
Generate types for type-safe queries:

supabase gen types typescript --local > lib/supabase/database.types.ts
(or for hosted: --project-id)

12) observability and error handling

12.1 logging

server actions should log:

actor user id

operation name

entity ids

errors with context

write admin-sensitive operations to audit_logs

12.2 error reporting (optional but recommended)

Sentry for Next.js

ensure PII is not logged (WhatsApp numbers should be treated as sensitive)

12.3 rate limiting (optional)

Vercel edge middleware or a lightweight rate limiter on auth endpoints and intake form

not required for MVP, but useful if spam becomes an issue

13) future-proofing notes (post-MVP)

Planned expansions are simplified by the current schema:

add SAT/IELTS/TOEFL:

extend levels table or add program_type enum

extend subjects list or create separate offerings table

admissions counseling:

new service type with deliverables (documents, calls) and different package model

WhatsApp automation:

store message logs table + integrate WhatsApp Business API

calendar integration:

google calendar OAuth + event creation per match or per session

carryover policy:

add carryover_count to packages and modify expiry logic

group sessions:

introduce session_participants join table and group_match concept

Implementation notes that should be followed strictly

enforce email verification in the app before allowing request/package creation

store all session timestamps as UTC timestamptz

do not allow tutors to update session scheduled times; use RPC or admin-only server actions

keep matching manual; do not build “auto match” for MVP

keep payments manual; do not integrate payment gateways for MVP

keep WhatsApp as ops channel; platform is the record system

End of ARCHITECTURE.md