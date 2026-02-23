## Parent epic

Epic E10: tutor dashboard and session notes (P0) — #65

## User story

**As a tutor**, after completing a class, I can open the session in my dashboard, mark it as "done" or "student no-show", and add a short note — so that the student can see what was covered, the admin has a record, and the session is accurately deducted from the package.

---

## Background

From `docs/MVP.md` section 10.2:
> "mark session: done (with notes), no-show (student). View teaching history."

From `docs/OPS.md` section 4 Workflow E (day-of-class):
> "after class: tutor logs attendance (done / no_show_student) with optional note."

---

## Acceptance criteria

- [ ] Each session card shows a "Mark Complete" or "Mark No-show" button (for upcoming/current sessions)
- [ ] Clicking "Mark Complete" opens a small form: status selection + notes textarea
- [ ] Clicking "Mark No-show (Student)" marks the session `no_show_student` with optional note
- [ ] Tutor can only mark sessions for matches where they are the assigned tutor
- [ ] After marking, the session shows updated status badge and tutor note
- [ ] Session marking is only available for sessions with `status = 'scheduled'` or `'rescheduled'`
- [ ] Past sessions with `status = 'done'` show the note in read-only mode

---

## Session completion form UI

```
Mark Session Complete
─────────────────────
Status: ○ Done  ○ Student No-show  ○ Tutor No-show

Session notes (optional):
[Covered differentiation chain rule. Student struggles with negative exponents. 
Assigned exercises 5.3 a-d for practice.]

[Submit]
```

---

## Dependencies

- **T10.3 (#70)** — implements attendance marking and package decrement
- **E8 T8.3 (#56)** — session status update mechanism

---

## References

- `docs/MVP.md` — section 10.2 (tutor requirements — mark session, add notes)
- `docs/OPS.md` — section 4 Workflow E (day-of-class — tutor logs attendance)
