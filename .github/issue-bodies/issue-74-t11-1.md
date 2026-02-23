## Parent epic

Epic E11: WhatsApp-first operations (P0) — #71

## Objective

Create a `lib/whatsapp/templates.ts` file containing all standard WhatsApp message templates from `docs/OPS.md` section 6 as typed functions that accept variables and return a complete message string — ready to copy or use in a `wa.me` link.

---

## Background

From `docs/ARCHITECTURE.md` section 10.1:
> "templates are authored and maintained in docs/OPS.md. App can embed templates as constants or store in DB later."

Having templates in a typed module means:
- No manual copy-paste errors
- Variables are type-checked (TypeScript)
- Templates can be tested
- Admin UI just calls the function and passes DB data

---

## Template module: `lib/whatsapp/templates.ts`

```ts
// All 14 standard templates from docs/OPS.md section 6

export const templates = {

  // 6.1 Greeting (auto-greeting in WhatsApp Business)
  greeting: () =>
    `Hello! Welcome to CorvEd 👋\n` +
    `We provide 1:1 online tutoring for O Levels and A Levels with verified teachers.\n` +
    `To get started, please share:\n` +
    `1) Student or Parent?\n2) Level (O / A)\n3) Subject\n` +
    `4) City + Timezone\n5) Availability (days + times)\n6) Your goal (exam date or weak areas)`,

  // 6.2 Lead intake
  intake: () =>
    `To match you with the right teacher, please reply with:\n` +
    `1) Student or Parent?\n` +
    `2) Level: O Levels or A Levels\n` +
    `3) Subject: Math/Physics/Chemistry/Biology/English/CS/Pak Studies/Islamiyat/Urdu\n` +
    `4) Exam board (Cambridge/Edexcel/Other) (optional)\n` +
    `5) Your availability (days + time windows) + your timezone\n` +
    `6) Goal (target grade, weak topics, exam date)`,

  // 6.3 Package options
  packages: () =>
    `We offer monthly packages per subject (60-minute sessions):\n` +
    `- 8 sessions/month (~2x per week)\n` +
    `- 12 sessions/month (~3x per week)\n` +
    `- 20 sessions/month (~5x per week)\n\n` +
    `Share your preferred package and we'll send payment details.`,

  // 6.4 Payment instructions
  paybank: (p: {
    accountTitle: string
    bank: string
    accountNumber: string
    studentName: string
    level: string
    subject: string
  }) =>
    `Bank transfer details:\n` +
    `Account Title: ${p.accountTitle}\n` +
    `Bank: ${p.bank}\n` +
    `Account/IBAN: ${p.accountNumber}\n\n` +
    `Reference: CorvEd | ${p.studentName} | ${p.level} ${p.subject}\n\n` +
    `After payment, send a screenshot or transaction reference and we'll confirm.`,

  // 6.5 Payment confirmed
  paid: (p: { subject: string }) =>
    `Payment received ✅ Thank you.\n` +
    `Next step: we'll match you with a verified ${p.subject} teacher and confirm your schedule shortly.\n\n` +
    `To finalize scheduling, please confirm:\n- preferred days/times (with timezone)\n- start date (if any preference)`,

  // 6.6 Tutor availability check
  tutorAvailCheck: (p: {
    tutorName: string; level: string; subject: string
    slot1: string; slot2: string
  }) =>
    `Hi ${p.tutorName}, I hope you're well.\n` +
    `We have a new ${p.level} ${p.subject} student. Are you available for:\n` +
    `Option 1: ${p.slot1}\nOption 2: ${p.slot2}\n\n` +
    `If yes, please confirm which option works. If not, share 2–3 available slots.`,

  // 6.7 Match confirmed to student
  matched: (p: {
    tutorName: string; days: string; time: string; tz: string; meetLink: string
  }) =>
    `You're matched ✅\n` +
    `Teacher: ${p.tutorName}\n` +
    `Schedule: ${p.days} at ${p.time} (${p.tz})\n` +
    `Session duration: 60 minutes\n` +
    `Google Meet link (recurring): ${p.meetLink}\n\n` +
    `Reschedule policy: please request reschedules at least 24 hours before the class time.`,

  // 6.8 1-hour reminder
  rem1h: (p: {
    level: string; subject: string; tutorName: string; time: string; tz: string; meetLink: string
  }) =>
    `Reminder ⏰ Your class starts in 1 hour:\n` +
    `${p.level} ${p.subject} with ${p.tutorName}\n` +
    `Time: ${p.time} (${p.tz})\n` +
    `Meet link: ${p.meetLink}`,

  // 6.9 Reschedule request acknowledgement
  reschedAck: () =>
    `Got it — I can help you reschedule.\n` +
    `Please share 2–3 alternate time slots (days + times + your timezone).\n` +
    `Note: reschedules are allowed if requested at least 24 hours before class.`,

  // 6.10 Reschedule confirmed
  reschedConfirmed: (p: { day: string; time: string; tz: string; meetLink: string }) =>
    `Reschedule confirmed ✅\n` +
    `New time: ${p.day} at ${p.time} (${p.tz})\n` +
    `Meet link (same): ${p.meetLink}`,

  // 6.11 Late join follow-up
  lateJoin: (p: { name: string; time: string; meetLink: string }) =>
    `Hi ${p.name}, your class started at ${p.time}. Are you joining?\nMeet link: ${p.meetLink}`,

  // 6.12 Student no-show policy notice
  studentNoShow: (p: { name: string; time: string }) =>
    `Hi ${p.name}, we waited 10 minutes and couldn't connect at ${p.time}.\n` +
    `As per our policy, a no-show counts as a used session.\n` +
    `If you'd like, share your availability and we'll continue with the remaining sessions.`,

  // 6.13 Tutor no-show apology
  tutorNoShow: (p: { name: string }) =>
    `Hi ${p.name}, we're sorry — the teacher could not join today.\n` +
    `This session will not be deducted.\n` +
    `Please share 2–3 alternate slots and we'll reschedule immediately.`,

  // 6.14 Renewal reminder
  renewalReminder: (p: { subject: string }) =>
    `Your monthly package is ending soon.\n` +
    `Would you like to renew for next month for ${p.subject}?\n\n` +
    `Packages:\n- 8 sessions\n- 12 sessions\n- 20 sessions\n\n` +
    `Reply with your package choice and we'll share payment details.`,
}
```

---

## Acceptance criteria

- [ ] `lib/whatsapp/templates.ts` exists with all 14 templates
- [ ] Each template is a typed function (TypeScript)
- [ ] Templates accept only the variables they need (no extra params)
- [ ] Template output matches the wording in `docs/OPS.md` section 6 exactly
- [ ] Module is importable and usable in admin page Server Components and client components

---

## Definition of done

- [ ] `lib/whatsapp/templates.ts` exists with all 14 template functions
- [ ] No typos or missing placeholders
- [ ] TypeScript compiles without errors

---

## References

- `docs/OPS.md` — section 6.1–6.14 (all message templates, exact wording)
- `docs/ARCHITECTURE.md` — section 10.1 (template storage strategy)
