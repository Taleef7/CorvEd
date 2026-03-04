-- MVP subject list seed
-- Subjects: Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, Urdu

INSERT INTO public.subjects (code, name) VALUES
  ('math', 'Mathematics'),
  ('physics', 'Physics'),
  ('chemistry', 'Chemistry'),
  ('biology', 'Biology'),
  ('english', 'English'),
  ('cs', 'Computer Science'),
  ('pak_studies', 'Pakistan Studies'),
  ('islamiyat', 'Islamiyat'),
  ('urdu', 'Urdu')
ON CONFLICT (code) DO NOTHING;
