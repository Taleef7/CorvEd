-- Payment proofs private storage bucket + RLS policies
-- Per ARCHITECTURE.md §7

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Students can upload their own payment proofs
CREATE POLICY "Students can upload own proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Students can view their own proofs
CREATE POLICY "Students can view own proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all proofs (via service role — no policy needed, bypasses RLS)
-- But if queried via anon/authenticated client with admin role:
CREATE POLICY "Admin can view all proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.is_admin(auth.uid())
  );

-- Nobody can delete proofs (no DELETE policy)
