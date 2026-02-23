## Parent epic

Epic E9: student dashboard (P0) — #58

## User story

**As a parent or student**, I can log into my dashboard and immediately see my assigned tutor's name, the recurring Google Meet link for sessions, and the schedule — so I always know who is teaching me and how to join my next class.

---

## Background

From `docs/MVP.md` section 10.1 (student dashboard):
> "view: assigned tutor name, upcoming sessions list, next session time, recurring Meet link"

From `docs/OPS.md` section 6.7 (/matched quick reply template):
> "Teacher: [TutorName]. Schedule: [Days] at [Time] ([StudentTZ]). Google Meet link (recurring): [MeetLink]."

---

## Acceptance criteria

- [ ] Dashboard shows the **tutor's display name** for each active request/match
- [ ] Dashboard shows the **recurring Meet link** from the match record
- [ ] Dashboard shows the **schedule pattern** in human-readable form (e.g., "Monday and Wednesday at 7:00 PM PKT")
- [ ] "Join Meet" link opens the Meet link in a new tab
- [ ] If no active match yet, shows: "You'll be matched soon — we'll notify you via WhatsApp"
- [ ] If multiple requests/subjects, each shows its own tutor + schedule + link

---

## Data query

```ts
// From app/dashboard/page.tsx (server component)
const { data: matches } = await supabase
  .from('matches')
  .select(`
    id, meet_link, schedule_pattern, status,
    tutor:tutor_user_id(display_name),
    requests!request_id(level, subjects(name))
  `)
  .eq('requests.created_by_user_id', user.id)
  .in('status', ['matched', 'active'])
```

---

## Schedule pattern display

```ts
import { DateTime } from 'luxon'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatSchedule(pattern: SchedulePattern, studentTimezone: string): string {
  const days = pattern.days.map(d => DAY_NAMES[d]).join(' & ')
  const [h, m] = pattern.time.split(':')
  const tzAbbr = DateTime.now().setZone(studentTimezone).toFormat('ZZZZ')
  return `${days} at ${h}:${m} ${tzAbbr}`
}
```

---

## Dependencies

- **E7 T7.3 (#49)** — match record must exist with tutor_user_id, meet_link, schedule_pattern
- **T9.1 (#61)** — implements this story

---

## References

- `docs/MVP.md` — section 10.1 (student dashboard requirements)
- `docs/OPS.md` — section 6.7 (/matched quick reply)
- `docs/ARCHITECTURE.md` — section 5.6 (matches table), section 9.3 (schedule_pattern format)
