-- E4 T4.1: requests table with RLS policies
-- Closes #27

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references public.user_profiles(user_id) on delete restrict,
  requester_role public.role_enum not null default 'student',
  for_student_name text,
  level public.level_enum not null,
  subject_id smallint not null references public.subjects(id),
  exam_board public.exam_board_enum not null default 'unspecified',
  goals text,
  timezone text not null default 'Asia/Karachi',
  availability_windows jsonb not null default '[]'::jsonb,
  preferred_start_date date,
  status public.request_status_enum not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.requests (status, created_at desc);
create index on public.requests (created_by_user_id);

-- updated_at trigger
create or replace function public.requests_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger requests_updated_at
  before update on public.requests
  for each row execute function public.requests_set_updated_at();

-- Row Level Security
alter table public.requests enable row level security;

create policy "requests_insert_self"
  on public.requests for insert to authenticated
  with check (created_by_user_id = auth.uid());

create policy "requests_select_creator_or_admin"
  on public.requests for select to authenticated
  using (created_by_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "requests_update_creator_limited"
  on public.requests for update to authenticated
  using (created_by_user_id = auth.uid() and status in ('new', 'payment_pending'))
  with check (created_by_user_id = auth.uid() and status in ('new', 'payment_pending'));

create policy "requests_admin_update"
  on public.requests for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
