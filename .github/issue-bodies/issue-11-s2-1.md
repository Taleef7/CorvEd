## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## User story

**As a parent or student**, I can visit the CorvEd website and immediately understand:
- what subjects and levels are offered
- what the monthly package options and pricing tiers look like
- how the tutoring service works end-to-end
- what the reschedule and no-show policies are

…so that I can make an informed decision about whether to enrol.

---

## Background

This is the top-of-funnel experience. Before a visitor submits a lead or creates an account, they need to trust the service. In Pakistan, tutoring decisions often involve parents — not just students — so the page must communicate value, structure, and reliability clearly.

From `docs/PRODUCT.md` section 7.1, the landing page must show:
- next session time + Meet link (post-enrolment) — not applicable here, but the **landing page must show what students will receive**
- package tiers and what's included
- policy summary (reschedule cutoff, no-show rules)

From `docs/OPS.md` section 6.3, the message template for package options is:

> "We offer monthly packages per subject (60-minute sessions): 8 sessions/month (2x per week), 12 sessions/month (3x per week), 20 sessions/month (5x per week)"

This template informs exactly what the pricing section of the landing page should communicate.

---

## Acceptance criteria

- [ ] **Hero section** is present with a clear headline describing the service (e.g., "1:1 Online Tutoring for O Levels and A Levels")
- [ ] **Subjects list** displays all 9 MVP subjects: Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, Urdu — for both O Levels and A Levels
- [ ] **Packages section** shows all three tiers (8 / 12 / 20 sessions/month) with:
  - session frequency description (2x / 3x / 5x per week)
  - note that packages are per subject
  - PKR pricing placeholder (or real prices once confirmed)
- [ ] **How it works** section explains the 4-step flow: request → payment → tutor match → sessions
- [ ] **Policy summary** is present and explains:
  - 24-hour reschedule cutoff
  - student no-show = session deducted
  - tutor no-show = session not deducted
- [ ] Page is **fully mobile-responsive** (375px minimum width)
- [ ] No placeholder text (e.g., "Lorem ipsum") is visible in production

---

## UI wireframe (text description)

```
[Hero]
  Headline: "Structured 1:1 Online Tutoring for O Levels and A Levels"
  Sub: "Verified teachers. Fixed schedules. Google Meet. WhatsApp support."
  CTA button: "Get Started" → scrolls to intake form

[How it Works]
  Step 1: Submit your request (level + subject + availability)
  Step 2: Pay for your monthly package (bank transfer)
  Step 3: Get matched with a verified teacher
  Step 4: Start your sessions (recurring Meet link + reminders)

[Subjects]
  O Levels: Math | Physics | Chemistry | Biology | English | CS | Pak Studies | Islamiyat | Urdu
  A Levels: Math | Physics | Chemistry | Biology | English | CS | Pak Studies | Islamiyat | Urdu

[Packages]
  8 sessions/month   — 2x/week  — PKR [price]
  12 sessions/month  — 3x/week  — PKR [price]
  20 sessions/month  — 5x/week  — PKR [price]
  Note: "Packages are per subject. 60-minute sessions. Online via Google Meet."

[Policy Summary]
  - Reschedule: request at least 24 hours before class
  - Student no-show: session is counted as used
  - Tutor no-show: session is not deducted — we reschedule immediately

[Intake Form]  ← S2.2

[WhatsApp CTA]  ← T2.4

[FAQ]
[Footer]
```

---

## Implementation notes

- **File to create/update**: `app/page.tsx`
- Use Tailwind CSS for styling
- No authentication required for this story — page is fully public
- Pricing values can be placeholder (`PKR —` or `TBD`) until confirmed; they should be easy to update from a config or constants file (see T5.2 for pricing config)
- The "How it works" section aligns with `docs/PRODUCT.md` section 5.1 (student/parent journey steps 1–6)

---

## Dependencies

- **E1 (T1.1 #6)** — Next.js scaffold and `app/page.tsx` stub must exist
- **T2.1 (#13)** — implements this story's UI sections

---

## References

- `docs/PRODUCT.md` — section 4 (service offerings), section 5.1 (student journey), section 7 (UX requirements), section 8 (pricing framing)
- `docs/MVP.md` — section 4 (subjects, levels, format), section 5 (session policies), section 6 (packages and pricing model)
- `docs/OPS.md` — section 6.3 (/packages message template)
- `docs/ROADMAP.md` — Phase 0 (concierge validation — landing page deliverable)
