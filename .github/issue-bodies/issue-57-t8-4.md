## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## Objective

Implement the admin-side reschedule flow: the admin can update a session's `scheduled_start_utc` and `scheduled_end_utc` to a new time, set status to `rescheduled`, write an audit log, and notify the parties (via WhatsApp outside the platform or through the copy-message feature in E11).

---

## Background

From `docs/MVP.md` section 5.1 (reschedule policy — locked):
> "reschedule cutoff: 24 hours before session start. Must request via WhatsApp."

From `docs/OPS.md` section 4 Workflow F (reschedule request handling):
> "if >= 24 hours: allow reschedule, propose 2 alternative slots, confirm with tutor, update session time in platform, send confirmation with updated time."
> "if < 24 hours: apply policy (late reschedule = no-show or exception with audit note)"

From `docs/ARCHITECTURE.md` section 8.6:
> "student requests reschedule via WhatsApp. Admin edits the session time in platform. session.status = rescheduled."

---

## Reschedule Server Action

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function rescheduleSession({
  sessionId,
  newStartUtc,
  newEndUtc,
  adminUserId,
  reason,
}: {
  sessionId: string
  newStartUtc: string    // ISO string in UTC
  newEndUtc: string      // ISO string in UTC
  adminUserId: string
  reason?: string
}) {
  const admin = createAdminClient()

  await admin.from('sessions').update({
    scheduled_start_utc: newStartUtc,
    scheduled_end_utc: newEndUtc,
    status: 'rescheduled',
    updated_by_user_id: adminUserId,
    updated_at: new Date().toISOString(),
  }).eq('id', sessionId)

  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'session_rescheduled',
    entity_type: 'session',
    entity_id: sessionId,
    details: {
      new_start_utc: newStartUtc,
      new_end_utc: newEndUtc,
      reason: reason ?? null,
    }
  }])

  revalidatePath('/admin/sessions')
}
```

---

## Admin reschedule UI

On the admin sessions overview (`/admin/sessions`) or session detail:

```
Session: Mon Feb 23 at 7:00 PM PKT
Status: Scheduled

[Reschedule]  → opens a form:
  New date + time: [date picker] [time picker]
  Timezone: Asia/Karachi (auto-convert to UTC on save)
  Reason (optional): [text]
  [Save Reschedule]
```

UTC conversion on admin side:
```ts
import { DateTime } from 'luxon'

const newStartUtc = DateTime.fromISO(`${newDate}T${newTime}`, { zone: adminTimezone })
  .toUTC().toISO()
const newEndUtc = DateTime.fromISO(`${newDate}T${newTime}`, { zone: adminTimezone })
  .plus({ minutes: 60 }).toUTC().toISO()
```

---

## Admin sessions overview

**File**: `app/admin/sessions/page.tsx`

Shows all sessions across all matches (admin view only):

```ts
const { data: sessions } = await adminClient
  .from('sessions')
  .select(`
    id, scheduled_start_utc, status, tutor_notes,
    matches(meet_link, tutor_user_id, request_id,
      user_profiles!tutor_user_id(display_name),
      requests(level, subjects(name),
        user_profiles!created_by_user_id(display_name)
      )
    )
  `)
  .order('scheduled_start_utc', { ascending: true })
```

---

## 24-hour cutoff enforcement

The 24-hour cutoff is primarily an **operations policy** (enforced by admin discretion and communicated via WhatsApp). For MVP, the platform does not technically block late reschedules — the admin manually applies the policy.

**Optional UI hint**: Show a warning badge if the reschedule is within 24 hours of the session:
```ts
const hoursUntilSession = DateTime.fromISO(session.scheduled_start_utc)
  .diff(DateTime.now(), 'hours').hours

if (hoursUntilSession < 24) {
  // Show: "⚠️ This session starts in < 24 hours. Late reschedule applies policy."
}
```

---

## Acceptance criteria

- [ ] `rescheduleSession` Server Action exists and updates session time + status
- [ ] Audit log written with old/new times and reason
- [ ] Admin sessions overview page exists at `/admin/sessions`
- [ ] Each session shows: student, subject, tutor, time, status, reschedule button
- [ ] Reschedule form accepts new date + time in admin timezone and converts to UTC
- [ ] Warning shown for sessions within 24 hours of original start
- [ ] Rescheduled sessions do NOT increment `sessions_used`

---

## Definition of done

- [ ] `rescheduleSession` Server Action exists
- [ ] `/admin/sessions/page.tsx` exists and lists all sessions
- [ ] Reschedule form converts time to UTC correctly
- [ ] Audit log written

---

## References

- `docs/MVP.md` — section 5.1 (reschedule policy — locked), section 12.4 (session status)
- `docs/OPS.md` — section 4 Workflow F (reschedule handling), section 6.9–6.10 (reschedule templates)
- `docs/ARCHITECTURE.md` — section 8.6 (reschedule workflow), section 9 (timezone model)
