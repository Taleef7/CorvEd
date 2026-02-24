# CorvEd Roadmap

Last updated: 2026-02-24  
Owner: Taleef  
References: docs/MVP.md, docs/PRODUCT.md, docs/OPS.md, docs/ARCHITECTURE.md  
Stack: Next.js + Supabase

This roadmap defines how CorvEd should be built and launched as a functioning side-hustle. It is organized by phases and releases, with clear entry/exit criteria and recommended sequencing. It is written so that another engineer or AI agent can pick up the project and execute without ambiguity.

Contents
1) guiding principles
2) phases and release strategy
3) Phase 0 (concierge validation) plan
4) MVP v0.1 (end-to-end platform) plan
5) MVP v0.2 (polish, reliability, launch hardening)
6) post-MVP roadmap (Phase 2+)
7) suggested sprint plan (side-hustle realistic cadence)
8) risk register (roadmap-level)

--------------------------------------------------------------------------------

## 1) guiding principles

- ship usable slices early (do not wait for “perfect”)
- platform is the record system; WhatsApp is the operations channel
- protect scope: O/A only, 1:1 only, bank transfer only, manual matching only
- optimize for:
  - reliability of scheduling and session tracking
  - low admin overhead
  - teacher retention (pricing slightly above market)
- every release must be demonstrable:
  - a user can complete a meaningful flow in the deployed product

--------------------------------------------------------------------------------

## 2) phases and release strategy

Phase 0: concierge validation
- objective: validate demand, pricing, and operational workflow before full platform

MVP v0.1: end-to-end usable platform
- objective: a paying student can be onboarded and taught entirely using the platform + WhatsApp

MVP v0.2: polish + reliability
- objective: reduce operational friction, add guardrails, and prepare for public launch

Phase 2+: expansion
- objective: add new offerings (SAT/IELTS/TOEFL), improve automation, and scale operations

--------------------------------------------------------------------------------

## 3) Phase 0: concierge validation (start immediately)

3.1 description
Before building everything, run the service using:
- a landing page (even basic)
- a structured intake form
- WhatsApp Business operations
- manual scheduling and payment verification

This phase proves whether:
- you can consistently acquire leads
- people will pay at your pricing
- teachers can deliver consistently
- no-show/reschedule rates are manageable

3.2 deliverables
- WhatsApp Business number set up
- message templates and labels in place (OPS.md)
- simple landing page with:
  - subjects offered
  - package tiers
  - “request tutoring” intake form
  - WhatsApp CTA
- manual workflow running for at least 3–10 paying students

3.3 exit criteria (Phase 0 is successful if)
- at least 3 paying students complete at least 2 sessions each
- you can match and schedule within 24 hours for most cases
- no-show policy can be enforced without major disputes
- at least 1 student renews (or expresses intent)

3.4 if Phase 0 fails
Common failure reasons:
- lead volume too low → adjust channel strategy
- pricing mismatch → adjust tiers
- tutor reliability issues → tighten approvals and backups

--------------------------------------------------------------------------------

## 4) MVP v0.1: end-to-end platform (first “real” MVP release)

4.1 objective
A parent/student can:
- create account (email verify)
- create request
- select package + submit payment proof
Admin can:
- verify payment
- match tutor
- set schedule + generate sessions
Tutor can:
- view sessions
- mark attendance + notes
Student can:
- see schedule + Meet link + remaining sessions
Ops can:
- run reminders and reschedules through WhatsApp

4.2 included feature set (MVP v0.1)
- landing page + intake flow (in-platform)
- auth (email/password + Google) + email verification enforcement
- request creation (single subject) with availability + timezone
- package creation (8/12/20 per month) + payment record + optional proof upload
- admin dashboard:
  - requests inbox
  - payment marking paid/rejected
  - tutor list + approvals
  - match assignment
  - schedule pattern + session generation
  - Meet link capture/edit
- tutor dashboard:
  - sessions list
  - update status + notes
- student dashboard:
  - next session
  - sessions list
  - Meet link
  - remaining sessions
  - WhatsApp reschedule CTA
- basic audit logging for admin actions (recommended)

4.3 exit criteria (MVP v0.1 “done”)
- you can run a full month package end-to-end for at least 1 subject
- attendance marking correctly updates remaining sessions
- student no-show consumes a session; tutor no-show does not
- sessions are displayed correctly for overseas timezone user
- Meet link is always visible and correct

--------------------------------------------------------------------------------

## 5) MVP v0.2: polish, reliability, launch hardening

5.1 objective
Make the product trustworthy and easier to operate at higher volume.

5.2 included improvements
- UX polish:
  - clearer status banners (payment pending, matching in progress, active)
  - faster mobile performance
- operational tooling:
  - admin “copy message” buttons for WhatsApp templates with variables filled
  - improved filtering and search in admin lists
- policy enforcement:
  - UI warnings for reschedule cutoff (24 hours)
  - session status changes constrained correctly (tutor can’t change times)
- basic analytics:
  - active students, upcoming sessions, no-show counts
- basic policies page (reschedule/no-show/refunds)
- reliability:
  - better error handling and user-friendly messages
  - admin audit log completeness

5.3 exit criteria (MVP v0.2 “launch ready”)
- operator can manage 10–20 active students without operational chaos
- repeated workflows are fast and standardized
- disputes are reduced due to clarity + published policies
- product looks credible enough for public sharing

--------------------------------------------------------------------------------

## 6) post-MVP roadmap (Phase 2+)

Phase 2: offerings expansion (after stable revenue)
- add SAT/IELTS/TOEFL as separate “program types”
- introduce tutor tiers:
  - standard vs premium
- basic student feedback and ratings
- optional email notifications for schedule/payment updates

Phase 3: automation and scaling
- WhatsApp API integration (if volume justifies)
- calendar integration (Google Calendar invites per session)
- improved tutor marketplace features:
  - tutor browsing (optional)
  - auto-suggest matching (still admin-approved)
- multi-admin operations support (team accounts)

Phase 4: admissions counseling product line
- separate flow:
  - packages based on deliverables (calls, essays, applications)
  - document upload and feedback cycle
- higher-touch support model

--------------------------------------------------------------------------------

## 7) suggested sprint plan (side-hustle realistic cadence)

Assumption: you work evenings/weekends; aim for steady weekly progress.

Sprint 0 (setup + Phase 0 ops) — 3 to 7 days
- WhatsApp Business setup
- landing page + intake
- run concierge with first leads

Sprint 1 (core platform foundation) — 1 to 2 weeks ✅ COMPLETE (2026-02-24)
- Next.js + Supabase auth
- user profiles + roles
- request creation
- basic dashboards (skeleton)

Sprint 2 (money + matching) — 1 to 2 weeks
- packages + payments (manual verification)
- admin request inbox
- tutor onboarding + approval
- match creation

Sprint 3 (sessions engine) — 1 to 2 weeks
- schedule pattern + session generation
- Meet link storage
- tutor session updates (status + notes)
- remaining sessions logic

Sprint 4 (polish + ops helpers) — 1 week
- WhatsApp template helpers
- UX improvements
- policies page
- basic analytics

Total expected time to v0.1 (typical): ~4–6 weeks of consistent part-time effort.

--------------------------------------------------------------------------------

## 8) risk register (roadmap-level)

Risk: scope creep (adding exams/counseling too early)
Mitigation: keep Phase 0 + MVP v0.1 strictly O/A tutoring only

Risk: tutor supply gaps for high-demand subjects
Mitigation: keep at least 2 tutors per core subject before marketing hard

Risk: operational chaos via WhatsApp
Mitigation: labels + quick replies + strict data hygiene (platform is record)

Risk: overseas timezone confusion
Mitigation: store UTC, always show timezone explicitly, confirm in messages

Risk: payment verification delays
Mitigation: set SLA and clearly communicate “verification within X hours”

Risk: no-show abuse
Mitigation: 24-hour cutoff and no-show consumes session, remind policy upfront

End of ROADMAP.md