## Goal

Implement foundational platform trust, safety, and reliability features: a public policies page (reschedule, no-show, refund), a tutor code of conduct, an admin audit log view, and a minimal operational analytics dashboard (active students, upcoming/missed sessions).

---

## Why this matters

From `docs/MVP.md` section 11 (policies and quality):
> "policies are non-negotiable for student trust and legal clarity. Publish and reference in all confirmation messages."

From `docs/PRODUCT.md` section 9 (trust and safety):
> "verified teachers, clear policies, admin-mediated communication"

From `docs/OPS.md` section 13 (privacy and safety basics):
> "maintain basic incident log. Do not share student data with tutors (and vice versa) beyond what is necessary."

These features reduce legal risk, build user trust, and give the admin operational visibility.

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| T12.1 (#78) | Task | Terms/policies page (reschedule/no-show/refunds) | **open** |
| T12.2 (#79) | Task | Basic tutor code of conduct | **open** |
| T12.3 (#80) | Task | Basic admin audit log view | **open** |
| T12.4 (#81) | Task | Minimal analytics: active students, upcoming sessions, missed sessions | **open** |

---

## Policies (MVP locked — from `docs/MVP.md` section 5)

| Policy | Rule |
|--------|------|
| Reschedule | Must request at least 24 hours in advance via WhatsApp |
| Student no-show | Session is deducted from package |
| Tutor no-show | Session is NOT deducted; admin reschedules |
| Refunds | No carryover between months; refund policy TBD (admin discretion for now) |
| Package expiry | Sessions expire at `end_date`; no carryover |

---

## Exit criteria (E12 is done when)

- [ ] Public policies page exists at `/policies` with locked MVP policies
- [ ] Tutor code of conduct exists (inline on tutor profile or separate page)
- [ ] Admin audit log page at `/admin/audit` shows recent audit events
- [ ] Admin analytics page at `/admin/analytics` shows: active students, upcoming sessions in next 7 days, missed sessions in last 7 days
- [ ] No PII is exposed in audit log views beyond what's necessary

---

## References

- `docs/MVP.md` — section 5 (policies — locked), section 11 (policies + quality), section 13 (privacy)
- `docs/PRODUCT.md` — section 9 (trust and safety — policies)
- `docs/OPS.md` — section 5 (no-show policy enforcement), section 8 (escalation), section 9 (tutor quality monitoring), section 13 (privacy basics)
