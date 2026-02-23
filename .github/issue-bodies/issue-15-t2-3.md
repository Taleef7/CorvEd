## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## Objective

Create the Supabase `leads` table that stores landing page intake form submissions, configure Row Level Security (RLS) to allow unauthenticated inserts, and set up an admin notification mechanism so that the admin is alerted when a new lead is submitted.

---

## Background

During Phase 0 (concierge validation), the intake form (T2.2) must be submittable without an account. The submitted data must be:
1. **Stored durably** in Supabase so it is not lost
2. **Visible to admin** as soon as possible so they can follow up via WhatsApp

This task handles both: the database schema for `leads` and the notification path to admin.

---

## Supabase migration: `leads` table

Create a new migration file: `supabase/migrations/<timestamp>_create_leads_table.sql`

```sql
-- leads: unauthenticated intake form submissions from the landing page
-- These are pre-auth qualification records, separate from the authenticated `requests` table.

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  -- contact info
  full_name text not null,
  whatsapp_number text not null,

  -- role context
  role text not null check (role in ('student', 'parent')),
  child_name text, -- null if role = 'student'

  -- request details
  level text not null check (level in ('o_levels', 'a_levels')),
  subject text not null check (subject in (
    'math', 'physics', 'chemistry', 'biology', 'english',
    'cs', 'pak_studies', 'islamiyat', 'urdu'
  )),
  exam_board text check (exam_board in ('cambridge', 'edexcel', 'other', 'not_sure')),

  -- scheduling context
  availability text not null,
  city_timezone text not null,

  -- optional context
  goals text,
  preferred_package text check (preferred_package in ('8', '12', '20')),

  -- admin tracking
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'disqualified')),
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for admin inbox ordering
create index on public.leads (status, created_at desc);

-- RLS: enable row level security
alter table public.leads enable row level security;

-- Policy: allow anyone (including anon) to insert a lead
create policy "Anyone can submit a lead"
  on public.leads
  for insert
  with check (true);

-- Policy: only admin can read and update leads
-- NOTE: public.is_admin() is defined in E3 (auth and roles).
-- Until E3 is merged, use auth.uid() is not null as a placeholder.
-- Tighten to is_admin(auth.uid()) once E3 is implemented.
create policy "Admin can read all leads"
  on public.leads
  for select
  using (auth.uid() is not null);

create policy "Admin can update leads"
  on public.leads
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
```

---

## Admin notification approach (Phase 0)

For MVP Phase 0, choose the **simplest reliable approach**:

### Option A: Supabase Email (recommended for Phase 0)

Use Supabase's built-in email functionality or a simple server action to send a notification email when a lead is inserted.

Create a Route Handler at `app/api/leads/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // TODO: Send admin notification email here (optional for Phase 0)
  // Options: Supabase Auth email, Resend, or Nodemailer
  // For minimum viable: log lead to console or use Supabase Dashboard alerts

  return NextResponse.json({ id: data.id })
}
```

> **For Phase 0 minimum viable notification**: The admin can monitor the Supabase Dashboard table view directly, or set up a Supabase real-time subscription. Email notification can be deferred to Phase 1 if it introduces complexity.

### Option B: Supabase Realtime + Dashboard alert (simplest, no code)

The admin watches the `leads` table in Supabase Dashboard. New rows appear in real time. This requires no additional code but is not scalable.

### Option C: Supabase Database Webhook → Admin Email (recommended if available)

Set up a Supabase Database Webhook on `INSERT` to `public.leads` that calls a Route Handler or an edge function to send an email (e.g., via Resend or Nodemailer).

**Recommendation**: Start with Option B (admin monitors dashboard) for Phase 0, and upgrade to Option A or C in Sprint 1.

---

## Admin dashboard integration (future)

The `leads` table has a `status` column (`new`, `contacted`, `qualified`, `disqualified`) and `admin_notes`. These fields support a future "Leads inbox" view in the admin dashboard (E7 or later). For now, the admin can update these fields directly in the Supabase Dashboard.

---

## Proposed steps

1. Create the migration file `supabase/migrations/<timestamp>_create_leads_table.sql` with the SQL above
2. Run `supabase db reset` locally to apply the migration and verify the table is created
3. Verify RLS: test that the anon key can `INSERT` but cannot `SELECT` leads
4. Update `components/LeadForm.tsx` (T2.2) to point to the correct table name (`leads`)
5. Decide on notification approach for Phase 0 and document it in `docs/OPS.md` section 11 (admin checklists)
6. If using Route Handler (Option A): create `app/api/leads/route.ts`

---

## Definition of done

- [ ] `supabase/migrations/<timestamp>_create_leads_table.sql` exists and is valid SQL
- [ ] `leads` table is created with all required columns and check constraints
- [ ] RLS is enabled with an "anyone can insert" policy
- [ ] Admin-only read/update policies are in place (or documented as deferred to E7)
- [ ] `supabase db reset` applies the migration without errors locally
- [ ] Intake form (T2.2) successfully inserts a row into `leads` when submitted
- [ ] Admin notification approach is decided and documented (even if it's just "monitor dashboard")

---

## Dependencies

- **E1 T1.1 (#6)** — `lib/supabase/admin.ts` and `lib/supabase/client.ts` must exist
- **T2.2 (#14)** — intake form must reference the correct table name from this task

---

## Risks / edge cases

- **Duplicate submissions**: The intake form (T2.2) disables the submit button after success. However, users can reload and resubmit. Consider adding a unique constraint on `(whatsapp_number, subject, level)` with `on conflict do nothing`, or just allow duplicates and let admin filter
- **Spam**: The `leads` table has no rate limiting in Phase 0. Consider adding Vercel edge rate limiting or a simple honeypot field if spam becomes an issue
- **`is_admin()` dependency**: The admin RLS policies depend on `public.is_admin()` from E3. If this task is implemented before E3, use `auth.role() = 'service_role'` as a temporary policy or skip admin policies until E3 is merged

---

## References

- `docs/OPS.md` — section 4 Workflow A (lead intake → qualified request)
- `docs/ARCHITECTURE.md` — section 4.2 (RLS), section 5.5 (requests schema — basis for lead schema), section 6.1 (`is_admin` helper function)
- `docs/MVP.md` — section 7 (payment flow — reference for how data flows from form to admin)
- `docs/ROADMAP.md` — Phase 0 deliverables, Sprint 0
