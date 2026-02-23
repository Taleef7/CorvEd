## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## User story

**As an admin**, I can view a list of all tutors (pending and approved), see their subjects and availability, and mark them as approved — so that they become available for student matching.

---

## Background

From `docs/MVP.md` section 10.3 (admin requirements):
> "matching — view eligible tutors by subject, level, timezone overlap / availability overlap"

From `docs/PRODUCT.md` section 9.1:
> "admin approval required. Tutors can apply, but cannot be assigned until approved."

The approval gate is critical: without it, unvetted tutors could be assigned to students. After approval, the tutor's profile appears in the matching screen (E7).

---

## Acceptance criteria

- [ ] Admin can navigate to `/admin/tutors` and see a list of all tutors
- [ ] List shows: tutor name, subjects + levels, approval status, timezone, date applied
- [ ] Admin can filter by: approval status (pending / approved / all), subject, level
- [ ] Admin can click into a tutor to see their full profile (bio, all subjects, availability windows)
- [ ] Admin can click "Approve" → sets `tutor_profiles.approved = true`
- [ ] Admin can click "Revoke approval" → sets `tutor_profiles.approved = false`
- [ ] Only approved tutors appear in the matching screen (E7)
- [ ] Admin action writes an audit log entry

---

## Admin tutor list screen

```
/admin/tutors

[ Filter: All | Pending | Approved ]  [ Filter by subject: — ]

┌───────────────────────────────────────────────────────┐
│ Name        │ Subjects          │ Levels  │ Status     │ Action │
│ Ali Hassan  │ Math, Physics     │ O, A    │ ⏳ pending  │ [Approve] [View] │
│ Sara Khan   │ Chemistry         │ A       │ ✅ approved │ [Revoke] [View] │
└───────────────────────────────────────────────────────┘
```

---

## Server Action

```ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approveTutor(tutorUserId: string, adminUserId: string) {
  const admin = createAdminClient()
  await admin.from('tutor_profiles').update({ approved: true }).eq('tutor_user_id', tutorUserId)
  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_approved',
    entity_type: 'tutor_profile',
    entity_id: tutorUserId,
    details: {}
  }])
  revalidatePath('/admin/tutors')
}
```

---

## Dependencies

- **T6.1 (#40)** — tutor application form must populate tutor_profiles
- **T6.4 (#43)** — admin tutor list is the full implementation of this story

---

## References

- `docs/MVP.md` — section 10.3 (admin — tutor approval), section 9.1 (tutor verification gate)
- `docs/ARCHITECTURE.md` — section 5.4 (tutor_profiles), section 6.6 (audit log)
- `docs/OPS.md` — section 9 (tutor quality monitoring)
