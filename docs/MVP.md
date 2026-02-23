# CorvEd MVP

Last updated: 2026-02-22
Owner: Taleef
Market: Pakistan-first, with support for overseas students from day 1
Primary comms: WhatsApp (WhatsApp-first operations)
Delivery: online via Google Meet

This document defines the minimum viable product (MVP) for CorvEd in enough detail that a new engineer or AI agent can implement it without guessing. It locks scope, policies, user flows, and acceptance criteria for a usable, demonstrable product that can launch as a side-hustle immediately.

Contents
1) summary
2) goals and non-goals
3) target users and roles
4) scope (what is in MVP)
5) policies (sessions, rescheduling, no-shows)
6) packages and pricing model
7) payments (PK MVP)
8) communication and reminders (WhatsApp-first)
9) scheduling and Google Meet logistics
10) functional requirements by role
11) system data model (MVP-level)
12) status lifecycle (requests, matches, sessions, payments)
13) out of scope for MVP
14) launch checklist
15) definition of done
16) risks and mitigations

--------------------------------------------------------------------------------

1) summary

CorvEd MVP is a managed tutoring service with a lightweight platform layer:

- students (or parents) create an account and submit a tutoring request by level and subject
- the admin matches the request to an approved tutor manually
- the admin sets a recurring schedule and generates sessions for the month
- the platform becomes the source of truth for:
  - assigned tutor
  - package and remaining sessions
  - upcoming session times in the user’s timezone
  - the recurring Google Meet link
  - attendance and tutor session notes
- WhatsApp is used for operational communication (confirmations, reminders, reschedules), using templated messages and optional WhatsApp Business setup

The MVP is designed to be operationally viable as a side-hustle from day 1.

--------------------------------------------------------------------------------

2) goals and non-goals

2.1 goals (MVP must achieve)

Business goals
- launch quickly with a usable workflow that supports real paying students
- make matching and scheduling reliable and repeatable
- incentivize teachers by pricing slightly above market average (PKR tiered pricing)
- minimize admin chaos by keeping the platform as the record system, WhatsApp as the comms channel

Product goals
- support both student signups and parent signups for their children
- allow O Levels and A Levels tutoring for a fixed set of subjects at launch
- enable end-to-end flow:
  - request → pay → match → schedule → sessions → attendance/notes → package renewals (manual renewal is OK)

2.2 non-goals (explicitly not required for MVP)

- admissions counseling (later phase)
- SAT / IELTS / TOEFL coaching (later phase)
- group classes (1:1 only in MVP)
- automated tutor matching (matching is manual in MVP)
- automated payments (manual verification in MVP)
- full WhatsApp automation via API (optional; MVP can use templates + copy-to-WhatsApp)

--------------------------------------------------------------------------------

3) target users and roles

3.1 roles
- student: the learner. may sign up directly.
- parent: may sign up and manage tutoring for their child.
- tutor: teaches a subject at a given level.
- admin: operates the service (matching, scheduling, payment verification, issue handling).

3.2 geography and timezones
- launch focus: Pakistan
- from day 1, support overseas students
- platform stores session times in UTC internally and displays in the viewer’s timezone
- show PKT as secondary reference in UI where helpful (optional but recommended)

3.3 language
- English UI only in MVP

--------------------------------------------------------------------------------

4) scope (what is in MVP)

4.1 tutoring levels (MVP)
- O Levels
- A Levels

4.2 subjects (MVP)
- Math
- Physics
- Chemistry
- Biology
- English
- Computer Science
- Pakistan Studies
- Islamiyat
- Urdu

4.3 tutoring format (MVP)
- 1:1 only
- online only (Google Meet)

4.4 core features (MVP)

Student/Parent
- sign up with email/password or Google
- email verification required for email/password signup
- create tutoring requests (level + subject + goals + availability)
- select a monthly package (8 / 12 / 20 sessions)
- view assigned tutor, schedule, recurring Meet link, sessions remaining
- request reschedule via WhatsApp entry point

Tutor
- tutor can apply (or be pre-created); admin must approve
- view assigned sessions
- mark attendance and add session notes

Admin
- view and filter requests by status
- manually match a request to an approved tutor
- record/verify payments manually
- set recurring schedule; generate sessions for the month
- create/store recurring Google Meet link for each student-subject match
- update session dates for reschedules
- handle no-show rules (student vs tutor)

--------------------------------------------------------------------------------

5) policies (sessions, rescheduling, no-shows)

These policies are locked for MVP.

5.1 session duration
- all sessions are 60 minutes

5.2 package validity
- monthly packages only
- no carryover of unused sessions into next month

5.3 reschedule policy
- reschedule cutoff: 24 hours before the scheduled session start time (based on the student’s timezone for clarity; store rule enforcement in UTC)
- reschedule requests are initiated via WhatsApp to admin
- admin updates the session time in the platform
- rescheduled sessions must still occur within the same package month window (unless admin makes an explicit exception)

5.4 no-show policy
Student no-show
- if the student/parent has already paid for the month:
  - a student no-show counts as a used session
  - the session is marked status = no_show_student
  - remaining sessions decrement by 1

Tutor no-show
- does not count as a used session
- session is marked status = no_show_tutor
- remaining sessions do not decrement
- admin reschedules and/or reassigns tutor if needed

5.5 cancellations
- in MVP, treat cancellations as reschedules where possible
- if a session is canceled after the 24-hour cutoff by student, it is treated as student no-show unless admin overrides

5.6 refunds
- MVP default: refunds are rare; prefer credits inside the month
- if payment was made and service cannot be provided (no tutor availability), admin can refund manually outside the platform

--------------------------------------------------------------------------------

6) packages and pricing model

6.1 package tiers (MVP)
- 8 sessions/month (typical: 2 sessions/week)
- 12 sessions/month (typical: 3 sessions/week)
- 20 sessions/month (typical: 5 sessions/week)

6.2 package is per subject
- packages are purchased per subject (locked decision)
Example:
- A Levels Math: 8 sessions/month
- O Levels Chemistry: 12 sessions/month

6.3 pricing model
- prices are tiered in PKR
- pricing should be set slightly above average market rate to incentivize tutors
- MVP implementation requirement:
  - pricing is configurable (via config file or admin setting) without code changes
  - but can ship initially with hardcoded defaults until an admin pricing UI exists

6.4 tutor payout model
- platform-set pricing
- platform-set tutor payout rates
- payouts are managed manually in MVP (tracked in admin notes or payout records)

--------------------------------------------------------------------------------

7) payments (Pakistan MVP)

7.1 accepted methods (MVP)
- bank transfer only (locked decision for MVP)

7.2 payment flow (manual verification)
- student selects package and sees bank transfer instructions
- student submits payment proof (optional but recommended):
  - screenshot upload and/or transaction reference
- admin verifies externally and marks payment as paid in admin dashboard
- request status transitions to ready_to_match (or matched if tutor already assigned)

7.3 payment record requirements (MVP)
For each payment, store:
- payer user id (student or parent)
- subject and level
- package tier (8/12/20)
- amount in PKR
- payment method = bank_transfer
- reference id (optional)
- proof attachment url (optional)
- status (pending, paid, rejected, refunded)
- timestamps

--------------------------------------------------------------------------------

8) communication and reminders (WhatsApp-first)

8.1 comms structure (locked decision)
- separate 1:1 WhatsApp chats:
  - student/parent ↔ admin
  - tutor ↔ admin
- students do not directly message tutors by default in MVP (admin mediates). This keeps operations controlled and reduces disputes.
- optional later: create group chats only when necessary (not core MVP)

8.2 WhatsApp reminders approach (MVP)
- MVP must include templated message content stored in docs/OPS.md
- MVP must include “copy message” helpers inside the admin UI where possible
- MVP can start with manual sending via WhatsApp Business app
- optional: integrate WhatsApp Business API later (Twilio WhatsApp or Meta Cloud API)

8.3 reminder schedule (recommended default for MVP)
- 24 hours before: optional
- 1 hour before: recommended (highest impact)
- reminders can be manual initially; automate later

8.4 email
- email verification is required on signup
- transactional email (optional MVP): payment received, tutor assigned
- WhatsApp remains the primary operations channel

--------------------------------------------------------------------------------

9) scheduling and Google Meet logistics

9.1 scheduling model
- admin sets a recurring schedule for a match (student-subject-tutor)
- system generates the month’s sessions (8/12/20) based on recurrence
- sessions can be individually edited for reschedules

9.2 Google Meet link strategy (locked decision)
- one recurring Google Meet link per student-subject match
- stored on the Match record
- every session displays the same link

9.3 how Meet links are created (MVP requirement)
MVP must support storing a Meet link, even if created manually.
- admin pastes Meet link into Match details
- platform displays link on dashboards
Optional enhancement:
- create a Google Calendar event and reuse that Meet link, but this is not required for MVP

--------------------------------------------------------------------------------

10) functional requirements by role

10.1 student/parent requirements (MVP)

Account and identity
- sign up with email/password or Google
- if email/password:
  - email verification required before full access
- profile includes:
  - display name
  - WhatsApp number
  - timezone (required because overseas supported)
  - relationship: student or parent
  - if parent: child name field (optional but recommended)

Requests
- create request with:
  - level (O/A)
  - subject (single subject per request in MVP)
  - optional exam board (Cambridge/Edexcel/Other)
  - goals (free text)
  - availability (days + time windows)
  - preferred start date (optional)
  - timezone (auto from profile, editable)
- see request status updates:
  - new → payment_pending → ready_to_match → matched → active

Package selection
- select 8/12/20 sessions
- view payment instructions (bank transfer)
- optionally upload payment proof

Dashboard
- view:
  - assigned tutor name (and short bio optional)
  - upcoming sessions list
  - next session time (in user timezone)
  - recurring Meet link
  - sessions remaining this month
- reschedule button opens WhatsApp chat with a prefilled message

10.2 tutor requirements (MVP)

Onboarding
- tutor can apply with:
  - subjects (from allowed list)
  - levels they teach (O/A)
  - short bio
  - availability windows
  - timezone (default PKT)
- admin approval required before tutor can be matched

Tutor dashboard
- list upcoming sessions
- open session details (time, student, Meet link)
- after session:
  - mark attendance status (done / no_show_student / no_show_tutor / rescheduled)
  - add short notes (2–8 lines)

10.3 admin requirements (MVP)

Admin request inbox
- list requests
- filter by status (new, payment_pending, ready_to_match, matched, active)
- open request to view all details

Payments
- view payment submissions and proof
- mark payment as paid / rejected
- adjust package start date (if needed)

Matching
- view eligible tutors by:
  - subject
  - level
  - timezone overlap / availability overlap
- assign tutor to request (creates match)
- reassign tutor with history tracking (at least a log entry)

Scheduling
- set recurring schedule:
  - day(s) of week + time
  - start date
- generate sessions for the month (N sessions)
- edit a session time (reschedule)
- mark session status if needed

Meet link
- store and edit recurring Meet link per match

Ops tools (MVP)
- copy-to-WhatsApp message templates with variables filled:
  - payment confirmed
  - tutor assigned + schedule + Meet link
  - 1-hour reminder
  - reschedule confirmation
  - no-show policy reminder

--------------------------------------------------------------------------------

11) system data model (MVP-level)

This is a conceptual model; exact schema is defined in ARCHITECTURE.md.

Entities (minimum)
- User
  - id
  - role(s): student, parent, tutor, admin
  - name
  - email
  - email_verified
  - whatsapp_number
  - timezone
- TutorProfile
  - user_id
  - approved (bool)
  - subjects[]
  - levels[]
  - bio
  - availability_windows[]
- Request
  - id
  - created_by_user_id
  - for_student_name (optional)
  - level
  - subject
  - exam_board (optional)
  - goals (text)
  - availability_windows[]
  - timezone
  - status
- Package
  - id
  - request_id or match_id
  - tier_sessions (8/12/20)
  - start_date
  - end_date
  - sessions_total
  - sessions_used
  - sessions_remaining
  - status (pending, active, expired)
- Payment
  - id
  - user_id
  - package_id
  - amount_pkr
  - method (bank_transfer)
  - proof_url (optional)
  - reference (optional)
  - status (pending, paid, rejected, refunded)
- Match
  - id
  - request_id
  - tutor_user_id
  - status (matched, active, paused, ended)
  - meet_link (recurring)
  - schedule_pattern (days/time)
- Session
  - id
  - match_id
  - scheduled_start_utc
  - scheduled_end_utc
  - status (scheduled, done, rescheduled, no_show_student, no_show_tutor)
  - tutor_notes (text)
  - updated_by (user_id)
- AuditLog (recommended even in MVP-lite)
  - id
  - actor_user_id
  - action (payment_marked_paid, tutor_assigned, session_rescheduled, etc.)
  - entity_type + entity_id
  - timestamp
  - details (json/text)

--------------------------------------------------------------------------------

12) status lifecycle (locked)

12.1 request status
- new
- payment_pending
- ready_to_match
- matched
- active
- paused
- ended

12.2 payment status
- pending
- paid
- rejected
- refunded

12.3 match status
- matched
- active
- paused
- ended

12.4 session status
- scheduled
- done
- rescheduled
- no_show_student
- no_show_tutor

Rule: sessions_remaining decrements only when session status becomes done or no_show_student.

--------------------------------------------------------------------------------

13) out of scope for MVP (do not build)

- SAT / IELTS / TOEFL
- admissions counseling
- group sessions
- tutor-set pricing
- automated payments
- automated WhatsApp messaging via API (optional later)
- advanced analytics dashboards
- full calendar integration / ICS invites (optional later)

--------------------------------------------------------------------------------

14) launch checklist (MVP)

Operational readiness
- approved tutor roster for each subject (minimum 1 per subject; ideally 2 for high-demand subjects)
- bank transfer instructions finalized
- WhatsApp Business number set up
- WhatsApp templates finalized in docs/OPS.md
- reschedule/no-show policy published (in PRODUCT.md and on site)

Product readiness
- student/parent signup works and enforces email verification
- request form works end-to-end
- admin can mark payment paid
- admin can match to tutor
- admin can set schedule and generate sessions
- Meet link shown to student and tutor
- tutor can mark attendance and add notes
- sessions remaining updates correctly for done and student no-show

Quality checks
- create a full test scenario:
  - parent signup → request A Level Math 8 sessions → pay → match → schedule → 2 sessions done → 1 student no-show → check remaining count
- check timezone display for an overseas user (example: US Central)
- verify reschedule cutoff logic is documented and applied in ops workflow (automation optional)

--------------------------------------------------------------------------------

15) definition of done (MVP)

MVP is done when:

- it can onboard a real student/parent
- it can accept payment (manual verification)
- it can match to an approved tutor
- it can generate and manage sessions for the month
- it can run actual tutoring sessions via Meet links
- it tracks attendance and notes
- it reliably updates remaining session counts
- it supports WhatsApp-first operations with templates and a consistent workflow
- it is deployable and usable on web (mobile responsive)

--------------------------------------------------------------------------------

16) risks and mitigations

Risk: WhatsApp operations become chaotic at scale
Mitigation:
- keep platform as record system
- use templates
- keep student-tutor comms mediated by admin in MVP

Risk: overseas timezone scheduling confusion
Mitigation:
- store in UTC
- show in user timezone
- show PKT as secondary (recommended)

Risk: no-shows and reschedules reduce profitability
Mitigation:
- enforce 24-hour reschedule cutoff
- student no-show consumes a session
- send 1-hour reminder consistently

Risk: tutor quality variance
Mitigation:
- admin approval required
- monitor notes and attendance
- maintain backup tutors for high demand subjects

--------------------------------------------------------------------------------

Notes for implementation

- MVP can be implemented with Next.js + Firebase (Auth + Firestore) and deployed to Vercel.
- Exact stack and schema are finalized in ARCHITECTURE.md. If a different backend is chosen, keep the same entities and lifecycles.

End of MVP.md