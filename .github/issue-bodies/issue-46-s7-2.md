## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## User story

**As an admin**, I can reassign a different tutor to an active match — so that if the original tutor becomes unavailable or underperforms, tutoring can continue without interruption.

---

## Background

From `docs/MVP.md` section 10.3:
> "reassign tutor with history tracking (at least a log entry)"

From `docs/OPS.md` section 9 (tutor quality monitoring):
> "if 3 incidents: pause assignments and consider replacement"

Reassignment is rare but must be possible. The history must be kept (audit log) so the admin knows who taught the student in each period.

---

## Acceptance criteria

- [ ] Admin can navigate to a match detail page
- [ ] "Reassign tutor" button is visible on the match detail
- [ ] Admin selects a new tutor from the eligible list (same filters as T7.2)
- [ ] On reassignment:
  - `matches.tutor_user_id` updated to new tutor's user ID
  - Audit log records: `action = 'tutor_reassigned'`, `details = { old_tutor_id, new_tutor_id }`
  - Existing sessions remain (do not regenerate unless admin explicitly does so)
  - `matches.status` stays unchanged (usually `active`)
- [ ] New tutor can immediately see their sessions (E10)
- [ ] Old tutor no longer has access to the sessions

---

## Audit log for reassignment

```ts
await admin.from('audit_logs').insert([{
  actor_user_id: adminUserId,
  action: 'tutor_reassigned',
  entity_type: 'match',
  entity_id: matchId,
  details: {
    old_tutor_user_id: previousTutorId,
    new_tutor_user_id: newTutorId,
    reason: reason, // optional admin note
  }
}])
```

---

## RLS impact on sessions after reassignment

Sessions have an RLS policy that allows the `tutor_user_id` of the match to `SELECT`. After reassignment, the new tutor's ID is now the `matches.tutor_user_id`, so:
- New tutor can see all sessions via the sessions RLS policy (which joins via matches)
- Old tutor loses SELECT access to those sessions

This is handled automatically by the RLS policy — no additional code needed.

---

## Dependencies

- **T7.3 (#49)** — `matches` table and initial assignment must exist
- **T7.4 (#50)** — implements this story

---

## References

- `docs/MVP.md` — section 10.3 (admin — reassign tutor with history)
- `docs/OPS.md` — section 9 (tutor quality monitoring), section 8.3 (escalation when tutor has repeated issues)
- `docs/ARCHITECTURE.md` — section 6.6 (audit log), section 6.4 (matches RLS)
