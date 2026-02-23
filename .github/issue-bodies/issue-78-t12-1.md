## Parent epic

Epic E12: policies, safety, and reliability (P0) — #77

## Objective

Create a public-facing policies page at `/policies` that clearly states CorvEd's reschedule policy, no-show policy, refund policy, and package terms — so that students and parents have a single reference point for the rules, and the admin can point to it during disputes.

---

## Background

From `docs/MVP.md` section 5 (policies — locked MVP decisions):
> "Reschedule cutoff: 24 hours before session start. Must request via WhatsApp."
> "Student no-show: session counted as used."
> "Tutor no-show: session not counted."
> "Sessions expire at package end_date. No carryover between months."

From `docs/PRODUCT.md` section 9:
> "clear policies displayed upfront — trust built through transparency"

From `docs/OPS.md` section 5.4 (exceptions):
> "exceptions may be granted for: medical emergency, verified power/internet outages, first-time mistake. Must be logged."

---

## Page: `app/policies/page.tsx`

This is a static server component with no auth required.

### Sections

#### 1. Reschedule Policy
- Must request via WhatsApp at least **24 hours** before the scheduled session time
- Provide 2–3 alternate time slots with your timezone when requesting
- Late reschedule requests (< 24 hours) may be treated as a no-show at admin discretion
- Exception criteria: medical emergency, verified power/internet outage, genuine first-time mistake

#### 2. No-Show Policy
| Scenario | Effect on sessions |
|----------|-------------------|
| Student no-show | 1 session deducted from package |
| Tutor no-show | 0 sessions deducted; reschedule arranged immediately |
| Late join (student, > 10 min) | Treated as no-show |
| Late join (tutor, > 10 min) | Tutor no-show procedure begins |

#### 3. Refund and Expiry Policy
- Monthly packages expire at the `end_date` (30 days from activation)
- **No session carryover** between months (locked MVP decision)
- Refund requests are considered at admin discretion — contact via WhatsApp
- If CorvEd cancels or cannot deliver sessions: sessions are credited or refunded

#### 4. Package Terms
- Packages are per subject (one package = one subject for one month)
- 60-minute sessions via Google Meet
- Sessions are with the assigned tutor — substitutions are handled by admin if needed
- Admin mediates all communication between student and tutor

#### 5. Privacy
- Your contact details are used only for tutoring coordination
- Tutors do not receive student contact information (admin mediates)
- Session notes are visible to the student, tutor, and admin

---

## Acceptance criteria

- [ ] `/policies` page exists as a public route (no auth required)
- [ ] Page covers: reschedule policy, no-show policy, refund/expiry policy, package terms, privacy basics
- [ ] Page is linked from the landing page footer (`app/page.tsx` — E2 T2.1)
- [ ] All policies match the locked MVP decisions from `docs/MVP.md` section 5
- [ ] No placeholder text in production
- [ ] Page is mobile-responsive

---

## Definition of done

- [ ] `app/policies/page.tsx` exists with all 5 policy sections
- [ ] No auth required (public route)
- [ ] Landing page footer links to `/policies`
- [ ] Content matches `docs/MVP.md` section 5 exactly

---

## References

- `docs/MVP.md` — section 5 (policies — locked), section 12.4 (session status — no-show)
- `docs/PRODUCT.md` — section 9 (trust and safety)
- `docs/OPS.md` — section 5 (no-show enforcement), section 5.4 (exceptions), section 13 (privacy basics)
