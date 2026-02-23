## Parent epic

Epic E4: student/parent intake flow (P0) — #24

## Objective

Implement and enforce the request status lifecycle (`new → payment_pending → ready_to_match → matched → active → paused → ended`) by creating the Supabase-side transition logic, UI status badges, and the status-aware views on the student dashboard.

---

## Background

From `docs/MVP.md` section 12.1 (request status — locked):
```
new → payment_pending → ready_to_match → matched → active → paused → ended
```

From `docs/ARCHITECTURE.md` section 8.2 (request creation workflow):
> "request.new → request.payment_pending immediately after package/payment creation"
> "after admin marks payment paid: payment.pending → payment.paid, package.pending → package.active, request.payment_pending → request.ready_to_match"
> "admin creates match → request.ready_to_match → request.matched"
> "admin sets schedule → request.matched → request.active"

These transitions happen across multiple epics (E4, E5, E7, E8). This task establishes the **contract** — the allowed transitions and who can trigger them — so that each subsequent epic implements its part correctly.

---

## Status transition table

| From status | To status | Who triggers | When |
|-------------|-----------|--------------|------|
| `new` | `payment_pending` | student/parent | After selecting a package (E5) |
| `payment_pending` | `ready_to_match` | admin | After marking payment as paid (E5) |
| `ready_to_match` | `matched` | admin | After assigning a tutor (E7) |
| `matched` | `active` | admin | After generating sessions (E8) |
| `active` | `paused` | admin | Operational pause |
| `active` / `paused` | `ended` | admin | Package expired or student stopped |

**Constraint**: Students can only update requests when status is `new` or `payment_pending` (enforced by RLS — see T4.1 migration).

---

## Implementation for E4 scope

For this epic (E4), implement:

1. **Status badges** in the request detail page (T4.2 #28) — colour-coded per status
2. **Transition: `new → payment_pending`** — triggered when user selects a package (link to E5)
3. **Status display on the dashboard** — student sees current status of all their requests

The other transitions (`ready_to_match`, `matched`, `active`) are implemented in E5, E7, E8 respectively.

---

## Student requests list on dashboard

The student dashboard (`app/dashboard/page.tsx` or a dedicated route) should show a list of the user's requests with current status:

```tsx
const { data: requests } = await supabase
  .from('requests')
  .select('id, level, subject_id, subjects(name), status, created_at')
  .eq('created_by_user_id', user.id)
  .order('created_at', { ascending: false })
```

Display as cards or a table:

| Subject | Level | Status | Created | Action |
|---------|-------|--------|---------|--------|
| Mathematics | O Levels | 🟡 payment_pending | Feb 23 | View |
| Physics | A Levels | 🔵 ready_to_match | Feb 20 | View |

---

## Status badge helper

Create a shared utility in `lib/utils/request.ts`:

```ts
export type RequestStatus =
  | 'new' | 'payment_pending' | 'ready_to_match'
  | 'matched' | 'active' | 'paused' | 'ended'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  payment_pending: 'Payment Pending',
  ready_to_match: 'Ready to Match',
  matched: 'Matched',
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
}

export const STATUS_COLOURS: Record<RequestStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  payment_pending: 'bg-yellow-100 text-yellow-800',
  ready_to_match: 'bg-blue-100 text-blue-800',
  matched: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  ended: 'bg-red-100 text-red-800',
}
```

---

## Acceptance criteria

- [ ] `lib/utils/request.ts` exports `STATUS_LABELS` and `STATUS_COLOURS`
- [ ] Status badge component is shared (used by request detail page + dashboard list)
- [ ] Student dashboard shows all their requests with current status
- [ ] Request detail page shows correct status colour and label
- [ ] "Next step" CTA changes based on status (see T4.2)
- [ ] RLS ensures students cannot manually set status beyond `payment_pending`
- [ ] Status transition `new → payment_pending` is documented and wired in E5 (T5 references this)

---

## Definition of done

- [ ] `lib/utils/request.ts` status helpers exist
- [ ] Dashboard request list renders with status badges
- [ ] Request detail page (T4.2) uses the shared status badge
- [ ] Transition contract is documented (this issue) for E5/E7/E8 to implement
- [ ] `new → payment_pending` transition is wired in E5 package selection

---

## References

- `docs/MVP.md` — section 12.1 (request status lifecycle — locked)
- `docs/ARCHITECTURE.md` — section 5.5 (requests table), section 6.4 (RLS — update constraints by status), section 8.2 (request creation workflow)
- `docs/PRODUCT.md` — section 7.4 (failure mode handling — status banners)
