## Parent epic

Epic E9: student dashboard (P0) — #58

## Objective

Add a "Reschedule via WhatsApp" button to each upcoming session card on the student dashboard — opening a WhatsApp chat with the CorvEd admin number and a pre-filled reschedule message including session details.

---

## Background

From `docs/MVP.md` section 5.1 (reschedule policy):
> "student must request reschedule at least 24 hours before session via WhatsApp"

From `docs/PRODUCT.md` section 7.1 (UX requirements):
> "'reschedule' button opens WhatsApp chat with prefilled message"

From `docs/OPS.md` section 6.9 (reschedule request acknowledgement template):
> "Got it — I can help you reschedule. Please share 2–3 alternate time slots (days + times + your timezone). Note: reschedules are allowed if requested at least 24 hours before class."

---

## Prefilled WhatsApp message

```ts
function buildRescheduleMessage(session: {
  subject: string
  level: string
  scheduledStartUtc: string
  studentTimezone: string
}): string {
  const sessionTime = new Intl.DateTimeFormat('en', {
    timeZone: session.studentTimezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(session.scheduledStartUtc))

  const tzAbbr = new Intl.DateTimeFormat('en', {
    timeZone: session.studentTimezone,
    timeZoneName: 'short',
  }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value ?? ''

  return encodeURIComponent(
    `Hi CorvEd 👋 I'd like to reschedule my session.\n\n` +
    `Subject: ${session.subject} (${session.level})\n` +
    `Current time: ${sessionTime} (${tzAbbr})\n\n` +
    `My available alternate times:\n1. \n2. \n3. \n`
  )
}
```

---

## Button component

```tsx
function RescheduleButton({ session, studentTimezone, whatsappNumber }: ...) {
  const message = buildRescheduleMessage({ ...session, studentTimezone })
  const href = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-green-600 hover:text-green-800"
      aria-label="Reschedule this session via WhatsApp"
    >
      📲 Reschedule
    </a>
  )
}
```

---

## 24-hour warning

If the session starts within 24 hours, show a warning next to the reschedule button:
```
⚠️ Less than 24 hours away — late reschedule may apply policy
```

---

## Acceptance criteria

- [ ] Each upcoming session card has a "Reschedule via WhatsApp" button
- [ ] Button opens WhatsApp with a pre-filled message including: subject, level, current session time (in student TZ)
- [ ] Message format matches `docs/OPS.md` section 6.9 template spirit
- [ ] Warning shown if session is within 24 hours
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` from env used (not hardcoded)
- [ ] Button has `rel="noopener noreferrer"` and `aria-label`

---

## Definition of done

- [ ] `buildRescheduleMessage` utility function exists
- [ ] `RescheduleButton` component exists (can be in `components/dashboards/`)
- [ ] Button embedded on next session card (T9.1) and sessions list (T9.2)
- [ ] 24-hour warning logic implemented

---

## References

- `docs/MVP.md` — section 5.1 (reschedule policy — via WhatsApp, 24 hours minimum)
- `docs/PRODUCT.md` — section 7.1 (UX — reschedule button)
- `docs/OPS.md` — section 6.9 (reschedule request acknowledgement template)
- `docs/ARCHITECTURE.md` — section 10.3 (wa.me link builder)
