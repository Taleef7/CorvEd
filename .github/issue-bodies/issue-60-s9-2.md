## Parent epic

Epic E9: student dashboard (P0) — #58

## User story

**As a parent or student**, I can see how many sessions I have remaining in my current monthly package — so I know when to renew and can plan my study schedule.

---

## Background

From `docs/MVP.md` section 10.1 (student dashboard):
> "view: sessions remaining this month"

From `docs/PRODUCT.md` section 7.1 (UX requirements):
> "dashboard always shows: remaining sessions"

From `docs/OPS.md` section 4 Workflow H (month-end renewals):
> "5 days before end_date: send renewal reminder + package options"

Students need visibility on their sessions remaining to know when to renew before their package expires.

---

## Acceptance criteria

- [ ] Student dashboard shows a package summary card (from E5 T5.4 #36)
- [ ] Sessions remaining are displayed prominently: "9 of 12 sessions remaining"
- [ ] Progress bar shows sessions used vs total
- [ ] Package month window shown: "Feb 1, 2026 – Feb 28, 2026"
- [ ] If less than 3 sessions remaining, show a renewal alert: "⚠️ Only 2 sessions left! Renew to continue."
- [ ] If package expired, show: "Your package has ended. Contact us on WhatsApp to renew."
- [ ] Sessions remaining auto-updates when a session is marked done (real-time or on page reload)

---

## Renewal alert thresholds

| Remaining sessions | Message |
|-------------------|---------|
| > 3 | Normal (no alert) |
| 1–3 | "⚠️ Only X sessions left. Renew soon to avoid gaps." |
| 0 | "Your sessions are used up. Renew to continue." |
| Package expired | "Package ended [date]. Contact us to renew." |

---

## Dependencies

- **E5 T5.1 (#33)** — packages table must exist
- **E5 T5.4 (#36)** — PackageSummary component

---

## References

- `docs/MVP.md` — section 10.1 (student dashboard — sessions remaining), section 6 (packages model)
- `docs/OPS.md` — section 4 Workflow H (renewal reminders), section 6.14 (renewal reminder template)
