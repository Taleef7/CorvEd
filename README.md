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

Open [http://localhost:3000](http://localhost:3000). You'll see the CorvEd placeholder landing page. All other routes (`/auth/sign-in`, `/dashboard`, etc.) exist as stubs — they return a "TODO" placeholder while features are built in E2–E12.

---

### What the app can do right now (after E2)

| Area | Status |
|---|---|
| Landing page at `/` | ✅ Full landing page with hero, how it works, subjects, packages, policies, intake form, FAQ, footer |
| Intake / lead capture form | ✅ React Hook Form + Zod — works without login; saves to Supabase `leads` table |
| WhatsApp CTA button | ✅ `wa.me` deep link with prefilled message (requires `NEXT_PUBLIC_WHATSAPP_NUMBER` env var) |
| `POST /api/leads` route | ✅ Server-side validation + Supabase insert via admin client |
| `leads` DB migration | ✅ `supabase/migrations/20260223000001_create_leads_table.sql` — RLS: anon insert allowed, auth read/update |
| All route stubs exist | ✅ No 404s — pages return "TODO" |
| Supabase clients wired up | ✅ `lib/supabase/client.ts`, `server.ts`, `admin.ts` |
| Auth flows | 🚧 Coming in E3 |
| Dashboards, requests, sessions | 🚧 Coming in E4–E10 |

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

Seed data should include the MVP subject list (see docs/ARCHITECTURE.md).

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
