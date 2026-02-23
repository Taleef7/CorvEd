## Parent epic

Epic E5: packages and payments (P0) — #30

## User story

**As a parent or student**, I can choose between three monthly package tiers (8, 12, or 20 sessions per month), see the PKR pricing for each, and proceed to pay — so that I can start the process of being matched with a verified teacher.

---

## Background

From `docs/MVP.md` section 6.1:
> "8 sessions/month (typical: 2 sessions/week). 12 sessions/month (typical: 3 sessions/week). 20 sessions/month (typical: 5 sessions/week)."

From section 6.2:
> "packages are purchased per subject (locked decision)"

From `docs/PRODUCT.md` section 8.3 (transparency):
> "show what's included: verified teacher, scheduling support, reminders, session tracking. Show policy summary (reschedule cutoff, no-show rules)."

---

## Acceptance criteria

- [ ] Package selection page exists at `app/dashboard/packages/new` or linked from request detail page
- [ ] Three package cards are displayed for selection:
  - 8 sessions/month — ~2x/week — PKR [price]
  - 12 sessions/month — ~3x/week — PKR [price]
  - 20 sessions/month — ~5x/week — PKR [price]
- [ ] Each card shows: sessions count, typical frequency, price in PKR, "60-minute sessions, per subject"
- [ ] Selecting a card and submitting creates a `packages` row with `status = 'pending'`
- [ ] After package creation, request status advances to `payment_pending`
- [ ] User is shown bank transfer instructions on the next screen (see T5.3)
- [ ] A note is shown: "Packages are per subject — one package covers one subject for the month"
- [ ] Policy summary shown: "Unused sessions do not carry over to the next month"

---

## Package cards UI

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  8 Sessions     │  │  12 Sessions    │  │  20 Sessions    │
│  ~2x per week   │  │  ~3x per week   │  │  ~5x per week   │
│  PKR 8,000      │  │  PKR 11,000     │  │  PKR 16,000     │
│  [Select]       │  │  [Select]       │  │  [Select]       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
All sessions: 60 minutes | Per subject | No carryover
```

(Prices are illustrative — set from `lib/config/pricing.ts`, see T5.2)

---

## Implementation notes

- **File**: `app/dashboard/packages/new/page.tsx` (or inline on request page)
- On selection and confirmation: insert into `packages` table, then update `requests.status = 'payment_pending'`
- Use a Server Action or API route to perform both inserts atomically
- `start_date` = today, `end_date` = today + 30 days (or end of current month, admin can adjust)
- `sessions_total` = `tier_sessions`
- `sessions_used` = 0 initially

---

## Dependencies

- **T5.1 (#33)** — `packages` table must exist
- **T5.2 (#34)** — pricing constants must be available
- **T4.3 (#29)** — request status lifecycle (E4) — `new → payment_pending` transition

---

## References

- `docs/MVP.md` — section 6 (packages and pricing model), section 12.2 (payment status)
- `docs/PRODUCT.md` — section 8 (pricing framing + transparency)
- `docs/ARCHITECTURE.md` — section 5.5 (packages table schema), section 8.2 (request creation workflow)
