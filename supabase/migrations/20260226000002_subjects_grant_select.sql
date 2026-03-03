-- Ensure anon + authenticated roles can SELECT subjects (needed for dropdown in request form)
grant select on public.subjects to anon, authenticated;

-- Re-seed subjects in case the initial migration seed was missed
insert into public.subjects (code, name, sort_order) values
  ('math',        'Mathematics',      1),
  ('physics',     'Physics',          2),
  ('chemistry',   'Chemistry',        3),
  ('biology',     'Biology',          4),
  ('english',     'English',          5),
  ('cs',          'Computer Science', 6),
  ('pak_studies', 'Pakistan Studies', 7),
  ('islamiyat',   'Islamiyat',        8),
  ('urdu',        'Urdu',             9)
on conflict (code) do nothing;
