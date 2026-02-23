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

### Prerequisites

* Node.js 18+ (recommended)
* Git
* Supabase CLI (recommended for local DB + migrations)

### 1) Clone and install

```bash
git clone <your-repo-url>
cd CorvEd
npm install
```

### 2) Set up Supabase

Option A (recommended): local Supabase via CLI

```bash
supabase init
supabase start
```

Apply migrations + seed data (once you add them):

```bash
supabase db reset
```

Option B: hosted Supabase project

* Create a Supabase project
* Copy Project URL and anon key

### 3) Configure environment variables

Create a .env.local file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# server-only (never expose to the browser)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes

* SUPABASE_SERVICE_ROLE_KEY must only be used server-side (Server Actions / Route Handlers).
* Email verification should be enforced in the app for email/password signups.

### 4) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database, migrations, and seed data

All schema changes should be made via migrations.

Recommended workflow

* Add migrations under supabase/migrations
* Run locally: supabase db reset
* Deploy: supabase db push (or a CI workflow later)

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
