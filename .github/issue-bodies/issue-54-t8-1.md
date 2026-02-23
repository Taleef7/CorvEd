## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## Objective

Implement the admin session generator: a Server Action that reads the match's `schedule_pattern` and package's `tier_sessions` + date window, and inserts N session rows (in UTC) into the `sessions` table. Also create the Supabase migration for the `sessions` table.

---

## Migration: `<ts>_create_sessions_table.sql`

From `docs/ARCHITECTURE.md` section 5.6:

```sql
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  scheduled_start_utc timestamptz not null,
  scheduled_end_utc timestamptz not null,
  status public.session_status_enum not null default 'scheduled',
  tutor_notes text,
  updated_by_user_id uuid references public.user_profiles(user_id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on public.sessions (match_id, scheduled_start_utc asc);
create index on public.sessions (status, scheduled_start_utc asc);

alter table public.sessions enable row level security;

-- Admin: full access
create policy "sessions_admin_all"
  on public.sessions for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Tutor: select their own sessions (via match)
create policy "sessions_select_tutor"
  on public.sessions for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = sessions.match_id and m.tutor_user_id = auth.uid()
    )
  );

-- Student/parent: select their own sessions (via match → request)
create policy "sessions_select_student"
  on public.sessions for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.requests r on r.id = m.request_id
      where m.id = sessions.match_id and r.created_by_user_id = auth.uid()
    )
  );
```

---

## Session generation algorithm

From `docs/ARCHITECTURE.md` section 9.4:

```ts
// lib/services/scheduling.ts
import { DateTime } from 'luxon'

interface SchedulePattern {
  timezone: string
  days: number[]  // 0=Sun, 1=Mon, ..., 6=Sat
  time: string    // "HH:mm"
  duration_mins: number
}

export function generateSessions(
  schedulePattern: SchedulePattern,
  startDate: string,  // ISO date "YYYY-MM-DD"
  endDate: string,    // ISO date "YYYY-MM-DD"
  tierSessions: number
): { start_utc: string; end_utc: string }[] {
  const { timezone, days, time, duration_mins } = schedulePattern
  const [hour, minute] = time.split(':').map(Number)
  const sessions: { start_utc: string; end_utc: string }[] = []

  let current = DateTime.fromISO(startDate, { zone: timezone })
  const end = DateTime.fromISO(endDate, { zone: timezone })

  while (current <= end && sessions.length < tierSessions) {
    if (days.includes(current.weekday % 7)) { // luxon: 1=Mon, 7=Sun; convert to 0=Sun..6=Sat
      const sessionStart = current.set({ hour, minute, second: 0, millisecond: 0 })
      const sessionEnd = sessionStart.plus({ minutes: duration_mins })
      sessions.push({
        start_utc: sessionStart.toUTC().toISO()!,
        end_utc: sessionEnd.toUTC().toISO()!,
      })
    }
    current = current.plus({ days: 1 })
  }

  return sessions
}
```

> **Note on luxon weekday**: luxon uses 1=Monday, 7=Sunday. The schedule_pattern uses 0=Sunday, 1=Monday, ..., 6=Saturday (same as JS `Date.getDay()`). Convert when using luxon: `luxonWeekday % 7` maps correctly.

---

## Server Action: `generateSessions`

```ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSessions } from '@/lib/services/scheduling'
import { revalidatePath } from 'next/cache'

export async function generateSessionsForMatch(matchId: string, adminUserId: string) {
  const admin = createAdminClient()

  // Fetch match + package
  const { data: match } = await admin
    .from('matches')
    .select('schedule_pattern, request_id')
    .eq('id', matchId)
    .single()

  const { data: pkg } = await admin
    .from('packages')
    .select('tier_sessions, start_date, end_date')
    .eq('request_id', match.request_id)
    .eq('status', 'active')
    .single()

  const sessionTimes = generateSessions(
    match.schedule_pattern,
    pkg.start_date,
    pkg.end_date,
    pkg.tier_sessions
  )

  // Insert sessions
  const rows = sessionTimes.map(s => ({
    match_id: matchId,
    scheduled_start_utc: s.start_utc,
    scheduled_end_utc: s.end_utc,
    status: 'scheduled',
  }))

  await admin.from('sessions').insert(rows)

  // Advance match and request to active
  await admin.from('matches').update({ status: 'active' }).eq('id', matchId)
  await admin.from('requests').update({ status: 'active' }).eq('id', match.request_id)

  // Audit log
  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'sessions_generated',
    entity_type: 'match',
    entity_id: matchId,
    details: { session_count: rows.length }
  }])

  revalidatePath(`/admin/requests/${match.request_id}`)
}
```

---

## Acceptance criteria

- [ ] `supabase/migrations/<ts>_create_sessions_table.sql` exists with table + RLS
- [ ] `lib/services/scheduling.ts` exports `generateSessions` function
- [ ] `generateSessions` correctly iterates dates and stops at `tierSessions`
- [ ] Sessions are stored as UTC timestamps
- [ ] After generation: `matches.status → active`, `requests.status → active`
- [ ] Audit log written
- [ ] Admin sees "Generate Sessions" button on match detail page (T7.3)

---

## Dependencies

- **E8 T8.2 (#55)** — meet_link must be set on match before sessions are shown
- **E5 T5.1 (#33)** — active package must exist (for start_date, end_date, tier_sessions)

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 6.4 (sessions RLS), section 9.4 (generation algorithm), section 8.4 (schedule generation workflow)
- `docs/MVP.md` — section 4.3 (format — 60 min sessions, recurring weekly), section 12.4 (session status)
