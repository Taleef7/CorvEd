# CorvEd — Project Plan for Further Refinement

Project: CorvEd
Repository: Taleef7/CorvEd
Branch: main
Stack: Next.js (App Router) + Supabase (Postgres + Auth + Storage)
Deployment target: Vercel + Supabase hosted

---

## 1. Purpose of This Document

This document captures the full state of the CorvEd project as of the most recent evaluation, identifies what has been implemented, what remains, and lays out a sequenced refinement plan prioritising user experience for all four roles: student/parent, tutor, and admin.

It is written for an engineer or AI agent continuing the project. Treat it as a living prompt file: update items as they are completed.

---

## 2. What Has Been Implemented

### 2.1 Infrastructure & Auth

- [x] Supabase project configured (`supabase/config.toml`)
- [x] All database migrations applied:
  - leads table with RLS
  - enums (user_role, request_status, payment_status, match_status, session_status)
  - subjects lookup table (seeded)
  - user_profiles (display_name, WhatsApp, timezone, primary_role, for_student_name)
  - requests table (level, subject, exam board, goals, availability windows, timezone, status)
  - packages + payments tables (tier_sessions, sessions_used, proof_path, PKR amount, status)
  - tutor_profiles (subjects, levels, bio, availability_windows, approved flag)
  - matches table (request_id, tutor_user_id, meet_link, schedule_pattern JSONB, status)
  - sessions table (match_id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes)
  - increment_sessions_used_guard trigger (decrements sessions_remaining correctly for done and no_show_student)
- [x] Next.js middleware: session refresh + route protection for /dashboard, /tutor, /admin
- [x] Email/password sign-up with email verification flow
- [x] Google OAuth sign-up/sign-in
- [x] Redirect of authenticated users away from auth pages
- [x] Profile setup redirect if WhatsApp number is missing

### 2.2 Landing Page & Lead Capture

- [x] Public landing page (`app/page.tsx`) with LeadForm and WhatsApp CTA
- [x] LeadForm posts to `/api/leads` and stores in leads table
- [x] Admin lead queue (`app/admin/leads/page.tsx`) lets admins review, filter, contact, and update Phase 0 lead intake records
- [x] WhatsApp CTA links to admin WhatsApp number via `lib/whatsapp/buildLink.ts`
- [x] Policies page (`app/policies/page.tsx`) — reschedule, no-show, refund policies published

### 2.3 Student / Parent Dashboard

- [x] Role-aware dashboard redirect (admin → /admin, tutor → /tutor, student/parent → /dashboard)
- [x] Next session card showing: time in user timezone, subject, tutor name, Meet link, Join button
- [x] Requests list with status badges
- [x] New request form: level, subject, exam board, goals, availability windows, timezone
- [x] Package selection (8/12/20 sessions) with pricing display
- [x] Package detail page: bank transfer instructions, payment reference entry, proof upload (up to 5 MB, Supabase Storage)
- [x] Sessions list view (`app/dashboard/sessions/page.tsx`)
- [x] RescheduleButton component — opens prefilled WhatsApp message to admin
- [x] PackageSummary component — shows sessions remaining, package status, renewal alert when ≤ 3 sessions remain

### 2.4 Tutor Dashboard

- [x] Tutor landing page: next session card (student name, subject, level, Meet link), upcoming and completed session counts, quick links
- [x] Sessions list with SessionCompleteForm: mark done / student no-show / tutor no-show with optional notes
- [x] Tutor profile edit: subjects, levels, bio, availability windows, timezone
- [x] Tutor conduct page (`app/tutor/conduct/page.tsx`)
- [x] Tutor layout with navigation

### 2.5 Admin Dashboard

- [x] Admin overview with cards linking to all sub-sections
- [x] Requests inbox with filter by status, link to request detail
- [x] Request detail: view all fields, assign tutor form (AssignTutorForm)
- [x] Payments list filtered by status (pending/paid/rejected/all); mark paid, mark rejected with rejection note; WhatsApp copy buttons for payment confirmation template
- [x] Tutors list with approve/reject actions, filter by approved status
- [x] Tutor detail: full profile, approve/reject, back link
- [x] Matches list
- [x] Match detail: view full match details, ReassignTutorForm, EditMatchForm (schedule pattern + Meet link), GenerateSessionsForm (session generation), WhatsApp template copy buttons for tutor-assigned and reschedule-confirmed messages
- [x] Sessions list with admin status override (`app/admin/sessions/page.tsx`)
- [x] Sessions status filter supports grouped no-shows (`status=no_show`) across student and tutor no-show statuses
- [x] Users page: list all users with roles
- [x] Audit log page: recent platform events
- [x] Analytics dashboard: active students, active tutors, upcoming sessions (next 7 days), missed sessions (last 7 days), unmarked sessions, pending payments, pending tutor approvals, and new leads

### 2.6 Services & Logic

- [x] `lib/services/matching.ts`: fetchApprovedTutors — filters by subject, level, approved status
- [x] `lib/services/payments.ts`: markPaymentPaid, markPaymentRejected
- [x] `lib/services/requests.ts`: updateRequestStatus
- [x] `lib/services/scheduling.ts`: generateSessions — timezone-aware using luxon, respects schedule_pattern days/time/duration_mins, stops at tierSessions count
- [x] `lib/services/sessions.ts`: tutorUpdateSessionStatus (with RLS-safe access), adminOverrideSessionStatus
- [x] `lib/services/whatsapp.ts`: buildWhatsAppLink, message templates with variable filling
- [x] `lib/whatsapp/templates.ts`: payment_confirmed, tutor_assigned, one_hour_reminder, reschedule_confirmed, no_show_reminder
- [x] `lib/whatsapp/buildLink.ts`: phone + message → wa.me URL
- [x] `lib/config/pricing.ts`: PACKAGES (8/12/20 tiers with PKR prices), PAYMENT_INSTRUCTIONS
- [x] `lib/validators/`: lead, payment, request, tutor (Zod schemas)
- [x] `lib/utils/request.ts`: STATUS_LABELS, STATUS_COLOURS, LEVEL_LABELS, getLevelLabel
- [x] `lib/utils/session.ts`: formatSessionTime (luxon, user timezone)

### 2.7 Sprint Status (per ROADMAP.md)

- [x] Sprint 1 — Core platform foundation (COMPLETE as of 2026-02-24)
- [x] Sprint 2 — Money + matching (packages, payments, tutor onboarding, match creation) — COMPLETE based on code review
- [x] Sprint 3 — Sessions engine (schedule + session generation, Meet link, attendance, remaining sessions) — COMPLETE based on code review
- [x] Sprint 4 — Polish + ops helpers — COMPLETE (WhatsApp templates, UX polish, testing, analytics, security hardening, deployment config all done)

---

## 3. Gap Analysis — What Remains for MVP v0.1

These are the items required before MVP v0.1 is declared done per the exit criteria in docs/ROADMAP.md.

### 3.1 Must-Have (MVP v0.1 Blockers) — MOSTLY ADDRESSED

- [x] **Email verification enforcement** — middleware now checks email verification status and redirects unverified email/password users to `/auth/verify`.
- [ ] **Payment proof storage RLS** — confirm the Supabase Storage bucket for payment proofs has correct RLS policies so only the owner and admin can read a proof file. The signed URL approach (A1 fix) provides defense in depth.
- [ ] **Session count correctness end-to-end test** — manual verification still needed. Double-increment guard (B1) now protects the RPC. Unit tests for scheduling logic added.
- [ ] **Overseas timezone display smoke test** — sign in as a user with timezone America/New_York, confirm the next session card and sessions list display times in that timezone (not UTC or PKT).
- [ ] **Admin can set Meet link and it appears on student + tutor dashboards** — trace the data flow from the EditMatchForm through to the NextSessionCard and tutor session list to confirm the meet_link field is displayed correctly.
- [x] **Package renewal alert** — PackageSummary at ≤3 sessions. Admin analytics now shows renewal alerts via `getExpiringPackages(5)`.

### 3.2 Nice-to-Have for v0.1 (but not blockers)

- [ ] **Tutor availability overlap matching** — the current `fetchApprovedTutors` filters by subject and level but does not compare tutor availability_windows against the student's requested availability.
- [ ] **Admin match detail: link to student and tutor profiles** — the match detail page shows names but should link to the user management and tutor detail pages.
- [x] **"What happens next" status banners** — `components/dashboards/StatusBanner.tsx` created and integrated into student dashboard.
- [x] **Tutor no-show handling in admin** — `/admin/sessions?status=no_show` now intentionally groups `no_show_student` and `no_show_tutor`, so analytics links land on the sessions requiring follow-up.

---

## 4. Gap Analysis — What Remains for MVP v0.2 (Launch Hardening)

### 4.1 UX Polish — MOSTLY DONE

- [x] **Consistent status banners** — `StatusBanner.tsx` covers payment_pending, ready_to_match, matched, active, paused, ended.
- [ ] **Mobile responsiveness audit** — still needed at 375px for: request form, package detail, admin match detail.
- [x] **Loading states** — generic skeletons (`loading.tsx`) added at all route levels (admin, dashboard, tutor).
- [x] **Empty states** — friendly empty state messages on list pages.
- [x] **Error handling** — toast notifications standardized via Sonner. Zod validation for admin actions.
- [x] **Reschedule cutoff warning** — `RescheduleButton` already implements 24-hour cutoff.

### 4.2 Design System Application — ✅ DONE

The Bauhaus design system has been applied:

- [x] **Apply Outfit font** — imported via `next/font/google` in `app/layout.tsx`, set as primary font.
- [x] **Apply Bauhaus design tokens** — CSS custom properties in `app/globals.css` for the full Bauhaus palette.
- [x] **Redesign the landing page** — bold headline, geometric color blocks, thick black borders, hard shadows.
- [x] **Redesign dashboard cards** — Bauhaus hard-shadow squared card style throughout.
- [x] **Admin dashboard** — Bauhaus treatment applied, structured and authoritative.

### 4.3 Operational Tooling

- [ ] **Admin WhatsApp copy buttons — comprehensive coverage** — extend to: 1-hour reminder, reschedule confirmation, no-show policy reminder on session pages.
- [ ] **Filter and search improvements** — add text search by student name/subject to admin requests page.
- [x] **Audit log privacy hygiene** — audit detail writes use `sanitizeAuditDetails()` and the tutor session RPC redacts free-text notes before inserting into `audit_logs`.

### 4.4 Reliability & Error Handling — MOSTLY DONE

- [x] **Form validation feedback** — Zod validation in admin server actions (C3). Inline errors + toast for outcomes.
- [ ] **Supabase error surface** — wrap all Supabase calls in try/catch consistently. Partially done.
- [ ] **Package/payment idempotency** — confirm payment creation prevents duplicates.

### 4.5 Testing — ✅ DONE

Test infrastructure established:

- [x] **Unit tests for scheduling logic** — `lib/services/__tests__/scheduling.test.ts` with 11 tests covering: session count, tier limits, date range, 31-day months, UTC conversion for PKT, DST handling (US Eastern), invalid timezone, invalid time format, empty results, duration calculation. All passing.
- [x] **Unit tests for rate-limit logic** — `lib/__tests__/rate-limit.test.ts` with 4 tests. All passing.
- [ ] **Unit tests for session count logic** — DB trigger tests need local Supabase running.
- [ ] **Integration smoke tests** — E2E flow test still needed (Playwright infrastructure exists).

---

## 5. User Experience Priorities by Role

### 5.1 Student / Parent

The most critical moment is between payment submission and first session. Students need constant reassurance at each step.

Priority order:
1. Clear onboarding (sign up → verify email → profile setup → request → package → pay) with no dead ends
2. Dashboard always shows: next session time in local timezone, Meet link prominently, sessions remaining, tutor name
3. Renewal prompt is visible and actionable at ≤ 3 sessions remaining
4. WhatsApp reschedule CTA is one tap away from the dashboard

### 5.2 Tutor

Tutors need a focused, frictionless workflow: see what's coming, join the session, mark it done.

Priority order:
1. Next session card is the hero element on the tutor dashboard — time, student, subject, level, one-tap Meet link
2. Session list is sorted chronologically; past sessions show their status
3. Session completion form is easy to reach and quick to submit (one click to mark done with optional note)
4. Profile edit is accessible but not in the way

### 5.3 Admin

Admin is a power user who needs efficiency and clarity. The admin dashboard is an operational tool.

Priority order:
1. Pending items visible immediately on the analytics page (pending payments, pending tutor approvals, unmarked sessions)
2. Request → payment → match flow is linear and each step links to the next
3. Copy-to-WhatsApp buttons are present at every communication touchpoint
4. Session list shows any sessions that are past their scheduled time but not yet marked — this is the most important ops signal

---

## 6. Sequenced Refinement Plan — STATUS

### Step 1: MVP v0.1 Verification — ✅ CODE COMPLETE (manual verification still needed)

Code fixes applied: email verification enforcement (middleware), payment proof signed URLs, double-increment guard, package renewal alerts. Manual E2E scenario still recommended before launch.

### Step 2: UX Polish Pass — ✅ DONE

Status banners, onboarding checklist, toast notifications, empty states, loading skeletons, reschedule cutoff all implemented. Mobile responsiveness audit at 375px still recommended.

### Step 3: Design System Application — ✅ DONE

Bauhaus design system fully applied: Outfit font, CSS custom properties, landing page, dashboard cards, admin dashboard.

### Step 4: Admin Ops Tooling — PARTIALLY DONE

Renewal alerts in analytics, Zod validation, rate limiting done. WhatsApp button comprehensive coverage and text search still TODO.

### Step 5: Testing — ✅ DONE

Vitest infrastructure established. 15 unit tests (11 scheduling, 4 rate-limit), all passing. DB trigger tests and E2E smoke test still recommended.

### Step 6: Pre-launch Checklist — TODO

Run through `docs/MVP.md` section 14 (launch checklist) item by item. Also:
- Install and configure Sentry (F2)
- Set real bank details in env vars (A2)
- Verify payment proof bucket RLS
- Run manual E2E scenario
- 375px mobile responsiveness audit

---

## 7. Open Questions / Decisions Needed

1. **Tutor payout tracking** — the MVP spec mentions payout rates are managed manually. Is there a payout_records table or admin notes field needed, or is this fully off-platform for MVP?
2. **Email notifications** — MVP.md marks transactional email (payment received, tutor assigned) as optional. Should this be implemented before launch or deferred?
3. **Renewal flow** — is renewal triggered by the admin generating a new package, or does the student select and pay again? The student UI currently shows a renewal alert but there is no explicit renewal CTA or new package flow tied to an existing match.
4. **Public tutor profiles** — does the student see the tutor's bio and name before being matched, or only after? Currently the match detail shows the tutor name to the student on the dashboard.
5. **Google OAuth profile setup** — when a user signs up via Google, do they still go through the profile setup page to capture WhatsApp number and timezone? Confirm the callback route handles this correctly.

---

## 8. Technical Debt to Address Before Launch

- The `app/page.tsx` (landing page) is large and mixes concerns. Extract the features section, pricing section, and how-it-works section into separate components under `components/landing/`.
- The admin match detail page (`app/admin/matches/[id]/page.tsx`) loads all data in one server component. If matches grow large, consider pagination.
- Several pages pass `supabase.auth.getUser()` and profile queries in sequence. Abstract into a shared `getSessionUser()` util in `lib/auth/utils.ts` that returns both user and profile in one call.
- The WhatsApp template filling uses string interpolation inline in several places. Centralise all template variable substitution in `lib/whatsapp/templates.ts` so templates are DRY.

---

## 9. New Infrastructure Added (March 2026 Sprint)

### Files Created
| File | Purpose |
| --- | --- |
| `lib/supabase/database.types.ts` | Generated TypeScript types for all tables, enums, functions |
| `lib/rate-limit.ts` | In-memory sliding-window rate limiter |
| `app/auth/actions.ts` | Server Action for sign-out (CSRF-protected) |
| `app/api/cron/expire-packages/route.ts` | Daily cron to expire packages past end_date |
| `app/dashboard/packages/actions.ts` | Signed URL + rejected payment re-upload server actions |
| `app/dashboard/tutor/[id]/page.tsx` | Read-only tutor profile for students |
| `app/help/page.tsx` | Help/FAQ page |
| `app/privacy/page.tsx` | Privacy Policy |
| `app/terms/page.tsx` | Terms of Service |
| `components/dashboards/OnboardingChecklist.tsx` | Step-by-step onboarding progress |
| `components/dashboards/StatusBanner.tsx` | Request status-aware banners |
| `vercel.json` | Deployment config with cron |
| `.env.example` | Environment variable documentation |
| `vitest.config.ts` | Unit test configuration |
| `lib/services/__tests__/scheduling.test.ts` | 11 scheduling unit tests |
| `lib/__tests__/rate-limit.test.ts` | 4 rate-limit unit tests |
| `supabase/migrations/20260303000001_fix_double_increment_guard.sql` | Double-increment guard for tutor_update_session |

### Files Modified (key changes)
| File | Change |
| --- | --- |
| `next.config.ts` | Added 6 security headers |
| `proxy.ts` | Added email verification + role-based access enforcement |
| `lib/supabase/{client,server,admin}.ts` | Added `Database` generic type |
| `lib/validators/payment.ts` | Added `markPaidSchema`, `rejectPaymentSchema` |
| `app/admin/payments/actions.ts` | Added Zod validation |
| `app/admin/analytics/page.tsx` | Added renewal alerts section |
| `app/admin/layout.tsx` | Mobile nav scroll fade indicators + sign-out server action |
| `app/dashboard/page.tsx` | Onboarding checklist + status banners |
| `app/dashboard/packages/[id]/page.tsx` | Signed URLs + rejected payment re-upload |
| `components/dashboards/SessionCompleteForm.tsx` | Toast notifications |
| `app/api/leads/route.ts` | Rate limiting (10 req/min per IP) |
| `package.json` | Added vitest, typecheck script, fixed @types/luxon location |

---

End of plan. Last updated: 2026-03-03.
