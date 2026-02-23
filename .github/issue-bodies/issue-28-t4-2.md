## Parent epic

Epic E4: student/parent intake flow (P0) — #24

## Objective

Build the request detail/confirmation page at `app/dashboard/requests/[id]/page.tsx` that is shown immediately after a student submits their request. This page confirms that the request was received, explains the next step (package selection and payment), and allows the user to view their request status over time.

---

## Background

From `docs/PRODUCT.md` section 5.1 step 3–4:
> "Step 3: submit request → Step 4: select package and pay"

From `docs/MVP.md` section 10.1 (student dashboard):
> "see request status updates: new → payment_pending → ready_to_match → matched → active"

After form submission, the user needs to understand:
1. Their request was successfully received
2. What happens next (select a package, pay)
3. Where they can track progress

---

## Page: `app/dashboard/requests/[id]/page.tsx`

This is a server-rendered page that fetches the request by ID:

```ts
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function RequestPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: request } = await supabase
    .from('requests')
    .select('*, subjects(name)')
    .eq('id', params.id)
    .single()

  if (!request) notFound()
  if (request.created_by_user_id !== user.id) notFound() // RLS handles this, but explicit check

  return (
    <div>
      <h1>Request Received ✅</h1>
      {/* Request summary + status + next step CTA */}
    </div>
  )
}
```

---

## Page sections

### 1. Confirmation banner
```
Request received ✅
We've received your request for [Level] [Subject].
```

### 2. Request summary (read-only)

| Field | Value |
|-------|-------|
| Level | O Levels / A Levels |
| Subject | Mathematics (etc.) |
| Exam board | Cambridge / Edexcel / Other |
| Availability | [what user entered] |
| Goals | [what user entered] |
| Status | `new` (shown as a status badge) |
| Submitted | [timestamp in user timezone] |

### 3. "What happens next" banner

```
Next step: Select a package and pay to begin the matching process.
[Select Package →] button → links to package selection (E5)
```

If `status = 'payment_pending'`:
```
Payment pending verification. We'll notify you on WhatsApp once confirmed.
```

If `status = 'ready_to_match'`:
```
Payment confirmed ✅ We're finding the best teacher for you.
```

If `status = 'matched'` or `'active'`:
```
You've been matched! See your dashboard for session details.
[Go to Dashboard →]
```

### 4. Status history (optional MVP)

A simple list of status changes. Can be a static description per status if audit log is not implemented yet.

---

## Status badge colours

| Status | Badge colour |
|--------|-------------|
| `new` | gray |
| `payment_pending` | yellow |
| `ready_to_match` | blue |
| `matched` | purple |
| `active` | green |
| `paused` | orange |
| `ended` | red |

---

## Acceptance criteria

- [ ] `app/dashboard/requests/[id]/page.tsx` exists and is server-rendered
- [ ] Page fetches request by ID using user's session (RLS enforced)
- [ ] Returns 404 if request not found or doesn't belong to the current user
- [ ] Shows request summary (level, subject, status, availability, goals)
- [ ] Shows appropriate "what happens next" message per status
- [ ] Status is shown as a colour-coded badge
- [ ] "Select Package" CTA is visible when `status = 'new'` (links to E5 flow)

---

## Definition of done

- [ ] Page exists and renders request details
- [ ] 404 for requests not belonging to current user
- [ ] Status badge shown with correct colour
- [ ] "What happens next" message is status-aware
- [ ] "Select Package" button links to `/dashboard/packages/...` (stub URL OK if E5 not built yet)

---

## References

- `docs/ARCHITECTURE.md` — section 5.5 (requests table), section 8.2 (request creation workflow)
- `docs/MVP.md` — section 10.1 (student dashboard — request status updates), section 12.1 (request status lifecycle)
- `docs/PRODUCT.md` — section 5.1 steps 3–5 (submit → package → matching)
