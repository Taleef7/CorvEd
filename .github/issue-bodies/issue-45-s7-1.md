## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## User story

**As an admin**, I can view a `ready_to_match` request, select an eligible approved tutor, assign them to the request, and set the recurring Google Meet link and schedule pattern — so that the student is matched and can begin tutoring sessions.

---

## Background

From `docs/OPS.md` section 4 Workflow C (matching → tutor confirmation):
> "pick tutor based on subject, level, availability, timezone compatibility. Message tutor privately: confirm availability and that they accept the student. If tutor accepts: create match in platform, add recurring Meet link, set schedule pattern."

From `docs/MVP.md` section 10.3:
> "view eligible tutors by subject, level, timezone overlap / availability overlap. Assign tutor to request (creates match)."

---

## Acceptance criteria

- [ ] Admin can navigate from requests inbox to a request detail + matching screen
- [ ] Matching screen shows the request details (student, level, subject, availability, goals)
- [ ] Matching screen shows a filtered list of approved tutors who teach the required subject + level
- [ ] Admin can select a tutor and submit the match assignment
- [ ] On assignment:
  - `matches` row created with `tutor_user_id`, `request_id`, `status = 'matched'`
  - `requests.status` advances to `'matched'`
  - Audit log entry written
- [ ] After assignment, admin can add/edit the recurring Meet link for the match
- [ ] After adding Meet link: admin can set schedule pattern (days + time + timezone)
- [ ] Admin sees a "Generate Sessions" button once schedule pattern is set (links to E8)

---

## Assignment form fields

| Field | Source | Notes |
|-------|--------|-------|
| Tutor | Selected from eligible list | Filtered by approved + subject + level |
| Meet link | Admin enters manually | `https://meet.google.com/xxx-xxxx-xxx` |
| Schedule timezone | Select | Usually student's timezone |
| Days of week | Multi-select (Mon–Sun) | Which days sessions occur |
| Start time | Time input | In the selected timezone |

---

## Implementation

**File**: `app/admin/requests/[id]/page.tsx`

This page combines:
1. Request details (read-only)
2. Eligible tutor list (filtered)
3. Assignment form (once tutor selected)
4. Meet link + schedule pattern (after assignment)

**Server Action**: `app/admin/actions.ts`

```ts
export async function assignTutor(
  requestId: string,
  tutorUserId: string,
  adminUserId: string,
  meetLink: string,
  schedulePattern: object
) {
  const admin = createAdminClient()

  // Create match
  const { data: match } = await admin.from('matches').insert([{
    request_id: requestId,
    tutor_user_id: tutorUserId,
    status: 'matched',
    meet_link: meetLink,
    schedule_pattern: schedulePattern,
    assigned_by_user_id: adminUserId,
    assigned_at: new Date().toISOString(),
  }]).select().single()

  // Advance request status
  await admin.from('requests').update({ status: 'matched' }).eq('id', requestId)

  // Audit log
  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_assigned',
    entity_type: 'match',
    entity_id: match.id,
    details: { tutor_user_id: tutorUserId, request_id: requestId }
  }])

  revalidatePath(`/admin/requests/${requestId}`)
}
```

---

## Dependencies

- **T7.1 (#47)** — requests inbox must exist
- **T7.2 (#48)** — matching screen (eligible tutor list)
- **T7.3 (#49)** — implements this story

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (matches table), section 8.3 (manual matching workflow)
- `docs/OPS.md` — section 4 Workflows C + D
- `docs/MVP.md` — section 10.3 (admin — matching)
