## Goal

Build the tutor dashboard — the post-login view for approved tutors — showing their upcoming sessions, student details, Meet links, and a session completion form for marking attendance and submitting notes after each class.

---

## Why this matters

From `docs/MVP.md` section 10.2 (tutor requirements):
> "view upcoming sessions: date, time, student name, subject, Meet link. Mark session: done (with notes), no-show (student/tutor). View teaching history."

The tutor dashboard is what keeps tutors accountable and creates the session data that drives the student's `sessions_remaining` count. Without it, session completion cannot be tracked.

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S10.1 (#66) | Story | As a tutor, I can see my upcoming sessions | **open** |
| S10.2 (#67) | Story | As a tutor, I can submit session notes and mark attendance | **open** |
| T10.1 (#68) | Task | Tutor session list | **open** |
| T10.2 (#69) | Task | Session completion form (done + note) | **open** |
| T10.3 (#70) | Task | Attendance marking and auto-decrement remaining sessions | **open** |

---

## Tutor dashboard layout

```
/tutor — Tutor Dashboard

[Next Session Card]
  Student: Ahmed Ali | Mathematics A Levels
  📅 Mon Feb 24 at 7:00 PM PKT
  [Join Meet →]

[Upcoming Sessions List]       [Past Sessions (History)]
  …                              …
```

---

## Exit criteria (E10 is done when)

- [ ] Tutor can log in and see all their upcoming sessions at `/tutor`
- [ ] Each session shows: student name, subject/level, date/time in tutor's timezone, Meet link
- [ ] Tutor can mark a session as done with a short note
- [ ] Tutor can mark a session as student no-show
- [ ] Attendance marking decrements `packages.sessions_used` (for done + no_show_student)
- [ ] Tutor can view past sessions and their notes

---

## References

- `docs/MVP.md` — section 10.2 (tutor dashboard requirements)
- `docs/PRODUCT.md` — section 5.2 (tutor journey — steps 4–6: view sessions, conduct class, log attendance)
- `docs/ARCHITECTURE.md` — section 6.6 (tutor_update_session RPC), section 8.5 (session execution workflow)
- `docs/OPS.md` — section 4 Workflow E (day-of-class operations for tutor)
