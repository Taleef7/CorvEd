# CorvEd MVP — Advisor Update (as of 2026-02-28)

---

## 1. Executive summary

CorvEd is a managed, WhatsApp-first online tutoring platform for O Level and A Level students in Pakistan, with day-one support for overseas students in any timezone. It is **not** an open marketplace: an admin manually matches each student to a verified tutor, verifies bank-transfer payments, sets recurring schedules, and generates monthly sessions. The platform is the single source of truth for schedules, Meet links, packages, and attendance; WhatsApp is the communication layer.

The MVP (v0.1) is **feature-complete** as of today. All 12 planned implementation epics (E1–E12) have been built: landing page with lead capture, full auth (email/password + Google OAuth), student/parent request creation, package selection and payment proof upload, admin payment verification, tutor onboarding and approval, manual tutor matching, session generation from schedule patterns, student and tutor dashboards with timezone-aware display, tutor session completion (attendance + notes), reschedule workflow, WhatsApp template helpers with copy-to-clipboard and wa.me deep links, a public policies page, tutor code of conduct, admin audit log, and a basic analytics dashboard.

Intentionally out of scope for MVP: SAT/IELTS/TOEFL coaching, admissions counseling, group classes, automated payments, WhatsApp Business API automation, student–tutor direct chat, and advanced LMS features.

---

## 2. Current MVP capabilities

### Student / Parent

| Capability | Primary route(s) | Key files |
|---|---|---|
| Sign up (email/password or Google OAuth) | `/auth/sign-up` | `app/auth/sign-up/page.tsx` |
| Email verification gate | `/auth/verify` | `app/auth/verify/page.tsx` |
| Profile setup (name, WhatsApp, timezone) | `/auth/profile-setup` | `app/auth/profile-setup/page.tsx` |
| Password reset | `/auth/forgot-password`, `/auth/reset-password` | `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx` |
| Create tutoring request (level + subject + goals + availability) | `/dashboard/requests/new` | `app/dashboard/requests/new/page.tsx` |
| Request detail with lifecycle status banners | `/dashboard/requests/[id]` | `app/dashboard/requests/[id]/page.tsx` |
| Select package tier (8/12/20 sessions) | `/dashboard/packages/new` | `app/dashboard/packages/new/page.tsx` |
| Submit payment proof (upload image/PDF) | `/dashboard/packages/[id]` | `app/dashboard/packages/[id]/page.tsx` |
| View next session card with Meet link | `/dashboard` | `app/dashboard/page.tsx`, `components/dashboards/NextSessionCard.tsx` |
| View all sessions (upcoming + past, timezone-aware) | `/dashboard/sessions` | `app/dashboard/sessions/page.tsx` |
| View package summary with renewal alert | `/dashboard` | `components/dashboards/PackageSummary.tsx` |
| Reschedule via WhatsApp (prefilled message, 24h warning) | inline on session cards | `components/dashboards/RescheduleButton.tsx` |

### Tutor

| Capability | Primary route(s) | Key files |
|---|---|---|
| Tutor application sign-up | `/auth/sign-up/tutor` | `app/auth/sign-up/tutor/page.tsx` |
| Profile + subjects/levels + availability management | `/tutor/profile` | `app/tutor/profile/page.tsx` |
| View upcoming / past sessions | `/tutor/sessions` | `app/tutor/sessions/page.tsx` |
| Mark attendance + add notes (done / no_show_student / no_show_tutor) | inline on session cards | `components/dashboards/SessionCompleteForm.tsx`, `lib/services/sessions.ts` (`tutorUpdateSessionStatus`) |
| View next session card with Meet link | `/tutor` | `app/tutor/page.tsx`, `components/dashboards/NextSessionCard.tsx` |
| View code of conduct | `/tutor/conduct` | `app/tutor/conduct/page.tsx` |

### Admin

| Capability | Primary route(s) | Key files |
|---|---|---|
| Dashboard with live counts (users, requests, payments, sessions, etc.) | `/admin` | `app/admin/page.tsx` |
| User management (list, assign/remove roles, set primary role) | `/admin/users` | `app/admin/users/page.tsx`, `app/admin/actions.ts` |
| Requests inbox (filter by status/subject/level) | `/admin/requests` | `app/admin/requests/page.tsx` |
| Match request to tutor (eligible tutor filter, Meet link, schedule pattern) | `/admin/requests/[id]` | `app/admin/requests/[id]/page.tsx` |
| Tutor directory (approve/revoke, filter by status/subject/level) | `/admin/tutors`, `/admin/tutors/[id]` | `app/admin/tutors/page.tsx`, `app/admin/tutors/[id]/page.tsx` |
| Payment verification (mark paid/rejected, view proof via signed URL) | `/admin/payments` | `app/admin/payments/page.tsx` |
| Matches list + detail (edit Meet link, schedule, reassign tutor, admin notes) | `/admin/matches`, `/admin/matches/[id]` | `app/admin/matches/page.tsx`, `app/admin/matches/[id]/page.tsx` |
| Session generation from schedule pattern + package | `/admin/matches/[id]` (`GenerateSessionsForm`) | `lib/services/sessions.ts` (`generateSessionsForMatch`) |
| Session management (update status, reschedule with new datetime) | `/admin/sessions` | `app/admin/sessions/page.tsx` |
| Audit log viewer (last 200 events) | `/admin/audit` | `app/admin/audit/page.tsx` |
| Analytics dashboard (7 metric cards) | `/admin/analytics` | `app/admin/analytics/page.tsx` |
| WhatsApp copy-message buttons + wa.me links on every relevant admin page | throughout admin | `components/CopyMessageButton.tsx`, `lib/whatsapp/templates.ts`, `lib/whatsapp/buildLink.ts` |

---

## 3. User flows

### 3.1 Student / Parent flow

**Step 1 — Sign up**
- Route: `/auth/sign-up` (student/parent) or Google OAuth
- DB: `auth.users` row created → `handle_new_user()` trigger inserts `user_profiles` (default `student` role) + `user_roles`
- If Google OAuth: redirected through `/auth/callback/route.ts` → checks if profile has `whatsapp_number` → redirects to `/auth/profile-setup` if missing

**Step 2 — Email verification** (email/password only)
- Route: `/auth/verify` shows instructions
- Supabase sends confirmation email; user clicks link → `/auth/callback` exchanges code for session
- Enforced: middleware redirects unverified users away from protected routes

**Step 3 — Profile setup**
- Route: `/auth/profile-setup`
- Collects: display name, WhatsApp number (auto-normalizes `03xx` → `+923xx`), timezone (auto-detected from browser)
- DB: upserts `user_profiles`

**Step 4 — Create request (single subject)**
- Route: `/dashboard/requests/new` — 5-step form
- Collects: requester role (student/parent + child name), subject + level (from `subjects` DB table), package tier preference (8/12/20), availability via `WeeklyAvailabilityPicker`, timezone, goals, preferred start date
- DB: inserts row into `requests` (status = `new`), includes duplicate-request detection
- Server action: direct Supabase insert with user's session (RLS: `requests_insert_self` policy)

**Step 5 — Select package + pay**
- Route: `/dashboard/packages/new?requestId=...` → select tier → `/dashboard/packages/[id]`
- DB: creates `packages` row (status = `pending`) + `payments` row (status = `pending`); advances `requests.status → payment_pending`
- Payment page shows bank transfer instructions from `lib/config/pricing.ts` (`PAYMENT_INSTRUCTIONS`), optional proof upload to `payment-proofs` Supabase Storage bucket, optional transaction reference
- Server action: direct Supabase insert/update with user's session

**Step 6 — Matched + sessions generated** (admin-driven, see 3.3)
- Student sees status banners on `/dashboard/requests/[id]` reflecting lifecycle: `new → payment_pending → ready_to_match → matched → active`
- Once active: `/dashboard` shows `NextSessionCard` with Meet link, timezone-aware time, tutor name

**Step 7 — Attend sessions + view remaining**
- Route: `/dashboard/sessions` — upcoming/past tabs, timezone-aware times
- `PackageSummary` card shows sessions remaining, progress bar, renewal alert (≤3 sessions or ≤5 days to `end_date`)

**Step 8 — Reschedule**
- `RescheduleButton` component (on every upcoming session) opens WhatsApp with prefilled message containing subject, level, session time in student's TZ
- Shows warning if < 24 hours before session start
- Admin processes reschedule (see 3.3)

### 3.2 Tutor flow

**Step 1 — Apply**
- Route: `/auth/sign-up/tutor` — multi-section form: email, password, display name, WhatsApp, timezone, bio (30–600 chars), teaching approach
- DB: `auth.users` → trigger creates `user_profiles` (role=`tutor`) + `user_roles` (tutor) + `tutor_profiles` (approved=false) + `tutor_availability`
- Metadata fields (`experience_years`, `education`, `teaching_approach`) stored in `tutor_profiles` via updated `handle_new_user()` trigger (migration `20260226000001`)

**Step 2 — Complete profile**
- Route: `/tutor/profile` — editable form for bio, subjects × levels (checkboxes), availability windows, conduct acknowledgement
- DB: upserts `tutor_profiles`, replaces `tutor_subjects`, updates `tutor_availability`
- Status: shows "Pending Approval" badge until admin approves

**Step 3 — Assigned sessions** (after admin matches)
- Route: `/tutor` — dashboard with next session card (student name, subject, level, Meet link, time in tutor's TZ), upcoming/completed counts
- Route: `/tutor/sessions` — full session list with `SessionCompleteForm` inline

**Step 4 — Mark attendance + notes**
- Component: `SessionCompleteForm` — radio (Done / Student No-show / My No-show), optional notes textarea
- Server action: `tutorUpdateSessionStatus()` in `lib/services/sessions.ts` → calls `tutor_update_session` RPC (security definer)
- RPC logic: verifies caller is assigned tutor, restricts to valid statuses, updates session, increments `packages.sessions_used` atomically for `done`/`no_show_student`, writes `audit_logs`

### 3.3 Admin flow

**Step 1 — Verify payment**
- Route: `/admin/payments` — filter tabs (pending/paid/rejected/all)
- Admin views proof via Supabase Storage signed URL, checks bank transfer externally
- Action: "Mark Paid" button → server action updates `payments.status → paid`, `packages.status → active`, `requests.status → ready_to_match`, writes audit log
- Action: "Reject" button → updates `payments.status → rejected` with rejection note, writes audit log
- WhatsApp: `CopyMessageButton` with `templates.paid()` or `templates.paybank()` prefilled

**Step 2 — Match tutor**
- Route: `/admin/requests/[id]` — shows request details + eligible tutors (filtered by subject × level, approved only, via `lib/services/matching.ts` → `fetchApprovedTutors()`)
- Admin fills: Meet link (validated: must start with `https://meet.google.com/`) + schedule pattern (days of week + time in student's timezone)
- Action: "Create Match" → server action creates `matches` row, advances `requests.status → matched`, writes audit log
- DB tables written: `matches` (with `meet_link`, `schedule_pattern` JSONB, `assigned_by_user_id`)

**Step 3 — Generate sessions**
- Route: `/admin/matches/[id]` — `GenerateSessionsForm`
- Admin sets start/end date range (matching active package window)
- Action: server action `generateSessionsForMatch()` in `lib/services/sessions.ts`:
  1. Fetches match + active package
  2. Calls `generateSessionSlots()` from `lib/services/scheduling.ts` (luxon-based algorithm)
  3. Iterates dates in `schedule_pattern.timezone`, matches day-of-week to `pattern.days`, converts local time → UTC
  4. Inserts N session rows (N = `tier_sessions`)
  5. Advances `matches.status → active`, `requests.status → active`
  6. Writes audit log
- WhatsApp: `CopyMessageButton` with `templates.matched()` for student, `templates.tutorAvailCheck()` for tutor

**Step 4 — Day-to-day operations**
- Sessions: `/admin/sessions` — filter by status, update status (done/no-show/rescheduled), reschedule with new datetime (UTC conversion)
- Reschedule: `rescheduleSession()` server action updates `scheduled_start_utc`/`scheduled_end_utc`, resets status to `scheduled`, prevents past-date rescheduling, writes audit log
- Session status: `updateSessionStatus()` server action with atomic `increment_sessions_used` RPC (only for `done`/`no_show_student`, guarded by `sessions_used < sessions_total`)
- WhatsApp templates available per session: 1h reminder, late join, student no-show, tutor no-show, reschedule confirmed
- Match detail: edit Meet link, schedule pattern, reassign tutor with reason, admin notes

**Step 5 — Monitoring**
- Audit log: `/admin/audit` — 200 most recent events, human-readable action labels, actor name, entity details
- Analytics: `/admin/analytics` — 7 metric cards (active students, active tutors, upcoming sessions 7d, missed sessions, unmarked sessions, pending payments, pending tutors)

---

## 4. Architecture overview

### Tech stack (as implemented)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5.9.3 |
| Database / Auth / Storage | Supabase (hosted Postgres + Auth + Storage) | `@supabase/supabase-js` ^2.97.0, `@supabase/ssr` ^0.8.0 |
| CSS | Tailwind CSS v4 (via PostCSS) | ^4 |
| Component library | shadcn/ui (New York style) + custom Bauhaus design system | — |
| Form validation | Zod ^4.3.6 + React Hook Form ^7.71.2 | — |
| Timezone handling | luxon ^3.7.2 (server-side generation) + `Intl.DateTimeFormat` (client display) | — |
| Icons | Lucide React ^0.575.0 | — |
| Toasts | Sonner ^2.0.7 | — |
| Font | Outfit (Google Fonts, loaded via `next/font`) | — |
| E2E tests | Playwright | — |

### Hosting / deployment status

- **Deployed URL**: Not found in repo. The README states deployment target is Vercel (Next.js) + Supabase hosted project, but no Vercel configuration, deployment URL, or production environment file was found.
- **CI pipeline**: `.github/workflows/ci.yml` — runs `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` on every PR to `main` and push to `main` (GitHub Actions, `ubuntu-latest`, Node 20).

### Auth

- **Email/password**: Full signup with email verification enforced. Supabase Auth handles verification emails. Unverified users are redirected to `/auth/verify`.
- **Google OAuth**: Enabled on both sign-in and sign-up pages. Uses PKCE code exchange via `/auth/callback/route.ts`.
- **Profile setup gate**: After OAuth or email verification, callback checks if `whatsapp_number` is null in `user_profiles` and redirects to `/auth/profile-setup` if so.
- **Password reset**: `/auth/forgot-password` → Supabase `resetPasswordForEmail()` → `/auth/reset-password` listens for `PASSWORD_RECOVERY` event.
- **Sign out**: `/auth/sign-out/route.ts` (POST + GET), clears session, redirects to sign-in.
- **Auto profile creation**: `handle_new_user()` Postgres trigger on `auth.users` INSERT creates `user_profiles` + `user_roles` (default `student`). Updated trigger (migration `20260226000001`) also handles `parent` and `tutor` roles from signup metadata.

### State management

- **No client-side state library** — all data flows through Server Components reading from Supabase, with Server Actions for mutations.
- **Server Actions** are the primary mutation pattern. Admin actions use `createAdminClient()` (service role, bypasses RLS). Tutor session updates use `tutor_update_session` RPC (security definer).
- **`revalidatePath()`** is called after every mutation for cache invalidation.
- **React Hook Form + Zod** for client-side form state and validation (request form, lead form, tutor profile form, auth forms).

### Key integrations

**Google Meet links**
- One recurring Meet link per `match`, stored in `matches.meet_link`
- Manually created and pasted by admin during matching (no Google Calendar API integration)
- Displayed to students on dashboard, session cards, and to tutors on their session cards
- Validation: must start with `https://meet.google.com/`

**WhatsApp operations**
- All 14 OPS.md templates implemented as typed functions in `lib/whatsapp/templates.ts`
- `lib/whatsapp/buildLink.ts` → `buildWaLink(number, message?)` generates `https://wa.me/{digits}?text={encoded}` links
- `components/CopyMessageButton.tsx` — "Copy message" (clipboard API) + optional "Open WhatsApp" (wa.me link) buttons, used throughout admin pages
- `components/WhatsAppLink.tsx` — standalone "Open WhatsApp" link
- `components/WhatsAppCTA.tsx` — landing page CTA with prefilled intake message
- Env var: `NEXT_PUBLIC_WHATSAPP_NUMBER` — admin's WhatsApp number (international format, no `+`)
- Phone normalization: `normalizePkPhone()` in `lib/services/whatsapp.ts` converts local `03xx` → `+923xx`

---

## 5. Codebase map

```
.
├── app/                              # Next.js App Router — all UI routes
│   ├── page.tsx                      # Landing page (607 lines): hero, how-it-works, subjects, pricing, FAQ, LeadForm
│   ├── layout.tsx                    # Root layout: Outfit font, metadata, TooltipProvider, Sonner
│   ├── error.tsx                     # Root error boundary
│   ├── not-found.tsx                 # Custom 404 with Bauhaus shapes
│   ├── globals.css                   # Bauhaus design tokens (CSS variables), utility classes
│   │
│   ├── auth/                         # Authentication (8 files)
│   │   ├── sign-in/page.tsx          # Email/password + Google sign-in
│   │   ├── sign-up/page.tsx          # Student/parent sign-up form
│   │   ├── sign-up/tutor/page.tsx    # Tutor application sign-up
│   │   ├── verify/page.tsx           # Email verification instructions + resend
│   │   ├── forgot-password/page.tsx  # Password reset request
│   │   ├── reset-password/page.tsx   # Set new password
│   │   ├── profile-setup/page.tsx    # Post-signup profile completion
│   │   ├── callback/route.ts         # OAuth/email-confirm callback (PKCE)
│   │   └── sign-out/route.ts         # Sign-out handler (POST + GET)
│   │
│   ├── dashboard/                    # Student/Parent routes (6 pages + layout/loading/error)
│   │   ├── page.tsx                  # Student home: next session, requests list, package summaries
│   │   ├── sessions/page.tsx         # Session list (upcoming/past tabs, timezone-aware)
│   │   ├── requests/new/page.tsx     # 5-step tutoring request form
│   │   ├── requests/[id]/page.tsx    # Request detail with lifecycle banners
│   │   ├── packages/new/page.tsx     # Package tier selection (8/12/20)
│   │   └── packages/[id]/page.tsx    # Payment submission + proof upload
│   │
│   ├── tutor/                        # Tutor routes (5 pages + layout/loading/error)
│   │   ├── page.tsx                  # Tutor home: next session, stats, quick links
│   │   ├── sessions/page.tsx         # Session list with inline SessionCompleteForm
│   │   ├── profile/page.tsx          # Profile/application form (bio, subjects, availability)
│   │   └── conduct/page.tsx          # Code of conduct (static)
│   │
│   ├── admin/                        # Admin routes (11 pages + layout/loading/error + actions.ts)
│   │   ├── actions.ts                # Server actions: assignRole, removeRole, setPrimaryRole, signOut
│   │   ├── page.tsx                  # Dashboard overview: 8 summary cards
│   │   ├── users/page.tsx            # User management (search, roles, paginated)
│   │   ├── requests/page.tsx         # Requests inbox (filter by status/subject/level)
│   │   ├── requests/[id]/page.tsx    # Request detail + matching screen
│   │   ├── payments/page.tsx         # Payments list (mark paid/rejected, view proof)
│   │   ├── tutors/page.tsx           # Tutor directory (approve/revoke)
│   │   ├── tutors/[id]/page.tsx      # Tutor detail profile
│   │   ├── matches/page.tsx          # Matches list
│   │   ├── matches/[id]/page.tsx     # Match detail (edit, generate sessions, reassign, WhatsApp)
│   │   ├── sessions/page.tsx         # Sessions overview (status update, reschedule)
│   │   ├── audit/page.tsx            # Audit log viewer
│   │   └── analytics/page.tsx        # Analytics dashboard (7 metric cards)
│   │
│   ├── api/leads/route.ts            # POST: lead capture (Zod + honeypot + admin client insert)
│   └── policies/page.tsx             # Public policies page (reschedule, no-show, refund, privacy)
│
├── components/                       # Shared UI components
│   ├── AdminPagination.tsx           # Server component: prev/next pagination (PAGE_SIZE=25)
│   ├── CopyMessageButton.tsx         # Client: copy to clipboard + open WhatsApp
│   ├── LeadForm.tsx                  # Client: landing page intake form (401 lines)
│   ├── WeeklyAvailabilityPicker.tsx  # Client: 7×4 toggle grid for availability windows
│   ├── WhatsAppCTA.tsx               # Server: green WhatsApp CTA button
│   ├── WhatsAppLink.tsx              # Server: simple WhatsApp link
│   ├── dashboards/
│   │   ├── NextSessionCard.tsx       # Server: next upcoming session with Meet link
│   │   ├── PackageSummary.tsx        # Server: package status, remaining sessions, renewal alert
│   │   ├── RescheduleButton.tsx      # Client: prefilled WhatsApp reschedule with 24h warning
│   │   └── SessionCompleteForm.tsx   # Client: tutor marks done/no-show + notes (RPC)
│   └── ui/                           # shadcn/ui primitives (button, card, dialog, table, etc.)
│
├── lib/                              # Business logic, config, validation
│   ├── config.ts                     # Exports WHATSAPP_NUMBER from env
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   ├── auth/
│   │   ├── requireAdmin.ts           # Server guard: verifies admin role, returns userId
│   │   └── utils.ts                  # safeNext() — open redirect protection
│   ├── config/
│   │   ├── pricing.ts                # PACKAGES (8/12/20 tiers, PKR prices), PAYMENT_INSTRUCTIONS
│   │   └── timezones.ts              # TIMEZONE_OPTIONS (17 entries)
│   ├── services/
│   │   ├── matching.ts               # fetchApprovedTutors(subjectId?, level?) with deep joins
│   │   ├── payments.ts               # expirePackages(), getExpiringPackages()
│   │   ├── requests.ts               # VALID_TRANSITIONS state machine, getRequestById()
│   │   ├── scheduling.ts             # generateSessions() — luxon-based algorithm
│   │   ├── sessions.ts               # generateSessionsForMatch, updateSessionStatus, tutorUpdateSessionStatus, rescheduleSession
│   │   └── whatsapp.ts               # Re-exports templates + buildWaLink + normalizePkPhone
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (anon key, RLS-scoped)
│   │   ├── server.ts                 # Server client (cookies, try/catch on setAll)
│   │   └── admin.ts                  # Service role client (server-only, bypasses RLS)
│   ├── utils/
│   │   ├── request.ts                # LEVEL_LABELS, STATUS_LABELS, STATUS_COLOURS
│   │   └── session.ts                # SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS, formatSessionTime()
│   ├── validators/
│   │   ├── lead.ts                   # Zod: landing page lead form
│   │   ├── payment.ts                # Zod: paymentSubmit, markPaid, rejectPayment
│   │   ├── request.ts                # Zod: tutoring request form
│   │   └── tutor.ts                  # Zod: tutor profile (bio ≥50 chars, subjects array)
│   └── whatsapp/
│       ├── buildLink.ts              # buildWaLink(number, message?) → wa.me URL
│       └── templates.ts              # 14 typed template functions matching OPS.md section 6
│
├── middleware.ts                     # Auth middleware: session refresh, route protection, role redirects
│
├── supabase/                         # Database schema (source of truth)
│   ├── config.toml                   # Local Supabase project config (ports, auth settings)
│   ├── seed.sql                      # Seeds 9 MVP subjects
│   └── migrations/                   # 18 ordered migration files (see section 6)
│
├── docs/                             # Product & ops documentation
│   ├── MVP.md                        # Scope lock, policies, user flows, definition of done
│   ├── PRODUCT.md                    # Positioning, UX requirements, user journeys, KPIs
│   ├── OPS.md                        # WhatsApp playbook, workflows, 14 templates, checklists
│   ├── ARCHITECTURE.md               # DB schema, RLS, RPC, scheduling algorithm, timezone model
│   ├── ROADMAP.md                    # Phases, releases, sprint plan, risk register
│   └── frontend_design.md           # Bauhaus design system spec (tokens, components)
│
├── e2e/                              # Playwright E2E test specs
│   ├── accessibility.spec.ts
│   ├── auth.spec.ts
│   ├── landing.spec.ts
│   ├── not-found.spec.ts
│   ├── policies.spec.ts
│   ├── protected-routes.spec.ts
│   └── responsive.spec.ts
│
├── .github/
│   ├── copilot-instructions.md       # Copilot context for this repo
│   ├── pull_request_template.md      # PR template
│   ├── workflows/ci.yml             # CI: lint + type-check + build
│   └── ISSUE_TEMPLATE/              # Bug, story, task forms + config
│
├── scripts/                          # Utility scripts
│   ├── bauhaus-replace.ps1           # PowerShell: batch replace for Bauhaus styling
│   └── fix3.ps1                      # PowerShell: misc fixes
│
└── public/                           # Static assets
```

---

## 6. Database schema and data model

### Tables (18 migrations, ordered)

| Table | Purpose | Key columns | Migration file |
|---|---|---|---|
| `leads` | Landing page intake form submissions (pre-auth) | `full_name`, `whatsapp_number`, `role`, `level`, `subject`, `availability`, `status` (new/contacted/qualified/disqualified) | `20260223000001` |
| `subjects` | Reference table: 9 MVP subjects | `id`, `code`, `name`, `active`, `sort_order` | `20260223000003` |
| `user_profiles` | User business fields (mirrors `auth.users`) | `user_id` (PK → `auth.users`), `display_name`, `whatsapp_number`, `timezone`, `primary_role` | `20260223000004` |
| `user_roles` | Multi-role support | `(user_id, role)` composite PK | `20260223000004` |
| `tutor_profiles` | Tutor-specific data | `tutor_user_id` (PK → `user_profiles`), `approved`, `bio`, `timezone`, `experience_years`, `education`, `teaching_approach` | `20260224000002`, `20260226000004` |
| `tutor_subjects` | What each tutor teaches (subject × level) | `(tutor_user_id, subject_id, level)` composite PK | `20260224000002` |
| `tutor_availability` | Availability windows (JSONB) | `tutor_user_id` PK, `windows` JSONB (`[{day, start, end}]`) | `20260224000002` |
| `requests` | Tutoring requests (one per subject) | `id`, `created_by_user_id`, `requester_role`, `level`, `subject_id`, `exam_board`, `goals`, `availability_windows`, `timezone`, `status`, `preferred_package_tier` | `20260223000007`, `20260226000003` |
| `packages` | Monthly session packages | `id`, `request_id`, `tier_sessions` (8/12/20), `start_date`, `end_date`, `sessions_total`, `sessions_used`, `status` | `20260224000001` |
| `payments` | Payment records | `id`, `package_id`, `payer_user_id`, `amount_pkr`, `method`, `reference`, `proof_path`, `status`, `rejection_note`, `verified_by_user_id`, `verified_at` | `20260224000001` |
| `matches` | Tutor-student assignment per request | `id`, `request_id` (UNIQUE), `tutor_user_id`, `status`, `meet_link`, `schedule_pattern` JSONB, `admin_notes`, `assigned_by_user_id`, `assigned_at` | `20260225000001`, `20260225000005` |
| `sessions` | Individual tutoring sessions | `id`, `match_id`, `scheduled_start_utc`, `scheduled_end_utc`, `status`, `tutor_notes`, `updated_by_user_id` | `20260225000002` |
| `audit_logs` | Admin action audit trail | `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `details` JSONB | `20260224000001` |

### Enums (8 types, migration `20260223000002`)

| Enum | Values |
|---|---|
| `role_enum` | `student`, `parent`, `tutor`, `admin` |
| `level_enum` | `o_levels`, `a_levels` |
| `exam_board_enum` | `cambridge`, `edexcel`, `other`, `unspecified` |
| `request_status_enum` | `new`, `payment_pending`, `ready_to_match`, `matched`, `active`, `paused`, `ended` |
| `package_status_enum` | `pending`, `active`, `expired` |
| `payment_status_enum` | `pending`, `paid`, `rejected`, `refunded` |
| `match_status_enum` | `matched`, `active`, `paused`, `ended` |
| `session_status_enum` | `scheduled`, `done`, `rescheduled`, `no_show_student`, `no_show_tutor` |

### Relationships

```
request ──→ package ──→ payment
   │
   └──→ match ──→ sessions (N per month)
           │
           └──→ tutor_profiles (via tutor_user_id)

user_profiles ←──→ user_roles (one-to-many)
user_profiles ←──→ tutor_profiles (one-to-one, if tutor)
tutor_profiles ←──→ tutor_subjects (one-to-many, subject × level)
tutor_profiles ←──→ tutor_availability (one-to-one, JSONB windows)
```

- Each `request` is for **one subject** (locked policy)
- Each `request` has at most **one active `package`** at a time
- Each `request` has at most **one `match`** (`request_id` is UNIQUE on `matches`)
- Each `match` has **N sessions** (N = `tier_sessions`: 8, 12, or 20)
- Each `match` has **one recurring Meet link** (`meet_link` on `matches`)

### Sessions remaining computation

- `packages.sessions_used` is incremented atomically via the `increment_sessions_used(p_request_id)` RPC (security definer, restricted to `service_role`)
- Guard: `sessions_used < sessions_total` prevents over-incrementing (migration `20260225000003`)
- Increment triggers: session status transitions to `done` or `no_show_student` (NOT for `no_show_tutor` or `rescheduled`)
- Sessions remaining = `sessions_total - sessions_used` (computed in application code, displayed in `PackageSummary`)
- Double-increment protection in `lib/services/sessions.ts` (`updateSessionStatus`): only increments when transitioning FROM a non-consuming status INTO a consuming one

### Postgres helper functions

| Function | Purpose | Defined in |
|---|---|---|
| `has_role(p_uid, p_role)` | Check if user has a specific role | `20260223000004` |
| `is_admin(p_uid)` | Shortcut for `has_role(uid, 'admin')` | `20260223000004` |
| `is_tutor(p_uid)` | Shortcut for `has_role(uid, 'tutor')` | `20260223000004` |
| `handle_new_user()` | Trigger: auto-create profile + roles on signup | `20260223000004`, `20260226000001` |
| `increment_sessions_used(p_request_id)` | Atomic sessions_used++ with guard | `20260225000002`, `20260225000003` |
| `tutor_update_session(p_session_id, p_status, p_notes)` | Security definer: tutor marks attendance + notes | `20260225000002` |

### Storage bucket

| Bucket | Visibility | Purpose | RLS |
|---|---|---|---|
| `payment-proofs` | Private | Payment proof uploads (image/PDF, max 5MB) | Students upload into `{auth.uid()}/` folder; students read own; admins read all | 

Migration: `20260225000004_create_payment_proofs_bucket.sql`

---

## 7. Security and permissions

### RLS policies

**RLS is enabled on all 13 business tables.** Every table has explicit policies defined in the migration files. Summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `leads` | Anon (restricted), admin | Anon (status=new only) | Admin, service_role | — |
| `user_profiles` | Own or admin | Own (auth'd) | Own or admin | — |
| `user_roles` | Own or admin | Admin only | Admin only | Admin only |
| `tutor_profiles` | Own tutor or admin | Own tutor | Own tutor (cannot self-approve) or admin | — |
| `tutor_subjects` | Own tutor or admin | Own tutor | Own tutor | Own tutor |
| `tutor_availability` | Own tutor or admin | Own tutor | Own tutor | — |
| `requests` | Creator or admin | Self (auth'd) | Creator (only in `new`/`payment_pending`) or admin | — |
| `packages` | Creator (via request) or admin | Creator (via request) | Admin | — |
| `payments` | Payer or admin | Payer (auth'd) | Payer (only when pending) or admin | — |
| `matches` | Admin, assigned tutor, request creator | Admin only | Admin only | — |
| `sessions` | Admin, assigned tutor, request creator | Admin only | Tutor (own, via RPC), admin | — |
| `audit_logs` | Admin only | Admin or security definer | — | — |
| `subjects` | `anon` + `authenticated` (SELECT granted) | — | — | — |

### Service role vs user session

| Context | Client used | Why |
|---|---|---|
| Admin server actions (payments, matching, sessions, roles) | `createAdminClient()` (`lib/supabase/admin.ts`) — service role | Bypasses RLS for multi-table transactions, cross-user operations |
| Student/parent reads and writes (requests, packages) | `createClient()` (`lib/supabase/server.ts`) — user session | RLS-scoped to their own data |
| Tutor session updates | `tutor_update_session` RPC (security definer) | Enforces column restrictions server-side; tutor cannot change scheduled times |
| Lead capture (landing page) | `createAdminClient()` via API route | Anon users have no session; admin client inserts with RLS allowing anon insert |
| Browser-side interactions | `createBrowserClient()` (`lib/supabase/client.ts`) — anon key | RLS-scoped |

### Role enforcement in code

| Mechanism | Where | How |
|---|---|---|
| Middleware route protection | `middleware.ts` | Unauthenticated users redirected from `/dashboard`, `/tutor`, `/admin` to `/auth/sign-in` |
| Admin layout guard | `app/admin/layout.tsx` | Calls `requireAdmin()` from `lib/auth/requireAdmin.ts`; redirects non-admins to `/dashboard` |
| Tutor layout guard | `app/tutor/layout.tsx` | Checks `primary_role` is `tutor` or `admin`; redirects others to `/dashboard` |
| Student layout guard | `app/dashboard/layout.tsx` | Checks `primary_role`; redirects admins to `/admin`, tutors to `/tutor` |
| Server action guard | `requireAdmin()` | Used at the top of every admin server action; authenticates + checks `user_roles` for `admin` role |
| Last-admin protection | `app/admin/actions.ts` (`removeRole`) | Prevents removal of the last admin role in the system |

---

## 8. Operational playbook

### Payment verification (bank transfer)

1. Student selects package on `/dashboard/packages/new`, gets bank transfer instructions from `lib/config/pricing.ts` (`PAYMENT_INSTRUCTIONS` — currently contains placeholder bank details: `CONFIGURE_BEFORE_LAUNCH`)
2. Student optionally uploads proof and/or enters transaction reference on `/dashboard/packages/[id]`
3. Admin checks `/admin/payments`, filters for "pending"
4. Admin verifies transfer externally (bank app/statement)
5. Admin clicks "Mark Paid" → `payments.status → paid`, `packages.status → active`, `requests.status → ready_to_match`
6. Admin uses `CopyMessageButton` with `templates.paid()` to confirm via WhatsApp

**Implementation matches OPS.md Workflow B.** Bank details in `PAYMENT_INSTRUCTIONS` are placeholder — must be configured before launch.

### Matching procedure (manual)

1. Admin opens `/admin/requests`, filters for `ready_to_match`
2. Opens request detail → sees eligible tutors (filtered by subject × level, approved only)
3. Admin fills Meet link + schedule pattern (days of week, time in student's TZ)
4. Clicks "Create Match" → creates `matches` row, advances request to `matched`
5. Admin messages tutor for availability confirmation via WhatsApp (`templates.tutorAvailCheck()`)
6. Admin messages student with match confirmation via WhatsApp (`templates.matched()`)

**Implementation matches OPS.md Workflow C.** No automated matching — admin selects tutor manually.

### Scheduling procedure

1. On `/admin/matches/[id]`, admin clicks "Generate Sessions"
2. Selects start/end date range (should match active package window)
3. System generates N sessions using luxon algorithm in `lib/services/scheduling.ts`
4. Sessions inserted into DB, match/request advanced to `active`
5. Admin sends schedule confirmation via WhatsApp with Meet link

**Implementation matches OPS.md Workflow D.** The session generation algorithm correctly handles timezone conversion and day-of-week matching.

### Reschedule / no-show enforcement

- **Reschedule**: Student messages admin via WhatsApp (prefilled by `RescheduleButton`). Admin reschedules on `/admin/sessions` using `RescheduleForm`. Warning shown if < 24 hours (but not enforced in code — policy enforcement is manual per OPS.md).
- **Student no-show**: Session marked `no_show_student` → `sessions_used` incremented (session consumed). WhatsApp template `templates.studentNoShow()` available.
- **Tutor no-show**: Session marked `no_show_tutor` → `sessions_used` NOT incremented (session not consumed). WhatsApp template `templates.tutorNoShow()` available.
- **Implementation**: Matches OPS.md Workflows F and G. The 24-hour cutoff is communicated via UI warning but not programmatically enforced (admin discretion).

### WhatsApp workflow

- **Not automated** — admin manually copies messages and sends via WhatsApp Business app
- **Templates**: All 14 typed functions in `lib/whatsapp/templates.ts` with variable substitution
- **Copy buttons**: `CopyMessageButton` component used throughout admin pages (payments, matches, sessions, users, tutors)
- **wa.me links**: `buildWaLink()` generates deep links that open WhatsApp with prefilled text
- **Labels**: OPS.md defines 12 WhatsApp Business labels (lead_new, lead_qualified, payment_pending_verification, etc.) — these are manual setup in WhatsApp Business app, not in-platform

**Implementation matches OPS.md sections 6-7.** WhatsApp Business API is explicitly out of scope for MVP.

### Package expiry

- `lib/services/payments.ts` exports `expirePackages()` server action that finds active packages past `end_date` and marks them expired, ending associated requests/matches
- `getExpiringPackages(withinDays=5)` returns packages approaching expiry for renewal reminders
- **Note**: These functions exist but are not automatically triggered (no cron job or edge function). They must be called manually or integrated into a scheduled task post-MVP.

---

## 9. Local setup and runbook

### Prerequisites

- **Node.js**: 20 LTS (or 18+)
- **npm**: comes with Node
- **Git**
- **Supabase account**: Free tier at [supabase.com](https://supabase.com)
- **Optional (local DB)**: [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker

### Setup commands

```bash
# 1. Clone the repo
git clone https://github.com/Taleef7/CorvEd.git
cd CorvEd

# 2. Install dependencies
npm install

# 3. Create .env.local in project root (see required vars below)

# 4. Run dev server
npm run dev
# → opens at http://localhost:3000
```

### Required environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_WHATSAPP_NUMBER=923001234567  # optional; admin WhatsApp, international format, no +
```

Get these from: Supabase dashboard → Project Settings → API.

### Apply DB schema (hosted Supabase)

You have two options:

**Option A — Hosted project (recommended for quick start)**

1. Create a Supabase project at supabase.com
2. Copy API keys into `.env.local`
3. Run migrations against hosted project:
   ```bash
   npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ```
   Or apply each migration manually via the Supabase SQL Editor.

**Option B — Local Supabase (Docker)**

```bash
# Start local Supabase (Docker must be running)
npx supabase start
# Prints local URL, anon key, service role key → paste into .env.local

# Apply all migrations + seed data
npx supabase db reset

# When done
npx supabase stop
```

Config: `supabase/config.toml` (ports: API 54321, DB 54322, Studio 54323, Inbucket 54324).

### Supabase Dashboard setup (required after migrations)

1. **Auth → Settings**: Enable email confirmations; set Site URL to `http://localhost:3000`; add `http://localhost:3000/auth/callback` to Redirect URLs
2. **Auth → Providers → Google**: Enable Google OAuth with credentials from Google Cloud Console; set redirect URI to `https://<ref>.supabase.co/auth/v1/callback`
3. **Storage**: The `payment-proofs` bucket is created by migration `20260225000004` — verify it exists

### Create an admin user

1. Sign up normally (email/password or Google) at `/auth/sign-up`
2. Complete email verification and profile setup
3. In Supabase SQL Editor or via CLI:
   ```sql
   -- Find your user_id
   SELECT user_id, display_name FROM user_profiles;

   -- Grant admin role
   INSERT INTO user_roles (user_id, role) VALUES ('<your-user-id>', 'admin');

   -- Set primary_role to admin
   UPDATE user_profiles SET primary_role = 'admin' WHERE user_id = '<your-user-id>';
   ```
4. Refresh the app — you'll be redirected to `/admin`

### Seed subjects

Subjects are seeded by migration `20260223000003` and also by `supabase/seed.sql`. If using hosted Supabase with manual migration application, run:

```sql
INSERT INTO subjects (code, name, sort_order) VALUES
  ('math', 'Mathematics', 1),
  ('physics', 'Physics', 2),
  ('chemistry', 'Chemistry', 3),
  ('biology', 'Biology', 4),
  ('english', 'English', 5),
  ('cs', 'Computer Science', 6),
  ('pak_studies', 'Pakistan Studies', 7),
  ('islamiyat', 'Islamiyat', 8),
  ('urdu', 'Urdu', 9)
ON CONFLICT (code) DO NOTHING;
```

### Generate TypeScript DB types (optional)

```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
# Or for hosted:
npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
```

**Note**: No `database.types.ts` file currently exists in the repo. Types are inferred from query results.

### Other commands

```bash
npm run build          # Production build
npm run lint           # ESLint
npx tsc --noEmit       # Type-check
npm run test:e2e       # Playwright E2E tests (requires running dev server)
npm run test:e2e:ui    # Playwright with UI mode
```

---

## 10. Demo script (5–10 minutes)

**Pre-requisites**: Local dev server running, Supabase project with migrations applied, admin user created (see section 9).

### Step 1 — Landing page (30 seconds)
1. Open `http://localhost:3000`
2. Scroll through: hero, how-it-works, subjects grid, pricing cards, FAQ
3. Point out the lead capture form at the bottom and WhatsApp CTA button

### Step 2 — Student sign-up (1 minute)
1. Click "Get Started" → redirected to `/auth/sign-up`
2. Select "Student", fill in name, email, password, timezone
3. Click "Create Account" → redirected to `/auth/verify`
4. Check email (or Inbucket at `localhost:54324` if local Supabase), click confirm link
5. Complete profile setup (WhatsApp number, timezone auto-detected)
6. Arrive at `/dashboard` — empty state with "Request Your First Subject" CTA

### Step 3 — Create request (1 minute)
1. Click "New Request" → `/dashboard/requests/new`
2. Step through: Student → A Levels Mathematics → 8 sessions/month → set availability (click slots in grid) → add goal ("Exam prep for May 2026")
3. Submit → redirected to request detail → status: "New"

### Step 4 — Select package + pay (1 minute)
1. Click "Select Package" → `/dashboard/packages/new?requestId=...`
2. Select "8 sessions" (PKR 8,000) → redirected to `/dashboard/packages/[id]`
3. See bank transfer instructions, upload a sample image as proof, enter reference "CorvEd | Test | A Level Math"
4. Request status now: "Payment Pending"

### Step 5 — Admin: verify payment (1 minute)
1. Sign in as admin → `/admin`
2. Dashboard shows "1 Pending Payment" card → click → `/admin/payments`
3. View the pending payment, click "View Proof" (opens signed URL), click "Mark Paid"
4. Observe: payment → paid, package → active, request → ready_to_match
5. Click "Copy Message" → opens WhatsApp template `templates.paid()` → show clipboard content

### Step 6 — Admin: approve tutor + match (1 minute)
1. (Pre-requisite: create a tutor account separately and fill profile)
2. Navigate to `/admin/tutors` → find pending tutor → "Approve"
3. Navigate to `/admin/requests` → filter `ready_to_match` → click "Match →"
4. See request details + eligible tutor card → paste a Meet link → set schedule (Mon+Wed, 19:00 PKT)
5. Click "Create Match" → request advances to "matched"

### Step 7 — Admin: generate sessions (30 seconds)
1. Navigate to `/admin/matches/[id]`
2. Click "Generate Sessions" → set date range (this month) → submit
3. Observe: 8 sessions created, match → active, request → active

### Step 8 — Student: view dashboard (1 minute)
1. Switch to student account → `/dashboard`
2. Next session card shows: date/time in student's timezone, tutor name, "Join Google Meet" button
3. Navigate to `/dashboard/sessions` → see 8 upcoming sessions
4. Click "Reschedule" on a session → WhatsApp opens with prefilled message

### Step 9 — Tutor: mark attendance (1 minute)
1. Switch to tutor account → `/tutor`
2. Next session card visible with student name, subject, Meet link
3. Navigate to `/tutor/sessions` → click "Mark Session" on first session
4. Select "Done", add notes "Covered quadratic equations, student did well"
5. Submit → session marked done, `sessions_used` incremented

### Step 10 — Verify remaining sessions (30 seconds)
1. Switch to student account → `/dashboard`
2. `PackageSummary` now shows: "7 sessions remaining" (was 8)
3. Switch to admin → `/admin/sessions` → session shows "Done" status with tutor notes

---

## 11. Known gaps / limitations

### Critical for launch

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **Bank details are placeholders** | `PAYMENT_INSTRUCTIONS` in `lib/config/pricing.ts` has `"CONFIGURE_BEFORE_LAUNCH"` for bank name, account title, IBAN | **S** | Update `lib/config/pricing.ts` with real bank details |
| **No deployed URL** | App must be deployed to accept real users; no Vercel project linked | **M** | Deploy to Vercel, set env vars, configure custom domain |
| **No database.types.ts** | TypeScript DB types are inferred, not generated; reduces type safety | **S** | Run `supabase gen types typescript` and commit the output |
| **Google OAuth not configured** | Requires Google Cloud Console credentials in Supabase Auth settings | **S** | Create OAuth credentials, configure in Supabase dashboard |

### Operational gaps

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **Package expiry not automated** | `expirePackages()` exists in `lib/services/payments.ts` but is never called automatically (no cron/edge function) | **M** | Add a Supabase Edge Function or Vercel Cron Job to run `expirePackages()` daily |
| **Session reminders not automated** | Reminders are manual via WhatsApp; no automated sending | **M** | Phase 2: integrate WhatsApp Business API or add email notifications |
| **24-hour reschedule cutoff not enforced in code** | UI shows warning but admin can reschedule anytime; no programmatic block | **S** | Add server-side validation in `rescheduleSession()` if strict enforcement desired |
| **Renewal workflow is manual** | `getExpiringPackages()` exists but no UI or scheduled alert to admin | **M** | Build admin renewal alerts view or add scheduled notification |
| **No email notifications** | All notifications are manual WhatsApp only; no transactional email for payment confirmation, tutor assignment, session reminders | **M** | Add email service (Resend, SendGrid) for key events |

### Missing automation

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **No WhatsApp API integration** | All WhatsApp messaging is copy-paste; scales poorly beyond ~20 students | **L** | Phase 3: integrate WhatsApp Business API (Meta Cloud API or Twilio) |
| **No Google Calendar integration** | Meet links are manually created and pasted; no calendar invites sent | **M** | Phase 2: Google Calendar API to auto-create events with Meet links |
| **No payment gateway** | Bank transfer only with manual verification; friction for users | **L** | Phase 2: integrate Stripe, JazzCash, or Easypaisa |

### Security / hardening

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **No rate limiting** | Auth endpoints and lead form could be abused | **S** | Add Vercel Edge middleware rate limiting or use `@upstash/ratelimit` |
| **No Sentry or error monitoring** | Runtime errors in production go unnoticed | **S** | Add `@sentry/nextjs` with DSN |
| **CSRF not explicitly handled** | Next.js Server Actions have built-in CSRF protection (origin check), but no custom tokens | **S** | Low risk with Server Actions; add CSRF token layer if needed |
| **Privacy: WhatsApp numbers in audit logs** | Audit log `details` JSONB may contain phone numbers | **S** | Sanitize PII from audit log details |
| **No input sanitization for XSS** | Text inputs (goals, notes, bio) stored and rendered without explicit sanitization | **S** | React auto-escapes JSX; add DOMPurify for any `dangerouslySetInnerHTML` usage (none found currently) |

### Testing gaps

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **No unit tests** | Zero unit test files found; business logic in services is untested | **L** | Add Vitest/Jest tests for `lib/services/scheduling.ts`, `lib/services/sessions.ts`, `lib/services/requests.ts` |
| **E2E tests cover only public pages** | 7 Playwright specs test landing, auth, 404, policies, routing, responsive, a11y — but not authenticated flows (dashboard, tutor, admin) | **M** | Add authenticated E2E flows with test user seeding |
| **No integration tests for RPC functions** | `tutor_update_session` and `increment_sessions_used` RPCs are untested | **M** | Add pgTAP or Supabase test suites for RPCs |

### UX / polish

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **No loading/optimistic UI for mutations** | Server actions block without progress indicators in some forms | **S** | Add `useTransition` or loading spinners to all server action forms |
| **Middleware deprecation warning** | Next.js 16.1.6 warns: `"middleware" file convention is deprecated. Please use "proxy" instead.` | **S** | Migrate `middleware.ts` to the new `proxy` convention when stable |
| **No breadcrumb navigation** | Admin detail pages lack navigation context | **S** | Add breadcrumb component to admin layout |
| **No search/pagination on all admin lists** | User management has search/pagination; some other admin lists may not | **S** | Audit and add `AdminPagination` + search to all admin list pages |
| **PKR formatting** | Prices are displayed as raw numbers without proper locale formatting | **S** | Use `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' })` |

### Data model gaps

| Gap | Why it matters | Size | Fix direction |
|---|---|---|---|
| **No `parent_students` table** | Documented in ARCHITECTURE.md but no migration exists; parent cannot track multiple children | **S** | Add migration; update request form to link to child record |
| **No tutor payout tracking** | Tutor payouts are completely manual with no platform record | **M** | Add `tutor_payouts` table and admin payout recording UI |
| **No message/notification log** | No record of which WhatsApp messages were sent or when | **S** | Add `message_logs` table for audit trail |

---

## 12. Next priorities (recommended roadmap)

### Reliability (ship first)

| # | Task | Justification | Size |
|---|---|---|---|
| 1 | **Configure real bank details** in `lib/config/pricing.ts` | Blocks real payments | S |
| 2 | **Deploy to Vercel** + configure production Supabase env | Blocks real usage | M |
| 3 | **Automate package expiry** via Supabase Edge Function or Vercel Cron | Active packages never expire without manual intervention | M |
| 4 | **Generate and commit `database.types.ts`** | Type safety for all Supabase queries | S |
| 5 | **Add error monitoring** (Sentry) | Runtime errors in production go undetected | S |

### Ops efficiency

| # | Task | Justification | Size |
|---|---|---|---|
| 6 | **Admin renewal alerts dashboard** | Admin has no proactive view of expiring packages; `getExpiringPackages()` exists but isn't surfaced | M |
| 7 | **Automated session reminders** (email or scheduled WhatsApp) | Reduces no-shows; currently 100% manual | M |
| 8 | **Admin bulk session generation** (for renewals) | Currently must navigate to each match individually | S |

### Product polish

| # | Task | Justification | Size |
|---|---|---|---|
| 9 | **Migrate middleware to Next.js `proxy` convention** | Removes deprecation warning; future-proofs for Next.js 17 | S |
| 10 | **Add unit tests for session generation + status transitions** | Core business logic has zero test coverage | M |

### Security

| # | Task | Justification | Size |
|---|---|---|---|
| 11 | **Add rate limiting** on auth + lead endpoints | Prevents abuse before public launch | S |
| 12 | **Sanitize PII in audit log details** | WhatsApp numbers may appear in audit logs | S |

---

## 13. Appendix

### Links found in repo

| Item | Value |
|---|---|
| Repository | `https://github.com/Taleef7/CorvEd` |
| Current branch | `main` |
| Deployed URL | Not found in repo |
| Supabase project URL | Not found in repo (configured via `.env.local`) |
| Supabase local config | `supabase/config.toml` (project_id: `corved`) |

### Scripts / commands

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with UI mode |
| `npx supabase start` | Local Supabase (Docker) |
| `npx supabase db reset` | Apply all migrations + seed locally |
| `npx supabase db push` | Deploy migrations to hosted project |
| `npx supabase gen types typescript --local > lib/supabase/database.types.ts` | Generate TypeScript DB types |
| `scripts/bauhaus-replace.ps1` | PowerShell batch replace for Bauhaus styling |
| `scripts/fix3.ps1` | PowerShell misc fixes |

### Notable design decisions and where documented

| Decision | Rationale | Source |
|---|---|---|
| **Managed service, not marketplace** | Admin controls quality by manually matching; avoids race-to-bottom pricing | `docs/MVP.md` §1, `docs/PRODUCT.md` §1 |
| **WhatsApp-first, no API** | Pakistan's dominant messaging channel; API costs/complexity not justified at MVP scale | `docs/MVP.md` §8, `docs/OPS.md` §2 |
| **Bank transfer only** | Most accessible payment method in Pakistan; avoids gateway integration complexity | `docs/MVP.md` §7 (locked decision) |
| **One Meet link per match** | Simplicity; students bookmark one link | `docs/MVP.md` §9.2, `docs/ARCHITECTURE.md` §5.6 |
| **60-minute sessions only** | Standardized for pricing and scheduling; avoids complexity | `docs/MVP.md` §5.1 (locked decision) |
| **No session carryover** | Simplifies package accounting; monthly boundaries are clear | `docs/MVP.md` §5.2 (locked decision) |
| **Student no-show consumes session, tutor no-show does not** | Incentivizes student attendance; protects students from tutor issues | `docs/MVP.md` §5.4 (locked decision) |
| **Admin mediates student↔tutor comms** | Controls quality, reduces disputes, protects privacy | `docs/MVP.md` §8.1 (locked decision) |
| **`sessions_used` incremented via RPC, not application-level count** | Atomic, prevents race conditions; guard prevents over-increment | `docs/ARCHITECTURE.md` §5.7, migration `20260225000003` |
| **Tutor updates via RPC, not direct table access** | Prevents tutors from editing scheduled times or other restricted columns | `docs/ARCHITECTURE.md` §6.6 |
| **Bauhaus design system** | Distinctive, bold visual identity; no dark mode (single palette) | `docs/frontend_design.md`, `app/globals.css` |
| **UTC storage, local display** | Correct timezone handling for overseas students; luxon for generation, Intl for display | `docs/ARCHITECTURE.md` §9, `.github/copilot-instructions.md` |
| **Trigger-based profile creation** | Every `auth.users` insert auto-creates `user_profiles` + default `student` role; ensures consistency | `docs/ARCHITECTURE.md` §6.2, migration `20260223000004` |
| **`request_id` UNIQUE on matches** | One match per request enforced at DB level; prevents accidental duplicates | migration `20260225000001` |

### E2E test coverage

| Spec file | What it tests |
|---|---|
| `e2e/landing.spec.ts` | Landing page renders, content present |
| `e2e/auth.spec.ts` | Auth page rendering and redirects |
| `e2e/not-found.spec.ts` | Custom 404 page |
| `e2e/policies.spec.ts` | Policies page content |
| `e2e/protected-routes.spec.ts` | Unauthenticated access redirects |
| `e2e/responsive.spec.ts` | Mobile viewport tests |
| `e2e/accessibility.spec.ts` | Accessibility checks |

### Migration file list (complete, ordered)

1. `20260223000001_create_leads_table.sql`
2. `20260223000002_create_enums.sql`
3. `20260223000003_create_subjects.sql`
4. `20260223000004_create_user_profiles.sql`
5. `20260223000005_leads_admin_rls.sql`
6. `20260223000006_user_profiles_insert_rls.sql`
7. `20260223000007_create_requests_table.sql`
8. `20260224000001_create_packages_payments.sql`
9. `20260224000002_create_tutor_tables.sql`
10. `20260225000001_create_matches_table.sql`
11. `20260225000002_create_sessions_table.sql`
12. `20260225000003_increment_sessions_used_guard.sql`
13. `20260225000004_create_payment_proofs_bucket.sql`
14. `20260225000005_add_admin_notes_to_matches.sql`
15. `20260226000001_update_handle_new_user.sql`
16. `20260226000002_subjects_grant_select.sql`
17. `20260226000003_requests_package_tier.sql`
18. `20260226000004_tutor_profile_fields.sql`
