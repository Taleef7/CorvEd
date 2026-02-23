## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## Objective

Implement the admin-side tutor approval workflow: a Server Action that sets `tutor_profiles.approved = true`, writes an audit log, and ensures that approved tutors immediately become available for matching.

---

## Background

From `docs/MVP.md` section 10.2:
> "admin approval required before tutor can be matched"

From `docs/ARCHITECTURE.md` section 5.4:
> "`tutor_profiles.approved` (bool, default false)"

The approval state gates the tutor from appearing in matching. In E7 (admin matching), the tutor filter query must include `approved = true`.

---

## Approval workflow steps

From `docs/OPS.md` section 4 Workflow C (matching → tutor confirmation):
> "pick tutor based on subject, level, availability, timezone compatibility. Message tutor privately: confirm availability. If tutor accepts: create match in platform."

Before matching, the admin must approve the tutor. This workflow:

1. Tutor submits application (T6.1) — `approved = false`
2. Admin reviews at `/admin/tutors`
3. Admin clicks "Approve" → Server Action fires
4. `tutor_profiles.approved = true`
5. Audit log written
6. Tutor appears in E7 matching filter

---

## Server Action: `approveOrRevokeTutor`

Location: `app/admin/actions.ts` (or `app/admin/tutors/actions.ts`)

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approveTutor(tutorUserId: string, adminUserId: string) {
  const admin = createAdminClient()

  await admin
    .from('tutor_profiles')
    .update({ approved: true, updated_at: new Date().toISOString() })
    .eq('tutor_user_id', tutorUserId)

  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_approved',
    entity_type: 'tutor_profile',
    entity_id: tutorUserId,
    details: {}
  }])

  revalidatePath('/admin/tutors')
}

export async function revokeTutorApproval(tutorUserId: string, adminUserId: string) {
  const admin = createAdminClient()

  await admin
    .from('tutor_profiles')
    .update({ approved: false, updated_at: new Date().toISOString() })
    .eq('tutor_user_id', tutorUserId)

  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_approval_revoked',
    entity_type: 'tutor_profile',
    entity_id: tutorUserId,
    details: {}
  }])

  revalidatePath('/admin/tutors')
}
```

---

## Acceptance criteria

- [ ] "Approve" button on admin tutor list calls `approveTutor` Server Action
- [ ] After approval, `tutor_profiles.approved = true` in database
- [ ] Audit log entry written with `actor_user_id`, `action = 'tutor_approved'`, `entity_id = tutorUserId`
- [ ] "Revoke" button calls `revokeTutorApproval` Server Action
- [ ] After revocation, tutor no longer appears in E7 matching filter
- [ ] Page re-validates (shows updated status) after action

---

## E7 matching filter dependency

In E7 (T7.2), when the admin selects a tutor, the query must filter by `approved = true`:

```ts
const { data: tutors } = await adminClient
  .from('tutor_profiles')
  .select('tutor_user_id, bio, timezone, tutor_subjects(...), user_profiles(display_name)')
  .eq('approved', true)
  .contains_any('subject filter...')
```

This is the critical linkage between E6 and E7.

---

## Definition of done

- [ ] `approveTutor` Server Action exists and sets `approved = true`
- [ ] `revokeTutorApproval` Server Action exists and sets `approved = false`
- [ ] Both actions write audit log entries
- [ ] Both actions call `revalidatePath('/admin/tutors')`
- [ ] Matching query in E7 filters by `approved = true`

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor_profiles.approved), section 6.6 (audit log)
- `docs/MVP.md` — section 9.1 (tutor verification), section 10.3 (admin — tutor approval)
- `docs/OPS.md` — section 4 Workflow C (matching begins after approval)
