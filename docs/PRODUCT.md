# CorvEd Product

Last updated: 2026-02-22  
Owner: Taleef  
MVP scope reference: docs/MVP.md  
Ops reference: docs/OPS.md  
Architecture reference: docs/ARCHITECTURE.md

This document defines the product vision, positioning, and the exact user experience for the MVP. It explains what CorvEd is, who it is for, how it works end-to-end, and what “good” looks like at launch. It is written for builders (engineers/agents) and operators.

Contents
1) product overview
2) target users and use cases
3) value proposition and differentiation
4) service offerings (MVP)
5) user journeys (student/parent, tutor, admin)
6) key product decisions (locked for MVP)
7) experience requirements (UX requirements)
8) pricing and packages (product framing)
9) trust, safety, and quality
10) success metrics (MVP KPIs)
11) out-of-scope (MVP)
12) future roadmap summary (product)

--------------------------------------------------------------------------------

## 1) product overview

CorvEd is a WhatsApp-first, structured tutoring service for O Levels and A Levels students. Students (or parents) submit their needs by subject and availability, CorvEd matches them with a verified teacher, and tutoring runs online via a recurring Google Meet link.

CorvEd is intentionally not an open marketplace at MVP:
- matching is manual
- tutors are approved by the admin
- schedules and remaining sessions are tracked in-platform
- WhatsApp is used for communication, reminders, and rescheduling

The platform’s job:
- reduce friction and confusion for students/parents and teachers
- make scheduling and meeting logistics reliable
- make monthly packages easy to manage and renew
- maintain consistent service quality through structured workflows

--------------------------------------------------------------------------------

## 2) target users and use cases

2.1 primary target users (MVP)
- Pakistan-based O Level and A Level students
- Parents in Pakistan who arrange tutoring for their children
- Overseas students following O/A levels who need tutoring in their timezone

2.2 secondary users
- Tutors (teachers) delivering sessions
- Admin/operator (CorvEd team)

2.3 typical use cases
- student struggling with A Level Chemistry wants weekly 2x sessions
- parent wants O Level Math tutoring for child with exam approaching
- overseas student wants tutoring adjusted to local timezone

--------------------------------------------------------------------------------

## 3) value proposition and differentiation

3.1 core value
- verified teachers (curated supply, not random marketplace)
- fast matching (manual but efficient)
- organized monthly packages (predictable scheduling)
- WhatsApp-first support (low friction in Pakistan)
- centralized “truth”: schedule + Meet link + remaining sessions always available

3.2 what makes CorvEd different from informal tutoring
- standardized policies and expectations
- session tracking (attendance and notes)
- consistent reschedule/no-show enforcement
- continuity through renewals and structured scheduling

--------------------------------------------------------------------------------

## 4) service offerings (MVP)

4.1 levels
- O Levels
- A Levels

4.2 subjects (MVP launch)
- Math
- Physics
- Chemistry
- Biology
- English
- Computer Science
- Pakistan Studies
- Islamiyat
- Urdu

4.3 format
- 1:1 online tutoring only
- 60-minute sessions only
- delivery via Google Meet (recurring link per match)

4.4 what the student/parent receives
- teacher assignment per subject
- fixed weekly schedule (recommended cadence)
- reminders via WhatsApp
- session notes (lightweight) after classes (optional visibility to parent/student in MVP; at minimum stored internally)

--------------------------------------------------------------------------------

## 5) user journeys (end-to-end)

### 5.1 student/parent journey

Step 1: discover
- visits website landing page
- sees subjects + packages
- understands “how it works” and policies

Step 2: create account
- sign up via email/password or Google
- email/password requires email verification before proceeding

Step 3: submit request (single subject)
- select:
  - student vs parent
  - level (O/A)
  - subject
  - timezone
  - availability windows
  - goals (weak areas, target grade, exam date)
  - optional exam board

Step 4: select package and pay
- choose 8 / 12 / 20 sessions per month (per subject)
- view bank transfer instructions
- upload payment proof (optional but recommended)

Step 5: matching + scheduling
- CorvEd matches a verified teacher
- student/parent confirms schedule
- recurring Meet link shared
- sessions are generated for the month

Step 6: ongoing learning
- student attends sessions via Meet link
- tutor marks attendance and adds notes
- student dashboard shows remaining sessions

Step 7: renewal
- near month-end, CorvEd prompts renewal
- payment confirmed
- next month sessions generated

### 5.2 tutor journey

Step 1: application / onboarding
- tutor applies or is pre-added
- submits subjects, levels, availability, bio
- awaits admin approval

Step 2: assignment
- admin assigns tutor to paid student request
- tutor confirms availability
- recurring schedule is set

Step 3: teaching workflow
- tutor sees upcoming sessions in tutor dashboard
- joins via recurring Meet link
- marks attendance + adds notes after each session

Step 4: quality and continuity
- tutor keeps availability updated
- admin monitors punctuality, notes, student satisfaction

### 5.3 admin journey

Step 1: manage leads and requests
- reviews new requests and ensures completeness
- ensures payment is initiated

Step 2: verify payments
- checks bank transfer proof/reference externally
- marks payment “paid” in platform
- activates package

Step 3: match tutor
- filters eligible tutors by subject/level/availability/timezone
- assigns tutor
- records Meet link
- defines schedule pattern
- generates month sessions

Step 4: day-to-day ops
- sends reminders
- handles reschedules (policy-based)
- handles no-shows
- resolves issues and reassigns tutors when needed

Step 5: renewals
- sends renewal reminders
- activates next month packages
- generates next month sessions

--------------------------------------------------------------------------------

## 6) key product decisions (locked for MVP)

These are fixed for MVP to avoid scope creep.

- levels: O Levels + A Levels only
- subjects: fixed list in section 4.2
- 1:1 tutoring only
- 60-minute sessions only
- monthly packages only
- no carryover across months
- packages are per subject
- payment method: bank transfer only (manual verification)
- matching: manual (admin assigns tutor)
- Meet links: one recurring Google Meet link per match
- comms: WhatsApp-first, separate chats (student/admin and tutor/admin)
- students do not directly message tutors by default in MVP
- UI language: English only
- timezone support: overseas supported (timezone-aware display)

--------------------------------------------------------------------------------

## 7) experience requirements (UX requirements)

7.1 must-have UX qualities
- simple, low steps to request tutoring
- clear package selection
- clear “what happens next” after payment
- dashboard always shows:
  - next session time
  - Meet link
  - remaining sessions
  - tutor name

7.2 mobile responsiveness
- MVP must be fully usable on mobile
- primary interactions (Meet link open, WhatsApp reschedule) must work from mobile

7.3 clarity requirements
Every schedule confirmation should include:
- date/time in student timezone
- recurring days/time
- Meet link
- reschedule cutoff policy (24 hours)

7.4 failure mode handling
- if payment pending: dashboard explains “awaiting payment verification”
- if not matched: dashboard explains “matching in progress”
- if Meet link updated: user sees updated link immediately

--------------------------------------------------------------------------------

## 8) pricing and packages (product framing)

8.1 packages
- 8 sessions/month (2x/week)
- 12 sessions/month (3x/week)
- 20 sessions/month (5x/week)

8.2 pricing principles
- priced in PKR
- slightly above average market price to attract better tutors
- consistent pricing per tier (optionally subject-based different pricing later)

8.3 transparency
- show what’s included:
  - verified teacher
  - scheduling support
  - reminders
  - session tracking
- show policy summary (reschedule cutoff, no-show rules)

--------------------------------------------------------------------------------

## 9) trust, safety, and quality

9.1 tutor verification (MVP)
- admin approval required
- tutors can apply, but cannot be assigned until approved
- maintain backups for high-demand subjects

9.2 privacy
- WhatsApp numbers treated as sensitive
- tutor phone numbers not shared with students by default in MVP
- platform stores minimal necessary info

9.3 service reliability
- reminders reduce no-shows
- clear policy enforcement reduces disputes
- fast tutor reassignment if repeated issues occur

--------------------------------------------------------------------------------

## 10) success metrics (MVP KPIs)

MVP is successful if:
- demand:
  - steady inbound leads (weekly growth)
  - lead → paid conversion is acceptable (target evolves; early 15–30% may be healthy)
- retention:
  - meaningful renewals (month 2 retention)
- operational efficiency:
  - admin time per active student does not explode
  - reschedules and disputes remain manageable
- quality:
  - low tutor no-show rate
  - session notes completion rate is high
- reliability:
  - Meet links and schedules rarely fail

Track at minimum:
- # new requests per week
- # paid packages per week
- # active students
- renewal rate
- no-show rates (student and tutor)
- reschedule frequency
- tutor incident counts

--------------------------------------------------------------------------------

## 11) out-of-scope (MVP)

- SAT/IELTS/TOEFL coaching
- admissions counseling
- group classes
- automated payments
- automated WhatsApp messaging via API (optional later)
- student-to-tutor direct chat
- advanced LMS features (quizzes, homework portals, etc.)

--------------------------------------------------------------------------------

## 12) future roadmap summary (product)

Phase 2
- add SAT/IELTS/TOEFL coaching as separate offerings
- introduce tiered tutor categories (standard vs premium)
- introduce basic student ratings and visibility of notes

Phase 3
- add admissions counseling as its own product flow
- add calendar integration for session invites
- introduce WhatsApp API automation if needed
- explore group sessions for standardized subjects

End of PRODUCT.md