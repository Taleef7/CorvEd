## Goal

Implement the WhatsApp-first operational tooling within the platform — making it fast and error-free for the admin to send standard communications (confirmations, reminders, package info, reschedule confirmations) by providing copy-message buttons and `wa.me` deep links with pre-filled templates.

---

## Why this matters

From `docs/OPS.md` section 1.2:
> "use templates and quick replies. Avoid long back-and-forth. Confirm in one message: schedule + meet link + policy highlights."

From `docs/MVP.md` section 8.1:
> "Primary comms: WhatsApp. Students do not message tutors directly in MVP — admin mediates."

The admin sends dozens of WhatsApp messages per week. Each one should be a button click, not manual typing. This epic reduces admin cognitive load and ensures consistent, policy-compliant communication.

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S11.1 (#72) | Story | As a student/tutor, I receive WhatsApp confirmations and reminders | **open** |
| S11.2 (#73) | Story | As an admin, I can send standard templates quickly | **open** |
| T11.1 (#74) | Task | WhatsApp message templates in platform constants | **open** |
| T11.2 (#75) | Task | Platform "copy message" buttons with filled variables | **open** |
| T11.3 (#76) | Task | Click-to-WhatsApp deep links (wa.me) with prefilled text | **open** |

---

## Template categories (from `docs/OPS.md` section 6)

| Template | When used |
|----------|-----------|
| Greeting / intake | New lead arrives |
| Package options | Student asks about pricing |
| Bank transfer instructions | Payment step |
| Payment confirmed | After admin marks paid |
| Matched + schedule | After match + sessions created |
| 1-hour reminder | Before each session |
| Session link | If student asks for link |
| Reschedule acknowledgement | Student requests reschedule |
| Reschedule confirmation | After admin updates in platform |
| Late reschedule (policy) | Within 24-hour window |
| Renewal reminder | 5 days before package end |
| Tutor no-show | Compensation message |

---

## Exit criteria (E11 is done when)

- [ ] All templates from `docs/OPS.md` section 6 are coded as constants in the platform
- [ ] Admin sees "Copy message" buttons on key admin pages (matches, payments, sessions)
- [ ] Admin can click a "Open WhatsApp" button that opens wa.me with the relevant pre-filled message
- [ ] Templates have variable placeholders filled from database data (student name, tutor name, subject, time, Meet link)

---

## References

- `docs/OPS.md` — section 6 (all message templates), section 4 (when each template is used), section 7 (WhatsApp quick replies)
- `docs/MVP.md` — section 8 (WhatsApp-first ops), section 8.1 (wa.me deep links)
- `docs/ARCHITECTURE.md` — section 10 (operational tooling — templates + deep links)
