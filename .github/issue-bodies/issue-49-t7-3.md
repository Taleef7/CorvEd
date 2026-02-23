## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## Objective

Implement the `assignTutor` Server Action and the Supabase migration for the `matches` table — creating the Match record that connects a request to a tutor and stores the Meet link and schedule pattern.

---

## Migration: `<ts>_create_matches_table.sql`

From `docs/ARCHITECTURE.md` section 5.6:

```sql
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete cascade,
  tutor_user_id uuid not null references public.tutor_profiles(tutor_user_id) on delete restrict,
  status public.match_status_enum not null default 'matched',
  meet_link text,
  schedule_pattern jsonb,
  assigned_by_user_id uuid references public.user_profiles(user_id),
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches enable row level security;

-- Admin can do everything
create policy "matches_admin_write"
  on public.matches for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Participants can select
create policy "matches_select_participants"
  on public.matches for select to authenticated
  using (
    public.is_admin(auth.uid())
    or tutor_user_id = auth.uid()
    or exists (
      select 1 from public.requests r
      where r.id = matches.request_id
        and r.created_by_user_id = auth.uid()
    )
  );
```

---

## Server Action: `assignTutor`

Location: `app/admin/actions.ts`

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function assignTutor({
  requestId,
  tutorUserId,
  adminUserId,
  meetLink,
  schedulePattern,
}: {
  requestId: string
  tutorUserId: string
  adminUserId: string
  meetLink?: string
  schedulePattern?: {
    timezone: string
    days: number[]
    time: string
    duration_mins: number
  }
}) {
  const admin = createAdminClient()

  const { data: match, error } = await admin
    .from('matches')
    .insert([{
      request_id: requestId,
      tutor_user_id: tutorUserId,
      status: 'matched',
      meet_link: meetLink ?? null,
      schedule_pattern: schedulePattern ?? null,
      assigned_by_user_id: adminUserId,
      assigned_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Advance request status
  await admin
    .from('requests')
    .update({ status: 'matched', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  // Audit log
  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'tutor_assigned',
    entity_type: 'match',
    entity_id: match.id,
    details: { tutor_user_id: tutorUserId, request_id: requestId }
  }])

  revalidatePath(`/admin/requests/${requestId}`)
  return match
}
```

---

## Schedule pattern format

From `docs/ARCHITECTURE.md` section 9.3:

```json
{
  "timezone": "Asia/Karachi",
  "days": [1, 3],
  "time": "19:00",
  "duration_mins": 60
}
```

- `days`: 0 = Sunday, 1 = Monday, …, 6 = Saturday
- `time`: local time in 24h format
- `duration_mins`: always 60 in MVP

---

## Acceptance criteria

- [ ] `supabase/migrations/<ts>_create_matches_table.sql` exists with table + RLS
- [ ] `assignTutor` Server Action creates match and advances request to `matched`
- [ ] Match stores `meet_link` and `schedule_pattern` (can be null on initial assignment)
- [ ] Audit log entry written with correct action and details
- [ ] Admin can update `meet_link` and `schedule_pattern` after initial assignment (via separate edit action)

---

## Definition of done

- [ ] `matches` table migration exists and applies cleanly
- [ ] `assignTutor` Server Action works end-to-end
- [ ] Request status advances to `matched`
- [ ] Audit log is written

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (matches table), section 6.4 (matches RLS), section 9.3 (schedule_pattern format), section 8.3 (matching workflow)
- `docs/OPS.md` — section 4 Workflow C + D
