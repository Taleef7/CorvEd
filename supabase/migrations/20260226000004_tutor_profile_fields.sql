-- Add experience, education, and teaching approach fields to tutor_profiles
-- These are collected during tutor sign-up and editable on the tutor profile page

alter table public.tutor_profiles
  add column if not exists experience_years smallint,
  add column if not exists education text,
  add column if not exists teaching_approach text;

comment on column public.tutor_profiles.experience_years is
  'Years of tutoring/teaching experience (0=<1yr, 1=1-2yr, 2=2-5yr, 5=5-10yr, 10=10+yr)';
comment on column public.tutor_profiles.education is
  'Highest qualification, e.g. "BSc Physics, University of Karachi"';
comment on column public.tutor_profiles.teaching_approach is
  'Tutor''s self-described teaching style and approach';
