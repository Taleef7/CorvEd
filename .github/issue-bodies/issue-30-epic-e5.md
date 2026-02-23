## Goal

Implement the packages and payments system — allowing students/parents to select a monthly package (8, 12, or 20 sessions), view PKR pricing, submit bank transfer payment proof, and for admins to mark payments as paid/rejected and activate packages.

This epic covers the money flow: from package selection to payment verification to activating the request for matching. It is a critical blocker for E7 (matching) and E8 (scheduling), which can only proceed once a payment is confirmed.

---

## Why this matters

CorvEd's revenue model is monthly packages paid by bank transfer. From `docs/MVP.md` section 6:
> "packages are purchased per subject (locked decision). 8/12/20 sessions/month."

From section 7 (payments):
> "student selects package and sees bank transfer instructions. Student submits payment proof. Admin verifies externally and marks payment as paid. Request status transitions to ready_to_match."

Without this epic, the platform has no way to collect revenue or gate access to matching and tutoring.

---

## Stack context

| Layer | Choice |
|-------|--------|
| Package/payment tables | Supabase `packages` + `payments` tables |
| Payment proof | Supabase Storage `payment-proofs` bucket (private) |
| Admin verification | Server Action using service role client |
| Pricing config | Constants file `lib/config/pricing.ts` |

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S5.1 (#31) | Story | As a parent/student, I can select a package (8/12/20) and see PKR pricing | **open** |
| S5.2 (#32) | Story | As an admin, I can mark payment as received and activate the package | **open** |
| T5.1 (#33) | Task | Package model (8/12/20 sessions, monthly) — DB migration | **open** |
| T5.2 (#34) | Task | Pricing config in PKR (admin editable later; hardcode for MVP) | **open** |
| T5.3 (#35) | Task | Payment workflow (manual confirmation MVP) — upload + admin verify | **open** |
| T5.4 (#36) | Task | Student dashboard shows: package type, sessions remaining, month window | **open** |

---

## Package and payment data model (from `docs/ARCHITECTURE.md` section 5.5)

```
packages:
  id, request_id
  tier_sessions (8 | 12 | 20)
  start_date, end_date
  sessions_total, sessions_used
  status (pending | active | expired)

payments:
  id, package_id, payer_user_id
  amount_pkr, method = 'bank_transfer'
  reference (optional), proof_path (optional, storage)
  status (pending | paid | rejected | refunded)
  verified_by_user_id, verified_at
```

---

## Status transitions (E5 scope)

| Entity | From | To | Who | When |
|--------|------|----|-----|------|
| request | `new` | `payment_pending` | student | After package created |
| payment | `pending` | `paid` | admin | After verifying transfer |
| payment | `pending` | `rejected` | admin | If invalid proof |
| package | `pending` | `active` | admin | When payment marked paid |
| request | `payment_pending` | `ready_to_match` | admin | When payment marked paid |

---

## Exit criteria (E5 is done when)

- [ ] Student can select a package (8/12/20) from `/dashboard/packages/new` or linked from request page
- [ ] PKR pricing is shown for each package tier
- [ ] Bank transfer instructions are shown after package selection
- [ ] Student can optionally upload payment proof (screenshot)
- [ ] Admin can view pending payments in `/admin/payments`
- [ ] Admin can mark payment as paid → triggers package activation + request status advance
- [ ] Admin can mark payment as rejected with a note
- [ ] Student's dashboard shows active package with sessions remaining and month window

---

## References

- `docs/ARCHITECTURE.md` — section 5.5 (packages + payments tables), section 6.4 (RLS for packages/payments), section 7 (storage for payment proofs)
- `docs/MVP.md` — section 6 (packages and pricing model), section 7 (payments), section 12.2 (payment status lifecycle)
- `docs/PRODUCT.md` — section 8 (pricing framing), section 5.1 step 4 (select package and pay)
- `docs/OPS.md` — section 4 Workflow B (payment initiation → verified), section 6.4–6.5 (payment templates)
