## Parent epic

Epic E5: packages and payments (P0) — #30

## Objective

Create Supabase migrations for the `packages` and `payments` tables with correct schema, indexes, and RLS policies. Also create the Supabase Storage bucket `payment-proofs` for private proof file storage.

---

## Background

From `docs/ARCHITECTURE.md` section 5.5:

```sql
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
  method text not null default 'bank_transfer',
  reference text,
  proof_path text,
  status public.payment_status_enum not null default 'pending',
  verified_by_user_id uuid references public.user_profiles(user_id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.packages (status, start_date desc);
create index on public.payments (status, created_at desc);
```

---

## Migration: `<ts>_create_packages_payments.sql`

Include all tables, indexes, and RLS policies:

```sql
-- Tables and indexes as above --

-- RLS: packages
alter table public.packages enable row level security;

create policy "packages_insert_creator"
  on public.packages for insert to authenticated
  with check (
    exists (
      select 1 from public.requests r
      where r.id = packages.request_id and r.created_by_user_id = auth.uid()
    )
  );

create policy "packages_select_creator_or_admin"
  on public.packages for select to authenticated
  using (
    public.is_admin(auth.uid()) or
    exists (
      select 1 from public.requests r
      where r.id = packages.request_id and r.created_by_user_id = auth.uid()
    )
  );

create policy "packages_admin_update"
  on public.packages for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- RLS: payments
alter table public.payments enable row level security;

create policy "payments_insert_payer"
  on public.payments for insert to authenticated
  with check (payer_user_id = auth.uid());

create policy "payments_select_payer_or_admin"
  on public.payments for select to authenticated
  using (payer_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "payments_update_payer_limited"
  on public.payments for update to authenticated
  using (payer_user_id = auth.uid() and status = 'pending')
  with check (payer_user_id = auth.uid() and status = 'pending');

create policy "payments_admin_update"
  on public.payments for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
```

---

## Supabase Storage setup

In **Supabase Dashboard → Storage → New Bucket**:
- Name: `payment-proofs`
- Public: **No** (private bucket)

Storage RLS policies (from `docs/ARCHITECTURE.md` section 7):
```sql
-- Allow payer to upload their own proof
create policy "payment_proof_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow payer to read their own proof (via signed URL)
create policy "payment_proof_select_owner"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all proofs
create policy "payment_proof_select_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.is_admin(auth.uid())
  );
```

> **Note**: Admin reads are ideally done server-side using the service role key (bypasses RLS), so the storage policies for admin read are optional. Service role signed URL generation is safer for production.

---

## Proposed steps

1. Create migration `<ts>_create_packages_payments.sql`
2. Run `supabase db reset` locally — verify tables created
3. Create `payment-proofs` bucket in Supabase Dashboard
4. Optionally add storage RLS policies via Dashboard or migration
5. Verify anon user cannot read packages (only creator can)
6. Verify admin client can read all packages and payments

---

## Definition of done

- [ ] `packages` table exists with correct schema, indexes, and RLS
- [ ] `payments` table exists with correct schema, indexes, and RLS
- [ ] `payment-proofs` storage bucket is created and private
- [ ] Storage policies allow payer to upload and admin to read
- [ ] `supabase db reset` completes without errors

---

## References

- `docs/ARCHITECTURE.md` — section 5.5 (packages + payments), section 6.4 (RLS intent), section 7 (storage)
- `docs/MVP.md` — section 7 (payments — required fields)
