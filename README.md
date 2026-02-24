# CorvEd

CorvEd is a structured tutoring platform for O Levels and A Levels students. The MVP is a managed tutoring service (not an open marketplace): students/parents submit a request, the admin manually matches them to a verified tutor, and the platform becomes the single source of truth for packages, schedules, Google Meet links, and session tracking.

Launch market: Pakistan-first, with support for overseas students (timezone-aware).

## MVP snapshot

In scope

* Levels: O Levels, A Levels
* Subjects: Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, Urdu
* Format: 1:1 online tutoring only
* Session length: 60 minutes
* Packages (per subject, per month): 8 / 12 / 20 sessions
* Payments: bank transfer, manually verified by admin
* Matching: manual by admin (tutors must be approved)
* Delivery: one recurring Google Meet link per student-subject match
* Ops: WhatsApp-first (WhatsApp Business recommended)

Out of scope for MVP

* SAT / IELTS / TOEFL
* Admissions counseling
* Group classes
* Automated payments
* Fully automated WhatsApp messaging via API (optional later)

## Repo structure

```text
.
├── app/                          # Next.js App Router routes (UI)
├── components/                   # UI components
├── lib/                          # Supabase clients, services, validators
├── middleware.ts                 # Next.js edge middleware: session refresh + route protection
├── supabase/                     # Migrations, seed data, local Supabase config
├── docs/                         # Product + ops + architecture docs
│   ├── MVP.md
│   ├── PRODUCT.md
│   ├── OPS.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
└── .github/
    └── ISSUE_TEMPLATE/           # Bug/story/task issue forms
```

## Documentation (start here)

* docs/MVP.md: MVP scope lock, policies, user flows, definition of done
* docs/ARCHITECTURE.md: Next.js + Supabase design, DB schema, RLS/RPC strategy, workflows
* docs/OPS.md: WhatsApp Business playbook, workflows, templates, checklists
* docs/PRODUCT.md: positioning, UX requirements, user journeys, success metrics
* docs/ROADMAP.md: phases, releases, sequencing, exit criteria

## Tech stack

* Next.js (App Router)
* Supabase

  * Postgres database + Row Level Security (RLS)
  * Auth (email/password with email verification + Google OAuth)
  * Storage (private bucket for payment proofs)
* Deployment

  * Vercel (Next.js)
  * Supabase hosted project (DB/Auth/Storage)

## Local development

### What you need to set up yourself

After merging this PR you need **one external account and three credential values** before the app can talk to a database. Everything else (Node, npm install, dev server) is automated.

#### Step 1 — Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (GitHub login works fine).
2. Click **New project**, give it a name (e.g. `corved-local`), choose a region close to you, and set a database password. Wait ~2 minutes for provisioning.
3. In your new project, open **Project Settings → API**.
4. Copy these three values — you'll need them in the next step:

   | Value | Where to find it |
   |---|---|
   | **Project URL** | "Project URL" field |
   | **Anon (public) key** | Under "Project API keys" → `anon public` |
   | **Service role key** | Under "Project API keys" → `service_role` (click "Reveal") |

> **Security:** Never commit real keys to the repo. The `service_role` key bypasses all Row Level Security — only use it server-side.

#### Step 2 — Create `.env.local`

In the project root, create a file called `.env.local` (it is gitignored — never committed):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
# Optional: WhatsApp Business number in international format without '+' (e.g. 923001234567)
NEXT_PUBLIC_WHATSAPP_NUMBER=923001234567
```

Paste the values you copied in Step 1. The file name and prefix matter:

* `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe to expose to the browser.
* `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never prefix it with `NEXT_PUBLIC_`.
* `NEXT_PUBLIC_WHATSAPP_NUMBER` — your WhatsApp Business number. If omitted, the WhatsApp CTA button is hidden.

#### Step 3 — Install dependencies

```bash
npm install
```

#### Step 4 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see the CorvEd landing page. All auth flows are live — sign up, verify email, set profile, and dashboard routing all work.

---

### What the app can do right now (after E5)

| Area | Status |
|---|---|
| Landing page at `/` | ✅ Full landing page with hero, how it works, subjects, packages, policies, intake form, FAQ, footer |
| Intake / lead capture form | ✅ React Hook Form + Zod — works without login; saves to Supabase `leads` table |
| WhatsApp CTA button | ✅ `wa.me` deep link with prefilled message (requires `NEXT_PUBLIC_WHATSAPP_NUMBER` env var) |
| `POST /api/leads` route | ✅ Server-side validation + Supabase insert via admin client |
| `leads` DB migration | ✅ `supabase/migrations/20260223000001_create_leads_table.sql` — RLS: anon insert allowed, auth read/update |
| Supabase clients wired up | ✅ `lib/supabase/client.ts`, `server.ts`, `admin.ts` |
| **Auth: sign up (email/password)** | ✅ `app/auth/sign-up/page.tsx` — display name, email, password, timezone; min 8-char password |
| **Auth: email verification** | ✅ `app/auth/verify/page.tsx` — instructions page; unverified users cannot reach dashboard |
| **Auth: sign in (email/password)** | ✅ `app/auth/sign-in/page.tsx` — generic error message (no email enumeration) |
| **Auth: Google OAuth** | ✅ Sign-in + sign-up pages both have "Sign in with Google" button |
| **Auth: callback handler** | ✅ `app/auth/callback/route.ts` — PKCE code exchange; redirects to profile-setup if profile incomplete |
| **Auth: profile setup** | ✅ `app/auth/profile-setup/page.tsx` — display name, WhatsApp number (auto-normalized), timezone (auto-detected) |
| **Auth: sign out** | ✅ `app/auth/sign-out/route.ts` — POST clears session, redirects to sign-in |
| **Route protection (middleware)** | ✅ `middleware.ts` — unauthenticated → sign-in for `/dashboard`, `/tutor`, `/admin`; authenticated → dashboard for auth pages |
| **Role-aware dashboard redirect** | ✅ `app/dashboard/page.tsx` — admin→`/admin`, tutor→`/tutor`, student/parent stays on dashboard |
| **Admin route protection** | ✅ `app/admin/layout.tsx` — verifies `admin` role server-side; non-admins → `/dashboard` |
| **Tutor route protection** | ✅ `app/tutor/layout.tsx` — verifies `tutor` or `admin` role; others → `/dashboard` |
| **Admin: user management screen** | ✅ `app/admin/users/page.tsx` — lists all users, shows roles, assign/remove roles, set primary role |
| **DB: enum types** | ✅ `supabase/migrations/20260223000002_create_enums.sql` — all 8 MVP enum types |
| **DB: subjects table** | ✅ `supabase/migrations/20260223000003_create_subjects.sql` — 9 MVP subjects seeded |
| **DB: user_profiles + user_roles** | ✅ `supabase/migrations/20260223000004_create_user_profiles.sql` — tables, helper functions, trigger, RLS |
| **DB: handle_new_user() trigger** | ✅ Auto-creates profile + `student` role on every signup |
| **DB: helper functions** | ✅ `has_role()`, `is_admin()`, `is_tutor()` — used in RLS policies |
| **DB: leads admin RLS** | ✅ `supabase/migrations/20260223000005_leads_admin_rls.sql` — admin-role users can read/update leads |
| **Student dashboard** | ✅ `app/dashboard/page.tsx` — lists all requests with status badges; "New Request" CTA; package summary cards per request |
| **Tutoring request form** | ✅ `app/dashboard/requests/new/page.tsx` — React Hook Form + Zod; level, subject (from DB), exam board, availability, timezone (pre-filled), goals, preferred start date; duplicate request warning |
| **Request confirmation page** | ✅ `app/dashboard/requests/[id]/page.tsx` — read-only summary, status badge, status-aware "what's next" banner, "Select Package" CTA (links with requestId) |
| **DB: requests table + RLS** | ✅ `supabase/migrations/20260223000007_create_requests_table.sql` — full schema, indexes, updated_at trigger, 4 RLS policies (insert self, select creator/admin, update creator limited, admin update) |
| **Request status utilities** | ✅ `lib/utils/request.ts` — `STATUS_LABELS` + `STATUS_COLOURS` for all 7 request statuses |
| **Request Zod schema** | ✅ `lib/validators/request.ts` — validates all request fields |
| **Package selection page** | ✅ `app/dashboard/packages/new/page.tsx` — 3 package tier cards (8/12/20 sessions), PKR pricing, policy notes, creates package + payment rows, advances request to `payment_pending` |
| **Package payment page** | ✅ `app/dashboard/packages/[id]/page.tsx` — bank transfer instructions with personalised reference, optional proof upload (Supabase Storage), optional transaction reference, payment status display |
| **Package summary card** | ✅ `components/dashboards/PackageSummary.tsx` — shows package tier, month window, sessions remaining, progress bar; handles pending/active/expired states |
| **Admin: payments list** | ✅ `app/admin/payments/page.tsx` — lists payments with filter (pending/paid/rejected/all), student name, subject, tier, amount, date, proof indicator |
| **Admin: mark payment paid** | ✅ Updates `payments.status → paid`, `packages.status → active`, `requests.status → ready_to_match`, writes audit log |
| **Admin: mark payment rejected** | ✅ Updates `payments.status → rejected` with optional rejection note, writes audit log |
| **DB: packages + payments tables** | ✅ `supabase/migrations/20260224000001_create_packages_payments.sql` — packages (tier_sessions 8/12/20, start/end date, sessions_total/used, status), payments (amount_pkr, method, reference, proof_path, rejection_note, verified_by/at), audit_logs; all with RLS |
| **Pricing config** | ✅ `lib/config/pricing.ts` — `PACKAGES` array (8/12/20 tiers, PKR prices, typicalFrequency) + `PAYMENT_INSTRUCTIONS` (bank details, reference format) |
| **Tutor application form** | ✅ `app/tutor/profile/page.tsx` — tutor can fill in bio, timezone, subjects × levels (O/A checkboxes), weekly availability grid; saves to `tutor_profiles`, `tutor_subjects`, `tutor_availability`; shows pending/approved status badge |
| **Admin: tutor directory** | ✅ `app/admin/tutors/page.tsx` — lists all tutors with status, subjects, levels, timezone; filter by status (pending/approved), subject, level; Approve and Revoke buttons |
| **Admin: tutor detail page** | ✅ `app/admin/tutors/[id]/page.tsx` — full tutor profile including bio, all subjects × levels, availability windows, WhatsApp number; approve/revoke controls |
| **Tutor approval workflow** | ✅ `app/admin/tutors/actions.ts` — `approveTutor` sets `approved = true`; `revokeTutorApproval` sets `approved = false`; both write audit log entries |
| **DB: tutor tables** | ✅ `supabase/migrations/20260224000002_create_tutor_tables.sql` — `tutor_profiles` (approved, bio, timezone), `tutor_subjects` (subject_id × level per tutor), `tutor_availability` (JSONB windows); RLS policies for all three tables |
| **Tutor Zod schema** | ✅ `lib/validators/tutor.ts` — validates bio (min 50 chars), timezone, subjects array, availability windows |
| **Matching query helper** | ✅ `lib/services/matching.ts` — `fetchApprovedTutors()` shared query filtered to `approved = true`; ready for E7 matching screen |
| Sessions | 🚧 Coming in E7–E10 |

---

### Prerequisites

* Node.js 20 LTS (or 18+)
* Git
* A [Supabase](https://supabase.com) account (free tier is sufficient)

### Optional: local Supabase via CLI

If you want a fully local database (no internet needed during development), install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run:

```bash
supabase start
```

The CLI reads `supabase/config.toml` (already in the repo) and starts a local Postgres + Auth + Studio on Docker. When it starts, it prints local values for all three env vars — paste those into `.env.local` instead of the hosted project values.

Apply migrations and seed data (once added):

```bash
supabase db reset
```

## Database, migrations, and seed data

All schema changes should be made via migrations.

Recommended workflow

* Add migrations under supabase/migrations
* Run locally: supabase db reset
* Deploy: supabase db push (or a CI workflow later)

### Current migrations

| File | Description |
|---|---|
| `20260223000001_create_leads_table.sql` | `leads` table for landing page intake form submissions. RLS: anon insert allowed; authenticated read/update for admin. |
| `20260223000002_create_enums.sql` | All 8 MVP enum types: `role_enum`, `level_enum`, `exam_board_enum`, `request_status_enum`, `package_status_enum`, `payment_status_enum`, `match_status_enum`, `session_status_enum`. |
| `20260223000003_create_subjects.sql` | `subjects` reference table seeded with 9 MVP subjects (Math, Physics, Chemistry, Biology, English, CS, Pakistan Studies, Islamiyat, Urdu). |
| `20260223000004_create_user_profiles.sql` | `user_profiles` + `user_roles` tables with RLS; `handle_new_user()` trigger that auto-creates profile and assigns `student` role on signup; `has_role()`, `is_admin()`, `is_tutor()` helper functions. |
| `20260223000005_leads_admin_rls.sql` | Adds admin-role RLS policies to `leads` table (now that `is_admin()` exists). |
| `20260223000006_user_profiles_insert_rls.sql` | Adds INSERT policy on `user_profiles` so authenticated users can upsert their own row during profile setup (safety net if trigger row is absent). |
| `20260223000007_create_requests_table.sql` | `requests` table with all fields from the data model; indexes on `(status, created_at desc)` and `created_by_user_id`; `updated_at` trigger; 4 RLS policies (creator insert, creator/admin select, creator update limited to `new`/`payment_pending`, admin update). |
| `20260224000001_create_packages_payments.sql` | `packages` table (tier_sessions 8/12/20, start/end date, sessions_total/used, status enum, updated_at trigger, 3 RLS policies); `payments` table (amount_pkr, method, reference, proof_path, rejection_note, status enum, verified_by/at, updated_at trigger, 4 RLS policies); `audit_logs` table for admin payment actions. |
| `20260224000002_create_tutor_tables.sql` | `tutor_profiles` (approved bool default false, bio, timezone, updated_at trigger); `tutor_subjects` (tutor × subject × level, composite PK); `tutor_availability` (JSONB windows array, updated_at trigger); RLS policies for all three tables — tutors manage own rows, admins read/update all. |

> **Supabase Dashboard settings required for auth** (after running migrations):
>
> - **Auth → Settings**: enable email confirmations; set Site URL to your domain; add `http://localhost:3000/auth/callback` to Redirect URLs.
> - **Auth → Providers → Google**: enable Google OAuth with credentials from [Google Cloud Console](https://console.cloud.google.com). Authorized redirect URI: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`.
> - **Storage → New Bucket**: create a bucket named `payment-proofs` with **Public: No** (private). This is required for payment proof uploads in E5.

## Operational model

CorvEd is designed to run operationally with:

* WhatsApp Business labels + quick replies
* templated messages for payment confirmation, matching, reminders, reschedules
* admin-mediated communication (student/parent ↔ admin and tutor ↔ admin)

See docs/OPS.md for the full playbook and copy-paste templates.

## Contributing workflow

* Track work in GitHub Projects
* One story per PR when possible
* Every PR should include:

  * linked issue(s)
  * acceptance criteria met
  * manual test steps in the PR description

Issue forms are in .github/ISSUE_TEMPLATE.

## License

TBD. Use MIT if you plan to open-source. Otherwise keep private until launch.
