## Parent epic

Epic E4: student/parent intake flow (P0) — #24

## User story

**As a parent or student**, after selecting my level and subject, I can describe my availability windows and learning goals — so that CorvEd can match me with a teacher whose schedule aligns with mine and who understands what I need help with.

---

## Background

From `docs/MVP.md` section 10.1 (student/parent requirements — requests):
> "goals (free text), availability (days + time windows), preferred start date (optional), timezone (auto from profile, editable)"

From `docs/OPS.md` section 4 Workflow A (intake):
> "collect: availability windows, timezone/city, goal (exam date/weak areas)"

Availability and goals are the second set of fields in the request form. Together with level + subject (S4.1), they give the admin everything needed to match the student to a tutor and propose a schedule.

---

## Acceptance criteria

- [ ] Form includes **availability windows** field — structured input or free text describing days and times (e.g., "Mon/Wed 6–8 PM PKT, Sat 10 AM–12 PM")
- [ ] Form includes **timezone** — select/text, pre-filled from `user_profiles.timezone`, editable
- [ ] Form includes **goals** — textarea: target grade, weak topics, upcoming exam date (optional but strongly encouraged)
- [ ] Form includes **preferred start date** — date picker, optional
- [ ] All availability + goals fields are in the same form as level/subject (single-page form or multi-step)
- [ ] Timezone is pre-filled from the user's profile (`user_profiles.timezone`)
- [ ] On submission, a `requests` row is created with `status = 'new'`
- [ ] `availability_windows` is stored as a JSONB array or free-text string in the request

---

## Availability field implementation

For MVP, a structured free-text approach is acceptable (easier to implement than a drag-and-drop calendar):

```
Availability (textarea):
  Placeholder: "e.g. Monday and Wednesday 6–8 PM, Saturday 10 AM–12 PM (PKT)"
```

Optional improvement: A day-of-week + time-range multi-select widget stored as JSONB:
```json
[
  { "day": 1, "start": "18:00", "end": "20:00" },
  { "day": 3, "start": "18:00", "end": "20:00" }
]
```

For MVP, free text stored in `availability_windows` as a string is sufficient. Upgrade to structured JSONB in a post-MVP sprint.

---

## Implementation notes

- **File**: Part of `app/dashboard/requests/new/page.tsx`
- `timezone` pre-filled from profile: fetch on page load using server client
- Store `availability_windows` as a text field in MVP (schema accepts `jsonb`, store as text JSON string for now)
- `goals` text is unrestricted; min length 10 characters recommended but not enforced for MVP
- `preferred_start_date` uses an HTML `<input type="date">`

---

## Dependencies

- **S4.1 (#25)** — level and subject selection is the first part of the same form
- **T4.1 (#27)** — implements both S4.1 and S4.2 in a single form component

---

## References

- `docs/MVP.md` — section 10.1 (student/parent requirements — availability, timezone, goals)
- `docs/ARCHITECTURE.md` — section 5.5 (requests table — availability_windows, timezone, goals columns)
- `docs/OPS.md` — section 4 Workflow A (minimum intake fields), section 6.2 (/intake quick reply)
