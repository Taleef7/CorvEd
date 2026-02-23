-- E3 T3.1: all MVP enum types
-- Closes #20

create type public.role_enum as enum ('student', 'parent', 'tutor', 'admin');
create type public.level_enum as enum ('o_levels', 'a_levels');
create type public.exam_board_enum as enum ('cambridge', 'edexcel', 'other', 'unspecified');

create type public.request_status_enum as enum (
  'new',
  'payment_pending',
  'ready_to_match',
  'matched',
  'active',
  'paused',
  'ended'
);

create type public.package_status_enum as enum ('pending', 'active', 'expired');
create type public.payment_status_enum as enum ('pending', 'paid', 'rejected', 'refunded');
create type public.match_status_enum as enum ('matched', 'active', 'paused', 'ended');

create type public.session_status_enum as enum (
  'scheduled',
  'done',
  'rescheduled',
  'no_show_student',
  'no_show_tutor'
);
