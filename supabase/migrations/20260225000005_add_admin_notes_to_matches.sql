-- Add admin_notes text field to matches for internal admin comments
alter table public.matches add column admin_notes text;
