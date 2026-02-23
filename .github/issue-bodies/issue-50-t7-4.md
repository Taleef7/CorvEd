## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## Objective

Implement the tutor reassignment flow — updating `matches.tutor_user_id` to a new tutor while keeping a full audit trail of who taught the student previously.

---

## Background

From `docs/MVP.md` section 10.3:
> "reassign tutor with history tracking (at least a log entry)"

From `docs/OPS.md` section 8.3 (escalation playbook):
> "offer resolution options: reschedule, credit session (rare), tutor reassignment"

From `docs/OPS.md` section 9 (tutor quality monitoring):
> "if 3 incidents: pause assignments and consider replacement"

---

## Server Action: `reassignTutor`

Location: `app/admin/actions.ts`

```ts
export async function reassignTutor({
  matchId,
  previousTutorUserId,
  newTutorUserId,
  adminUserId,
  reason,
}: {
  matchId: string
  previousTutorUserId: string
  newTutorUserId: string
  adminUserId: string
  reason?: string
}) {
  const admin = createAdminClient()

  await admin
    .from('matches')
    .update({
      tutor_user_id: newTutorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_reassigned',
    entity_type: 'match',
    entity_id: matchId,
    details: {
      old_tutor_user_id: previousTutorUserId,
      new_tutor_user_id: newTutorUserId,
      reason: reason ?? null,
    }
  }])

  revalidatePath(`/admin/requests`)
}
```

---

## Match detail page: `app/admin/matches/[id]/page.tsx`

This page shows the full match record and is where reassignment happens:

```
Match #xxx
Student: Ahmed Ali (O Levels Math)
Tutor: Ali Hassan (Asia/Karachi)
Status: active
Meet link: https://meet.google.com/...
Schedule: Mon/Wed 7 PM PKT

[Reassign Tutor ↔]  [Edit Meet Link]  [Edit Schedule]
```

Clicking "Reassign Tutor":
- Shows the eligible tutor list (same filter as T7.2)
- Admin selects new tutor + optional reason note
- Submits `reassignTutor` Server Action

---

## Session access after reassignment

From S7.2 (#46) — sessions remain unchanged after reassignment. The new tutor's access to sessions is automatic via the matches RLS policy (sessions join via matches, and sessions select policy checks `tutor_user_id` on the match).

---

## Acceptance criteria

- [ ] Match detail page exists at `/admin/matches/[id]` or embedded on `/admin/requests/[id]`
- [ ] "Reassign Tutor" button opens eligible tutor selector
- [ ] `reassignTutor` Server Action updates `matches.tutor_user_id`
- [ ] Audit log records: action, matchId, old_tutor_id, new_tutor_id, reason
- [ ] Old tutor loses session access; new tutor gains access (verified by RLS)
- [ ] Reason field is optional but stored if provided

---

## Definition of done

- [ ] `reassignTutor` Server Action exists and updates `matches.tutor_user_id`
- [ ] Audit log entry written with full detail
- [ ] Match detail page has reassign workflow

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (matches table), section 6.4 (matches RLS — participants), section 6.6 (audit log)
- `docs/OPS.md` — section 8.3 (escalation — tutor reassignment), section 9 (monitoring — replacement trigger)
- `docs/MVP.md` — section 10.3 (admin — reassign tutor with history)
