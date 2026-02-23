## Parent epic

Epic E9: student dashboard (P0) — #58

## Objective

Build the student sessions list at `app/dashboard/sessions/page.tsx` showing all upcoming and past sessions in the student's timezone with status badges and tutor notes for completed sessions.

---

## Background

From `docs/MVP.md` section 10.1:
> "view: upcoming sessions list with time, tutor, Meet link. Past sessions with status and tutor notes."

---

## Page: `app/dashboard/sessions/page.tsx`

### Data query

```ts
const { data: sessions } = await supabase
  .from('sessions')
  .select(`
    id, scheduled_start_utc, status, tutor_notes,
    matches!match_id(
      meet_link,
      tutor:tutor_user_id(display_name),
      request:request_id(level, subjects!subject_id(name))
    )
  `)
  .order('scheduled_start_utc', { ascending: true })
```

### Two-tab or two-section layout

**Upcoming sessions** (status = `scheduled` or `rescheduled`, start time > now):
```
📅 Mon Feb 24, 2026 — 7:00 PM PKT
   Mathematics — A Levels | Tutor: Ali Hassan
   [Join Meet →]  [Reschedule →]
```

**Past sessions** (status = `done`, `no_show_student`, `no_show_tutor`; or start time < now):
```
✅ Wed Feb 19, 2026 — 7:00 PM PKT (Done)
   Mathematics — A Levels | Tutor: Ali Hassan
   Note: "Covered chapter 5 differentiation. Review chain rule."

❌ Mon Feb 17, 2026 — 7:00 PM PKT (Student No-show)
```

---

## Acceptance criteria

- [ ] `/dashboard/sessions` page exists with upcoming + past sections
- [ ] All times shown in student's timezone
- [ ] Status badge on each session (colour-coded from T8.3 SESSION_STATUS_COLOURS)
- [ ] Tutor notes shown for completed sessions
- [ ] "Join Meet" button on upcoming sessions
- [ ] "Reschedule" button on upcoming sessions (links to WhatsApp — T9.4)
- [ ] Empty state for each section ("No upcoming sessions" / "No past sessions yet")

---

## Definition of done

- [ ] `/dashboard/sessions/page.tsx` exists
- [ ] Upcoming and past sections render correctly
- [ ] Status badges and tutor notes displayed
- [ ] Timezone formatting applied

---

## References

- `docs/MVP.md` — section 10.1 (student dashboard — sessions list)
- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 9.2 (timezone display)
