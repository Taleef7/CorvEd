## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## User story

**As a student or tutor**, I can view a list of my upcoming sessions with the scheduled time (in my timezone) and the Google Meet link — so I always know when my next class is and how to join it.

---

## Background

From `docs/MVP.md` section 10.1 (student dashboard):
> "view: assigned tutor name, upcoming sessions list, next session time, recurring Meet link, sessions remaining"

From `docs/PRODUCT.md` section 7.1 (UX requirements):
> "dashboard always shows: next session time, Meet link, remaining sessions, tutor name"

From `docs/OPS.md` section 4 Workflow D:
> "send confirmation message: start date/time, recurring days/time, Meet link, reschedule cutoff"

The Meet link and session times are the primary information students and tutors need on a daily basis.

---

## Acceptance criteria

### Student view
- [ ] Student dashboard shows the **next upcoming session** prominently:
  - Date and time (in student's timezone from `user_profiles.timezone`)
  - Subject + tutor name
  - Clickable Google Meet link
- [ ] Student can view a full list of all sessions (upcoming + past) at `/dashboard/sessions`
- [ ] Each session shows: date/time in student's timezone, status badge, tutor notes (for past sessions)

### Tutor view
- [ ] Tutor dashboard shows their upcoming sessions at `/tutor/sessions`
- [ ] Each session shows: date/time in tutor's timezone, student name, subject, Meet link
- [ ] Tutor can see session status (upcoming/done/missed)

### General
- [ ] Meet link is read from `matches.meet_link` and shown with every session
- [ ] Session times are shown in the **viewer's timezone** (student sees their TZ, tutor sees their TZ)
- [ ] Sessions with `status = 'scheduled'` appear in upcoming list; others in history

---

## Timezone display

From `docs/ARCHITECTURE.md` section 9.2:
> "every user has a timezone in user_profiles.timezone (IANA string). UI displays session time in viewer timezone: Intl.DateTimeFormat or luxon"

```ts
function formatSessionTime(utcIso: string, userTimezone: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: userTimezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(utcIso))
}
```

---

## Dependencies

- **T8.1 (#54)** — sessions must be generated before they can be displayed
- **T8.2 (#55)** — Meet link storage
- **E9 T9.1 (#61)** — student dashboard next session card
- **E10 T10.1 (#68)** — tutor session list

---

## References

- `docs/MVP.md` — section 10.1 (student — view tutor, schedule, Meet link)
- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 9.2 (timezone display)
- `docs/OPS.md` — section 4 Workflow D (confirmed schedule sent to both parties)
