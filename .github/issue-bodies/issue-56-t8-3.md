## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## Objective

Implement session status updates — the mechanisms by which tutors and admins change a session's status from `scheduled` to `done`, `no_show_student`, `no_show_tutor`, or `rescheduled` — including the package `sessions_used` decrement logic and audit logging.

---

## Background

From `docs/MVP.md` section 12.4 (session status lifecycle — locked):
```
scheduled → done | rescheduled | no_show_student | no_show_tutor
```

From `docs/OPS.md` section 5 (no-show policy):
- Student no-show: session deducted (`sessions_used + 1`)
- Tutor no-show: session NOT deducted

This task implements the backend logic (RPC + or Server Action) for status updates.

---

## Implementation approach

**Recommended**: Supabase RPC function `tutor_update_session` (defined in S8.2 #53).

**Alternative (simpler MVP)**: Server Action using admin client:

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const SESSION_CONSUMING_STATUSES = ['done', 'no_show_student']

export async function updateSessionStatus({
  sessionId,
  matchId,
  requestId,
  status,
  tutorNotes,
  actorUserId,
}: {
  sessionId: string
  matchId: string
  requestId: string
  status: 'done' | 'no_show_student' | 'no_show_tutor' | 'rescheduled'
  tutorNotes?: string
  actorUserId: string
}) {
  const admin = createAdminClient()

  // Update session
  await admin.from('sessions').update({
    status,
    tutor_notes: tutorNotes ?? null,
    updated_by_user_id: actorUserId,
    updated_at: new Date().toISOString(),
  }).eq('id', sessionId)

  // Increment sessions_used if applicable
  if (SESSION_CONSUMING_STATUSES.includes(status)) {
    await admin
      .from('packages')
      .update({ sessions_used: /* sessions_used + 1, using RPC increment */ })
      .eq('request_id', requestId)
      .eq('status', 'active')
    // Use Supabase RPC for atomic increment: .rpc('increment_sessions_used', { p_request_id: requestId })
  }

  // Audit log
  await admin.from('audit_logs').insert([{
    actor_user_id: actorUserId,
    action: 'session_status_updated',
    entity_type: 'session',
    entity_id: sessionId,
    details: { status, tutor_notes: tutorNotes }
  }])
}
```

For atomic increment, add a helper RPC:
```sql
create or replace function public.increment_sessions_used(p_request_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.packages
  set sessions_used = sessions_used + 1, updated_at = now()
  where request_id = p_request_id and status = 'active';
end;
$$;
```

---

## Status badge rendering

Use the `STATUS_LABELS` and `STATUS_COLOURS` from `lib/utils/request.ts` (T4.3) extended for sessions:

```ts
export const SESSION_STATUS_LABELS = {
  scheduled: 'Upcoming',
  done: 'Done',
  rescheduled: 'Rescheduled',
  no_show_student: 'Student No-show',
  no_show_tutor: 'Tutor No-show',
}

export const SESSION_STATUS_COLOURS = {
  scheduled: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  no_show_student: 'bg-red-100 text-red-700',
  no_show_tutor: 'bg-orange-100 text-orange-800',
}
```

---

## Acceptance criteria

- [ ] `updateSessionStatus` Server Action (or RPC) exists and updates session status
- [ ] `done` and `no_show_student` → increments `packages.sessions_used` atomically
- [ ] `no_show_tutor` → does NOT increment `sessions_used`
- [ ] `rescheduled` → does NOT increment `sessions_used` (time is updated in T8.4)
- [ ] Audit log written for all status changes
- [ ] Session status badge renders in correct colour
- [ ] `lib/utils/session.ts` exports `SESSION_STATUS_LABELS` and `SESSION_STATUS_COLOURS`

---

## Definition of done

- [ ] Status update Server Action or RPC exists
- [ ] `increment_sessions_used` helper RPC exists
- [ ] Session status labels + colours utility file exists
- [ ] Audit log written on each status change

---

## References

- `docs/ARCHITECTURE.md` — section 6.6 (tutor_update_session RPC), section 5.7 (sessions_used derived constraint)
- `docs/MVP.md` — section 12.4 (session status lifecycle), section 5 (no-show policy)
- `docs/OPS.md` — section 5.2–5.3 (student + tutor no-show handling)
