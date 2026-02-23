## Goal

Implement the monthly session generation system — allowing the admin to set a recurring schedule pattern (days + time + timezone) on a match and generate N sessions for the month (8, 12, or 20 based on the package tier). Also store and display the recurring Google Meet link, implement session status updates, and provide the admin reschedule flow.

---

## Why this matters

Sessions are the core value delivery unit of CorvEd. From `docs/MVP.md` section 4.3:
> "format: 1 hour per session, online via Google Meet. Schedule: recurring weekly pattern agreed at enrollment."

From `docs/ARCHITECTURE.md` section 8.4 (schedule generation):
> "admin selects days/time pattern and start date. System generates N sessions for the month window."

Without this epic, students and tutors have no sessions to see, and the match cannot progress to `active`.

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S8.1 (#52) | Story | As a student/tutor, I can see upcoming sessions and the Meet link | **open** |
| S8.2 (#53) | Story | As a tutor/admin, I can mark session as done/missed/rescheduled | **open** |
| T8.1 (#54) | Task | Session generator (admin sets recurring schedule, system generates sessions) | **open** |
| T8.2 (#55) | Task | Meet link storage strategy (one per match, stored on Match, sessions reference it) | **open** |
| T8.3 (#56) | Task | Session status updates (scheduled/done/missed/rescheduled) | **open** |
| T8.4 (#57) | Task | Reschedule flow (student requests via WhatsApp, admin updates in dashboard) | **open** |

---

## Session data model (from `docs/ARCHITECTURE.md` section 5.6)

```
sessions:
  id, match_id
  scheduled_start_utc (timestamptz)
  scheduled_end_utc (timestamptz)
  status (scheduled | done | rescheduled | no_show_student | no_show_tutor)
  tutor_notes (text)
  updated_by_user_id, updated_at
```

All times stored in UTC. Displayed in each user's timezone.

---

## Session generation algorithm (from `docs/ARCHITECTURE.md` section 9.4)

```
Inputs:
  match.schedule_pattern = { timezone, days: [1,3], time: "19:00", duration_mins: 60 }
  package.tier_sessions = N (8, 12, or 20)
  package.start_date, package.end_date

Algorithm:
  iterate dates from start_date to end_date in schedule_pattern.timezone
  for each date whose day-of-week is in pattern.days:
    combine date + pattern.time in that timezone → convert to UTC
    create session with start + end UTC
  stop when N sessions created
```

Implement using `luxon` (`DateTime.fromObject({ zone }).toUTC().toISO()`).

---

## Exit criteria (E8 is done when)

- [ ] Admin can trigger session generation for a match (N sessions created)
- [ ] Sessions are stored as UTC timestamps in the database
- [ ] Student/tutor can see their upcoming sessions with times shown in their timezone
- [ ] Meet link from the match is shown with every session
- [ ] Admin or tutor can mark a session as done / missed / rescheduled
- [ ] Admin can reschedule a session (update `scheduled_start_utc`)
- [ ] `matches.status` advances to `active` and `requests.status` advances to `active` after generation

---

## Migration requirements

Create migration for `public.sessions` table with correct schema and RLS:
- Tutor and student can SELECT (via match relationship)
- Status updates via `tutor_update_session` RPC function (tutor) or admin direct update
- Admin-only insert and reschedule

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 6.4 (sessions RLS), section 6.6 (tutor_update_session RPC), section 8.4–8.5 (schedule generation + session execution), section 9 (timezone model)
- `docs/MVP.md` — section 4.3 (format — sessions, scheduling), section 10.1 (student dashboard — sessions), section 12.4 (session status lifecycle)
- `docs/OPS.md` — section 4 Workflow D (schedule finalization → sessions generated), section 4 Workflow E (day-of-class operations), section 4 Workflow F (reschedule handling)
