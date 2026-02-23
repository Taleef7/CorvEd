# CorvEd Ops

Last updated: 2026-02-22  
Owner: Taleef  
Market: Pakistan-first + overseas students  
Primary comms: WhatsApp (WhatsApp Business recommended)  
Platform role: system of record (schedule, status, remaining sessions)  
WhatsApp role: operations channel (confirmations, reminders, reschedules, issue handling)

This document defines the operational playbook for running CorvEd day-to-day. It is written so an operator (you, a family member, or a future assistant) can execute consistently without improvising.

Contents
1) operating principles
2) WhatsApp Business setup (recommended)
3) operating hours and response SLAs
4) standard operating workflows (end-to-end)
5) rescheduling and no-show policy enforcement (how to apply)
6) message templates (copy-paste)
7) WhatsApp labels and quick replies (recommended)
8) escalation and dispute handling
9) tutor quality monitoring
10) overseas students (timezone playbook)
11) admin checklists (daily/weekly/monthly)
12) data hygiene rules (platform vs WhatsApp)
13) privacy and safety basics

--------------------------------------------------------------------------------

## 1) operating principles

1.1 platform is the source of truth
All of the following must be kept accurate in the platform:
- request status
- payment status
- package month window + remaining sessions
- match (tutor assignment)
- schedule (sessions list)
- recurring Google Meet link
- session attendance + tutor notes

WhatsApp is used to communicate and coordinate, but decisions and final state are recorded in the platform.

1.2 keep communication structured
- use templates and quick replies
- avoid long back-and-forth
- confirm in one message: schedule + meet link + policy highlights

1.3 reduce chaos by mediation
In MVP, student ↔ tutor communication is mediated by admin:
- student/parent communicates with admin
- tutor communicates with admin
- admin handles reschedules, complaints, and policy enforcement

1.4 minimize cognitive load
- one request = one subject (MVP)
- one recurring Meet link per match
- monthly packages, no carryover (MVP)
- 60-minute sessions only

--------------------------------------------------------------------------------

## 2) WhatsApp Business setup (recommended)

You can run MVP with standard WhatsApp, but WhatsApp Business makes operations far easier.

2.1 choose setup type
Option A: WhatsApp Business App (recommended for MVP)
- fast to set up
- supports:
  - Business Profile
  - Catalog (optional)
  - Labels
  - Quick replies
  - Greeting & Away messages

Option B: WhatsApp Business API (later)
- true automation (programmatic messages)
- requires:
  - Meta Business verification
  - approved templates
  - often a provider (Twilio / 360dialog / Meta Cloud API)
- do NOT start with API unless you have time; MVP can run well with Business App + copy templates.

2.2 Business Profile (set once)
- business name: CorvEd
- category: Education / Tutoring
- description (short):
  - "O & A Levels 1:1 tutoring (online). Structured packages. Verified teachers. WhatsApp-first support."
- address: optional (if you want to appear local)
- hours: set operating hours (see section 3)
- email: optional (future)
- website: your landing page URL (once deployed)

2.3 WhatsApp Business tools to enable
- labels (see section 7)
- quick replies (templates you can send with /shortcuts)
- greeting message:
  - sends automatically to first-time chats
- away message:
  - sends outside operating hours

2.4 one number policy
Use one primary WhatsApp Business number for operations to avoid splitting context.
If you later hire staff, consider WhatsApp Business Platform or multiple devices.

2.5 device policy
- use WhatsApp Web on desktop for speed
- keep chat naming consistent:
  - "Parent: <Name> | <Level> <Subject>"
  - "Student: <Name> | <Level> <Subject>"
  - "Tutor: <Name> | <Subjects>"

--------------------------------------------------------------------------------

## 3) operating hours and response SLAs

3.1 suggested operating hours (Pakistan)
- Mon–Sat: 12:00 PM – 10:00 PM PKT
- Sun: 2:00 PM – 8:00 PM PKT

3.2 response SLAs
- new inquiries: within 2 hours during operating hours
- active students: within 1 hour during operating hours
- tutors: within 1 hour during operating hours
- reschedule requests:
  - acknowledge within 1 hour, confirm within 6 hours

3.3 after-hours policy
- away message explains response timing
- emergencies:
  - “class starting in <2 hours and link not working” is priority

--------------------------------------------------------------------------------

## 4) standard operating workflows (end-to-end)

This section is the operational source of truth. Follow these steps exactly.

### Workflow A: inbound lead → qualified request

Trigger: someone messages CorvEd or fills website intake form.

Steps:
1) label chat as: lead_new
2) send Quick Reply: lead_intake_questions
3) collect minimum intake:
   - who: student or parent
   - level: O or A
   - subject
   - goal (exam date/weak areas)
   - timezone/city
   - availability windows
4) create or verify account on platform (if they haven’t):
   - ask them to sign up (email verification required)
   - or you can create request after they sign up
5) create request in platform (or confirm the one submitted)
6) label chat: lead_qualified
7) send package pricing and payment instructions

Minimum success condition:
- request exists in platform with correct level, subject, availability, timezone

### Workflow B: payment initiation → payment verified

Trigger: student selects package OR asks how to pay.

Steps:
1) send bank transfer instructions + required details:
   - account title
   - account number/IBAN
   - bank name
   - reference format: "CorvEd | <Name> | <Subject> | <Level>"
2) tell user to send screenshot/reference after transfer
3) once received:
   - label: payment_pending_verification
4) verify externally
5) mark payment as paid in platform
6) confirm via WhatsApp:
   - payment confirmed
   - next: tutor matching + schedule proposal timeline
7) update label: payment_confirmed

Minimum success condition:
- payment status = paid
- package status = active
- request status = ready_to_match

### Workflow C: matching → tutor confirmation

Trigger: request is ready_to_match.

Steps:
1) pick tutor based on subject, level, availability, timezone compatibility
2) message tutor privately:
   - confirm availability
   - confirm they accept student
3) if tutor accepts:
   - create match in platform (assign tutor)
   - add recurring Meet link (or create it)
   - set schedule pattern
4) label tutor chat: tutor_active
5) label student chat: matched_scheduling

Minimum success condition:
- match exists
- meet link exists
- schedule pattern exists

### Workflow D: schedule finalization → sessions generated

Trigger: match exists and schedule pattern is agreed.

Steps:
1) propose 1–2 schedule options to student/parent
2) once confirmed:
   - set schedule pattern in platform
   - generate sessions for month (8/12/20)
3) send confirmation message to both:
   - start date/time
   - recurring days/time
   - Meet link
   - reschedule cutoff
4) move request status to active (platform)
5) label student chat: active_student

Minimum success condition:
- sessions exist for the month
- next session is visible for student and tutor dashboards

### Workflow E: day-of-class operations

Trigger: upcoming session.

Steps:
1) 1-hour reminder (recommended)
   - send to student/parent
   - send to tutor
2) if link issues:
   - confirm Meet link works
   - if needed, generate new link and update match.meet_link in platform
3) after session:
   - tutor marks session status + notes in platform
   - if tutor doesn’t update within 12 hours, admin follows up

Minimum success condition:
- session is marked done (or no-show status) and notes exist

### Workflow F: reschedule request handling

Trigger: student requests reschedule on WhatsApp.

Steps:
1) check timestamp vs session start
2) if >= 24 hours:
   - allow reschedule
   - propose 2 alternative slots
   - confirm with tutor
   - update session time in platform
   - send confirmation with updated time
3) if < 24 hours:
   - apply policy (see section 5)
   - if you grant exception, log it in audit note (platform or Ops log)

Minimum success condition:
- platform session is updated correctly
- policy applied consistently

### Workflow G: tutor no-show handling

Trigger: student says tutor didn’t join.

Steps:
1) verify quickly:
   - check tutor message
   - wait 10 minutes for late join
2) if confirmed tutor no-show:
   - mark session status = no_show_tutor (platform)
   - do NOT decrement sessions remaining
   - reschedule ASAP
3) record incident:
   - internal note in tutor record
4) if repeated:
   - reassign tutor

Minimum success condition:
- student is compensated (session not deducted)
- replacement session scheduled

### Workflow H: month-end renewals

Trigger: package approaching end of month.

Steps:
1) 5 days before end_date:
   - send renewal reminder + package options
2) collect payment
3) create new package for next month (same subject)
4) generate next month sessions
5) confirm schedule continuity

Minimum success condition:
- renewal cashflow captured and schedule uninterrupted

--------------------------------------------------------------------------------

## 5) rescheduling and no-show policy enforcement

Locked MVP policy summary (repeat in confirmations):
- reschedule cutoff: 24 hours
- student no-show: consumes a session (session deducted)
- tutor no-show: does not consume a session (no deduction)

5.1 applying reschedule cutoff
- use scheduled_start_utc in platform and compare with “now”
- communicate in student’s timezone in WhatsApp for clarity
- if overseas, always restate with timezone abbreviation

5.2 student no-show handling
Definition:
- student does not join within 10 minutes of start time and does not respond

Steps:
1) message student at +5 minutes and +10 minutes
2) if still no response:
   - mark session = no_show_student
   - sessions remaining decremented by platform logic
3) send follow-up message:
   - politely note no-show and policy

5.3 tutor no-show handling
Definition:
- tutor does not join within 10 minutes of start time

Steps:
1) message tutor at +5 minutes and +10 minutes
2) if no response:
   - mark session = no_show_tutor
   - do not decrement sessions
3) send apology + reschedule options

5.4 exceptions
You may allow exceptions for:
- medical emergency
- verified power/internet outages
- first-time student who made a genuine mistake

When granting an exception:
- do it consistently
- record it:
  - add an internal admin note and/or audit log entry

--------------------------------------------------------------------------------

## 6) message templates (copy-paste)

Templates are written to be used with WhatsApp Business quick replies.
Replace placeholders in <angle brackets>.

### 6.1 greeting message (WhatsApp Business auto-greeting)
Hello! Welcome to CorvEd 👋  
We provide 1:1 online tutoring for O Levels and A Levels with verified teachers.  
To get started, please share:
1) Student or Parent?
2) Level (O / A)
3) Subject
4) City + Timezone
5) Availability (days + times)
6) Your goal (exam date or weak areas)

### 6.2 lead intake (quick reply: /intake)
To match you with the right teacher, please reply with:
1) Student or Parent?  
2) Level: O Levels or A Levels  
3) Subject: <Math/Physics/Chemistry/Biology/English/CS/Pak Studies/Islamiyat/Urdu>  
4) Exam board (Cambridge/Edexcel/Other) (optional)  
5) Your availability (days + time windows) + your timezone  
6) Goal (target grade, weak topics, exam date)

### 6.3 package options (quick reply: /packages)
We offer monthly packages per subject (60-minute sessions):
- 8 sessions/month (2x per week)
- 12 sessions/month (3x per week)
- 20 sessions/month (5x per week)

Share your preferred package and we’ll send payment details.

### 6.4 payment instructions (quick reply: /paybank)
Bank transfer details:
Account Title: <...>  
Bank: <...>  
Account/IBAN: <...>

Please use this reference in your transfer:
CorvEd | <StudentName> | <Level> <Subject>

After payment, send a screenshot or transaction reference here and we’ll confirm.

### 6.5 payment confirmed (quick reply: /paid)
Payment received ✅ Thank you.  
Next step: we’ll match you with a verified <Subject> teacher and confirm your schedule shortly.

To finalize scheduling, please confirm:
- preferred days/times (with timezone)
- start date (if any preference)

### 6.6 tutor availability check (message to tutor)
Hi <TutorName>, I hope you’re well.  
We have a new <Level> <Subject> student. Are you available for:
Option 1: <Day> <Time> <TZ>  
Option 2: <Day> <Time> <TZ>

If yes, please confirm which option works. If not, share 2–3 available slots.

### 6.7 match confirmed to student (quick reply: /matched)
You’re matched ✅  
Teacher: <TutorName>  
Schedule: <Days> at <Time> (<StudentTZ>)  
Session duration: 60 minutes  
Google Meet link (recurring): <MeetLink>

Reschedule policy: please request reschedules at least 24 hours before the class time.

### 6.8 first session reminder (1 hour before) (quick reply: /rem1h)
Reminder ⏰ Your class starts in 1 hour:
<Level> <Subject> with <TutorName>  
Time: <Time> (<TZ>)  
Meet link: <MeetLink>

### 6.9 reschedule request acknowledgement
Got it — I can help you reschedule.  
Please share 2–3 alternate time slots (days + times + your timezone).  
Note: reschedules are allowed if requested at least 24 hours before class.

### 6.10 reschedule confirmed
Reschedule confirmed ✅  
New time: <Day> <Time> (<TZ>)  
Meet link (same): <MeetLink>

### 6.11 late join follow-up (to student at +5 minutes)
Hi <Name>, your class started at <Time>. Are you joining?  
Meet link: <MeetLink>

### 6.12 student no-show policy notice
Hi <Name>, we waited 10 minutes and couldn’t connect today.  
As per our policy, a no-show counts as a used session.  
If you’d like, share your availability and we’ll continue with the remaining sessions.

### 6.13 tutor no-show apology
Hi <Name>, we’re sorry — the teacher could not join today.  
This session will not be deducted.  
Please share 2–3 alternate slots and we’ll reschedule immediately.

### 6.14 renewal reminder (5 days before month end)
Your monthly package is ending soon.  
Would you like to renew for next month for <Subject>?

Packages:
- 8 sessions
- 12 sessions
- 20 sessions

Reply with your package choice and we’ll share payment details.

--------------------------------------------------------------------------------

## 7) WhatsApp labels and quick replies (recommended)

7.1 labels (WhatsApp Business)
- lead_new
- lead_qualified
- payment_pending_verification
- payment_confirmed
- matched_scheduling
- active_student
- reschedule_in_progress
- issue_attention
- renewal_due
- tutor_pending
- tutor_active
- tutor_issue

7.2 suggested quick replies
- /intake → lead intake questions
- /packages → package options
- /paybank → bank transfer instructions
- /paid → payment confirmed
- /matched → match confirmed with schedule + link
- /rem1h → 1-hour reminder
- /resched → reschedule instructions
- /renew → renewal reminder

--------------------------------------------------------------------------------

## 8) escalation and dispute handling

8.1 escalation categories
- scheduling conflict
- repeated student no-shows
- repeated tutor lateness/no-shows
- quality complaint (teacher behavior, teaching quality)
- payment dispute

8.2 escalation playbook
- acknowledge immediately
- collect facts (screenshots, times, what happened)
- reference policy neutrally
- offer resolution options:
  - reschedule
  - credit session (rare; admin discretion)
  - tutor reassignment
- record outcome in platform (note/audit)

8.3 dispute resolution guideline
- prioritize long-term trust
- keep exceptions rare, document them
- if unsure, prefer a one-time goodwill credit and a clear warning for next time

--------------------------------------------------------------------------------

## 9) tutor quality monitoring

Track:
- punctuality (late joins)
- no-shows
- session notes completeness
- student feedback (optional MVP)
- renewal/retention for that tutor’s students

Operational rule:
- if a tutor has 2 incidents in a month:
  - warning + closer monitoring
- if 3 incidents:
  - pause assignments and consider replacement

--------------------------------------------------------------------------------

## 10) overseas students (timezone playbook)

10.1 always include timezone explicitly
When confirming schedules, always state:
- <Time> (<TZ>)
Example:
- 7:00 PM (PKT) / 9:00 AM (CST)

10.2 store and confirm timezone at intake
Ask explicitly:
- “What timezone are you in?”

10.3 reminders
Send reminders in the student’s timezone language:
- “Your class starts in 1 hour at <Time> (<TZ>)”

--------------------------------------------------------------------------------

## 11) admin checklists

Daily (15–30 minutes)
- check new leads and send intake
- check payment pending verifications
- check upcoming sessions within 24 hours
- send 1-hour reminders (or ensure they’re scheduled)
- check tutors submitted session notes for yesterday

Weekly (30–60 minutes)
- review incidents: no-shows, complaints
- review tutor performance
- ensure backup tutors exist for high-demand subjects
- update pricing if needed (rare)

Monthly
- send renewal reminders
- reconcile payments vs packages
- refresh tutor availability schedules
- update templates if any recurring confusion is seen

--------------------------------------------------------------------------------

## 12) data hygiene rules (platform vs WhatsApp)

Rules:
- do not rely on WhatsApp messages as “official record”
- after any operational decision, update platform:
  - payment status
  - match assignment
  - schedule change
  - session status
- WhatsApp should reference platform truth (schedule and Meet link)

--------------------------------------------------------------------------------

## 13) privacy and safety basics

- treat WhatsApp numbers as sensitive
- do not share tutor personal numbers with students in MVP
- do not share student personal details beyond what tutor needs (name + level + subject + schedule)
- if tutoring minors:
  - keep admin mediation for safety
  - avoid direct student-tutor chats at MVP stage

End of OPS.md