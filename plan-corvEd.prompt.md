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
- [x] Users page: list all users with roles
- [x] Audit log page: recent platform events
- [x] Analytics dashboard: active students, active tutors, upcoming sessions (next 7 days), missed sessions (last 7 days), unmarked sessions, pending payments, pending tutor approvals

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
- [ ] Sprint 4 — Polish + ops helpers — PARTIALLY COMPLETE (WhatsApp templates done; UX polish, testing, and analytics remain)

---

## 3. Gap Analysis — What Remains for MVP v0.1

These are the items required before MVP v0.1 is declared done per the exit criteria in docs/ROADMAP.md.

### 3.1 Must-Have (MVP v0.1 Blockers)

- [ ] **Email verification enforcement** — verify that users who sign up via email/password cannot access protected routes before email is verified. The verify page exists (`app/auth/verify/page.tsx`) but confirm the middleware or profile setup redirect actively blocks unverified users from creating requests or viewing dashboards.
- [ ] **Payment proof storage RLS** — confirm the Supabase Storage bucket for payment proofs has correct RLS policies so only the owner and admin can read a proof file. Add a migration if missing.
- [ ] **Session count correctness end-to-end test** — manually verify the full flow: create package (20 sessions) → generate sessions → mark 2 as done → mark 1 as no_show_student → confirm sessions_used = 3, sessions_remaining = 17 in the packages table. Fix the trigger if counts are off.
- [ ] **Overseas timezone display smoke test** — sign in as a user with timezone America/New_York, confirm the next session card and sessions list display times in that timezone (not UTC or PKT).
- [ ] **Admin can set Meet link and it appears on student + tutor dashboards** — trace the data flow from the EditMatchForm through to the NextSessionCard and tutor session list to confirm the meet_link field is displayed correctly.
- [ ] **Package renewal alert** — the PackageSummary component shows a renewal alert at ≤ 3 sessions remaining. Confirm the threshold logic is correct and that it renders on the student dashboard.

### 3.2 Nice-to-Have for v0.1 (but not blockers)

- [ ] **Tutor availability overlap matching** — the current `fetchApprovedTutors` filters by subject and level but does not compare tutor availability_windows against the student's requested availability. Add basic overlap filtering or a visual availability display so the admin can make an informed decision.
- [ ] **Admin match detail: link to student and tutor profiles** — the match detail page shows names but should link to the user management and tutor detail pages.
- [ ] **"What happens next" status banners** — on the student dashboard, show a clear banner when payment is pending ("Your payment is being verified"), when matching is in progress ("We are finding you a tutor"), etc.
- [ ] **Tutor no-show handling in admin** — when a session is marked no_show_tutor, surface it clearly in the admin sessions page so the admin can reschedule or reassign.

---

## 4. Gap Analysis — What Remains for MVP v0.2 (Launch Hardening)

### 4.1 UX Polish

- [ ] **Consistent status banners** — every status transition (payment_pending, ready_to_match, matched, active) should have a visible, friendly banner on the student dashboard explaining the current state and next action.
- [ ] **Mobile responsiveness audit** — walk through all core flows on a 375px viewport. Pay special attention to: the new request form (long availability windows section), the package detail page (bank transfer instructions + file upload), and the admin match detail page (schedule pattern editor).
- [ ] **Loading states** — all client-side pages that fetch data should show a spinner or skeleton instead of a blank page. Currently some pages use useEffect + useState and may flash blank.
- [ ] **Empty states** — every list (sessions, requests, matches) needs a friendly empty state: illustration or icon + message + primary CTA.
- [ ] **Error handling** — server action errors should display clearly in the UI (not just console). Add toast notifications or inline error banners for failed operations.
- [ ] **Reschedule cutoff warning** — show a prominent warning on the student session detail if the session is within 24 hours of start (reschedule cutoff passed).

### 4.2 Design System Application

The project has a Bauhaus design system defined in `docs/frontend_design.md` (geometric, primary-color, thick-border, hard-shadow aesthetic using the 'Outfit' font). This system has not been applied to the UI yet.

- [ ] **Apply Outfit font** — import from Google Fonts and set as the primary font family in `app/globals.css` and `app/layout.tsx`.
- [ ] **Apply Bauhaus design tokens** — establish CSS custom properties for the Bauhaus palette (background #F0F0F0, foreground #121212, primary-red #D02020, primary-blue #1040C0, primary-yellow #F0C020) and update Tailwind config to expose them.
- [ ] **Redesign the landing page** — apply Bauhaus aesthetic: bold uppercase headline, geometric color blocks, thick black borders, hard 4–8px offset shadows, primary color CTAs.
- [ ] **Redesign dashboard cards** — replace the current soft-shadow rounded cards with the Bauhaus hard-shadow squared card style (rounded-none, 2px black border, 4px hard shadow offset).
- [ ] **Admin dashboard** — apply the same Bauhaus treatment; the admin UI should feel structured and authoritative, not generic.

### 4.3 Operational Tooling

- [ ] **Admin WhatsApp copy buttons — comprehensive coverage** — currently implemented for payment confirmation and tutor-assigned templates. Extend to: 1-hour reminder, reschedule confirmation, no-show policy reminder. These should appear on the session detail or sessions list page.
- [ ] **Filter and search improvements** — admin requests page has status filters; add text search by student name or subject. Admin sessions page should be filterable by match, date range, and status.
- [ ] **Audit log completeness** — confirm that all key admin actions (payment marked paid, tutor approved, match assigned, session rescheduled) write an audit_log entry. Review the increment_sessions_used_guard trigger to see if it logs.

### 4.4 Reliability & Error Handling

- [ ] **Form validation feedback** — all forms should display field-level validation errors inline (not just server-level). Use Zod schemas already defined in `lib/validators/` consistently.
- [ ] **Supabase error surface** — wrap all Supabase calls in try/catch or use the error field and render actionable messages to users.
- [ ] **Package/payment idempotency** — the package creation page already checks for an existing active/pending package and redirects. Confirm payment creation also prevents duplicate payment records for the same package.

### 4.5 Testing

There is currently no test infrastructure. For MVP v0.2 launch readiness, add:

- [ ] **Unit tests for scheduling logic** — `lib/services/scheduling.ts` (generateSessions) is the most critical algorithm. Write tests for: edge months (31-day months), timezone DST boundaries, sessions capped at tierSessions, invalid timezone input, invalid time format.
- [ ] **Unit tests for session count logic** — test that the increment_sessions_used_guard trigger correctly increments on done and no_show_student and does not increment on no_show_tutor or rescheduled.
- [ ] **Integration smoke tests** — write at least one end-to-end flow test: sign up → create request → select package → admin marks paid → admin assigns tutor → admin generates sessions → tutor marks session done → check sessions_used increments.

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

## 6. Sequenced Refinement Plan

### Step 1: MVP v0.1 Verification (1–3 days)

Complete the gap items in section 3.1 (must-have blockers). Run the full end-to-end scenario manually:

```
Parent signup → email verify → profile setup → create request (A Level Math, 8 sessions)
→ select package → submit bank transfer reference + proof upload
→ admin marks payment paid
→ admin assigns approved tutor
→ admin sets schedule (Mon/Wed/Fri, 16:00 PKT) + generates 8 sessions
→ admin records Meet link
→ student dashboard shows: next session time in student timezone, Meet link, tutor name, 8 sessions remaining
→ tutor marks 2 sessions done → student dashboard shows 6 remaining
→ tutor marks 1 session no_show_student → student dashboard shows 5 remaining
→ tutor marks 1 session no_show_tutor → student dashboard still shows 5 remaining (no decrement)
→ check overseas timezone: repeat as US Central user, confirm times are correct
```

### Step 2: UX Polish Pass (3–5 days)

Address section 4.1 items. Focus on mobile-first: the student dashboard, the session card, and the reschedule CTA must work well at 375px.

Apply consistent empty states across all list pages. Add the status banners for every request status.

### Step 3: Design System Application (3–5 days)

Apply the Bauhaus design system from `docs/frontend_design.md`:
1. Add Outfit font via `next/font/google` in `app/layout.tsx`
2. Update `tailwind.config.ts` with the Bauhaus color tokens
3. Redesign the landing page (highest visibility)
4. Apply card/button/badge patterns across dashboard and admin pages

### Step 4: Admin Ops Tooling (2–3 days)

Extend WhatsApp copy buttons to all template types. Add text search to requests and sessions. Confirm audit log coverage.

### Step 5: Testing (2–3 days)

Add scheduling unit tests. Add DB trigger tests using Supabase local dev (`supabase start`). Write one integration smoke test.

### Step 6: Pre-launch Checklist (1 day)

Run through `docs/MVP.md` section 14 (launch checklist) item by item. Confirm every item is green before public launch.

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

End of plan. Update this file as items are completed.
