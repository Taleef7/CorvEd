-- Add preferred_package_tier to requests so students can indicate their desired package
-- Allowed values: 8, 12, or 20 sessions/month (or null = no preference)

alter table public.requests
  add column if not exists preferred_package_tier smallint
  check (preferred_package_tier is null or preferred_package_tier in (8, 12, 20));

comment on column public.requests.preferred_package_tier is
  'Optional: student-requested package size (8, 12, or 20 sessions/month)';
