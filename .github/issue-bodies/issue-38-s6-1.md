## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## User story

**As a tutor**, I can fill out an application form with my subjects, teaching levels, availability windows, and a short bio — so that CorvEd admin can review my profile and approve me to take students.

---

## Background

From `docs/MVP.md` section 10.2 (tutor requirements):
> "tutor can apply with: subjects (from allowed list), levels they teach (O/A), short bio, availability windows, timezone (default PKT)"

From `docs/OPS.md` section 4 Workflow C:
> "pick tutor based on subject, level, availability, timezone compatibility"

The tutor application captures exactly the data the admin needs to decide (1) whether to approve, and (2) which students to match the tutor with.

---

## Acceptance criteria

- [ ] Tutor can navigate to `/tutor/profile` (requires `tutor` role, or accessible from sign-up for new tutors)
- [ ] Form field: **Subjects taught** — multi-select from 9 MVP subjects (required, at least 1)
- [ ] Form field: **Levels** — checkboxes: O Levels / A Levels (required, at least 1)
- [ ] For each subject × level combination, the form captures the tutor's teaching capacity
- [ ] Form field: **Timezone** — select, default `Asia/Karachi`
- [ ] Form field: **Bio** — textarea, 2–5 sentences describing experience and teaching style (required)
- [ ] Form field: **Availability windows** — structured weekly availability (days + time ranges)
- [ ] On submit, creates `tutor_profiles` row with `approved = false` and populates `tutor_subjects` and `tutor_availability`
- [ ] Tutor sees a "pending approval" message after submission
- [ ] Tutor can return and update their profile/availability at any time

---

## Availability input

Structured availability input (preferred over free text for matching):

```tsx
// Weekly availability: each day can have one or more time windows
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// User selects day + start time + end time for each slot
// Stored as JSON: [{ "day": 1, "start": "18:00", "end": "20:00" }, ...]
```

For MVP, a simple table UI where the tutor checks available days and enters time ranges is sufficient.

---

## Implementation notes

- **File**: `app/tutor/profile/page.tsx`
- `tutor_subjects` rows: one row per (subject_id, level) combination the tutor teaches
- `tutor_availability.windows`: JSONB array with `{ day, start, end }` objects
- On first save, also insert `tutor_profiles` row with `approved = false`
- On updates: upsert pattern (delete existing `tutor_subjects` rows, re-insert)
- The admin must then approve the tutor (T6.2) before they appear in matching

---

## Dependencies

- **E3 T3.1 (#20)** — subjects table must exist; user must have `tutor` role assigned (via T3.4)
- **T6.1 (#40)** — full form implementation
- **T6.3 (#42)** — profile fields defined

---

## References

- `docs/MVP.md` — section 10.2 (tutor requirements), section 9.1 (approval gate)
- `docs/ARCHITECTURE.md` — section 5.4 (tutor_profiles, tutor_subjects, tutor_availability tables)
- `docs/OPS.md` — section 9 (tutor quality monitoring — fields needed for monitoring)
