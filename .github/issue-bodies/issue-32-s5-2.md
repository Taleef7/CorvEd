## Parent epic

Epic E5: packages and payments (P0) — #30

## User story

**As an admin**, I can view all pending payment submissions, review the uploaded proof or reference, and mark each payment as paid or rejected — so that the student's package is activated and they can be matched with a tutor.

---

## Background

From `docs/MVP.md` section 10.3 (admin requirements — payments):
> "view payment submissions and proof. Mark payment as paid / rejected. Adjust package start date (if needed)."

From `docs/OPS.md` section 4 Workflow B (payment initiation → verified):
> "verify externally → mark payment as paid in platform → confirm via WhatsApp → label: payment_confirmed"

The admin does not receive money in the platform — they verify the bank transfer externally and then mark the payment as paid in the dashboard. This activates the package and advances the request to `ready_to_match`.

---

## Acceptance criteria

- [ ] Admin can navigate to `/admin/payments` and see all pending payments
- [ ] Payment list shows: student name, subject, level, package tier, amount (PKR), submitted date, proof thumbnail/link
- [ ] Admin can click into a payment to view full details + proof (if uploaded)
- [ ] Admin can mark a payment as **paid** — this triggers:
  - `payments.status` → `paid`
  - `payments.verified_by_user_id` = admin's user ID
  - `payments.verified_at` = now()
  - `packages.status` → `active`
  - `requests.status` → `ready_to_match`
- [ ] Admin can mark a payment as **rejected** with an optional note
- [ ] Admin can adjust the package `start_date` and `end_date` before activating
- [ ] All admin payment actions are performed via Server Actions using the service role client

---

## Admin payments screen layout

```
/admin/payments

[ Filter: All | Pending | Paid | Rejected ]

┌──────────────────────────────────────────────────────────┐
│ Student     Subject    Package    Amount    Date     Status  │
│ Ahmed Ali   Math/O     12 sessions PKR 11,000  Feb 23   pending │
│ [View proof] [Mark Paid] [Reject]                         │
└──────────────────────────────────────────────────────────┘
```

---

## Server Action for mark-as-paid

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function markPaymentPaid(paymentId: string, packageId: string, requestId: string, adminUserId: string) {
  const admin = createAdminClient()

  // Update payment
  await admin.from('payments').update({
    status: 'paid',
    verified_by_user_id: adminUserId,
    verified_at: new Date().toISOString(),
  }).eq('id', paymentId)

  // Activate package
  await admin.from('packages').update({ status: 'active' }).eq('id', packageId)

  // Advance request
  await admin.from('requests').update({ status: 'ready_to_match' }).eq('id', requestId)

  // Audit log
  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'payment_marked_paid',
    entity_type: 'payment',
    entity_id: paymentId,
    details: { package_id: packageId, request_id: requestId }
  }])

  revalidatePath('/admin/payments')
}
```

---

## Payment proof viewing

If a proof file was uploaded, the admin views it via a **signed URL** (private bucket):

```ts
const { data } = await adminClient.storage
  .from('payment-proofs')
  .createSignedUrl(payment.proof_path, 300) // 5-minute expiry
```

---

## Dependencies

- **T5.1 (#33)** — `packages` and `payments` tables must exist
- **T5.3 (#35)** — payment upload workflow must be implemented

---

## References

- `docs/MVP.md` — section 7 (payments), section 10.3 (admin requirements — payments)
- `docs/OPS.md` — section 4 Workflow B (payment verification workflow)
- `docs/ARCHITECTURE.md` — section 5.5 (payments table), section 7 (storage for proofs), section 6.6 (audit log)
