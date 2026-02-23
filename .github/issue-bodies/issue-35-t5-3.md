## Parent epic

Epic E5: packages and payments (P0) — #30

## Objective

Implement the full payment submission flow: student sees bank transfer instructions, optionally uploads a payment proof screenshot to Supabase Storage, and submits the payment record. The admin then reviews and marks it paid or rejected.

---

## Background

From `docs/MVP.md` section 7 (payments):
> "student submits payment proof (optional but recommended): screenshot upload and/or transaction reference. Admin verifies externally and marks payment as paid in admin dashboard."

From `docs/OPS.md` section 4 Workflow B:
> "tell user to send screenshot/reference after transfer. Once received: label payment_pending_verification. Verify externally. Mark payment as paid in platform."

---

## Student-side: payment submission

### Page: `app/dashboard/packages/[id]/page.tsx`

After package is created (status = `pending`), this page shows:

1. **Bank transfer instructions** (from `lib/config/pricing.ts`)
2. **Optional proof upload** (Supabase Storage)
3. **Optional reference field** (transaction ID)
4. **Submit confirmation** — creates/updates `payments` row

### Proof upload

```ts
// Upload proof to Supabase Storage
const filePath = `${user.id}/${packageId}/${Date.now()}_${file.name}`
const { data, error } = await supabase.storage
  .from('payment-proofs')
  .upload(filePath, file)

// Save path to payments table
await supabase.from('payments').update({ proof_path: data.path }).eq('id', paymentId)
```

File type restriction: images only (`.jpg`, `.jpeg`, `.png`, `.pdf`). Max size: 5 MB.

---

## Admin-side: payment review and verification

### Page: `app/admin/payments/page.tsx`

Lists all payments with `status = 'pending'`:

```ts
const { data: payments } = await adminClient
  .from('payments')
  .select(`
    id, amount_pkr, status, reference, proof_path, created_at,
    packages (tier_sessions, request_id,
      requests (level, subjects(name),
        user_profiles!created_by_user_id(display_name, whatsapp_number)
      )
    )
  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: true })
```

### Viewing proof

For private bucket, generate signed URL server-side:

```ts
const { data: { signedUrl } } = await adminClient.storage
  .from('payment-proofs')
  .createSignedUrl(payment.proof_path, 300)
```

### Mark as paid / rejected

From S5.2 (#32) — Server Action `markPaymentPaid` triggers:
- `payments.status → paid`
- `packages.status → active`
- `requests.status → ready_to_match`
- Audit log entry

---

## Payment record fields stored

From `docs/MVP.md` section 7.3:

| Field | Source |
|-------|--------|
| `payer_user_id` | current user ID |
| `package_id` | from package selection |
| `amount_pkr` | from `PACKAGES` config |
| `method` | always `'bank_transfer'` (MVP) |
| `reference` | user-entered transaction ID (optional) |
| `proof_path` | Supabase Storage path (optional) |
| `status` | starts `'pending'` |

---

## Acceptance criteria

- [ ] After package selection, user sees bank transfer instructions with their reference string
- [ ] User can optionally upload a proof file (image/PDF, max 5MB)
- [ ] User can optionally enter a transaction reference ID
- [ ] Submitting the form creates a `payments` row with `status = 'pending'`
- [ ] Admin can view the pending payments list at `/admin/payments`
- [ ] Admin can view uploaded proof via signed URL
- [ ] "Mark as Paid" triggers all three status updates atomically (payment, package, request)
- [ ] "Mark as Rejected" updates payment status to `rejected` with an admin note
- [ ] Audit log entry is written for both actions

---

## Definition of done

- [ ] Student payment submission page exists at `app/dashboard/packages/[id]/page.tsx`
- [ ] File upload to `payment-proofs` bucket works
- [ ] `payments` row created with correct fields
- [ ] Admin payments page at `/admin/payments` shows pending payments
- [ ] Mark-paid and mark-rejected Server Actions work and write audit log
- [ ] Signed URL is used for proof viewing (not public URL)

---

## References

- `docs/MVP.md` — section 7 (payments — required record fields)
- `docs/OPS.md` — section 4 Workflow B (payment verification workflow), section 6.4 (/paybank), section 6.5 (/paid)
- `docs/ARCHITECTURE.md` — section 5.5 (payments table), section 7 (storage), section 6.6 (audit log)
