## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## Objective

Define and document all tutor profile fields — subjects, levels, bio, experience, timezone, and availability — and ensure these are displayed correctly on the tutor's own profile page and in the admin tutor detail view.

---

## Background

From `docs/MVP.md` section 10.2 (tutor requirements):
> "tutor can apply with: subjects (from allowed list), levels they teach (O/A), short bio, availability windows, timezone (default PKT)"

From `docs/ARCHITECTURE.md` section 5.4:
- `tutor_profiles`: `approved`, `bio`, `timezone`
- `tutor_subjects`: `(tutor_user_id, subject_id, level)` — one row per subject×level
- `tutor_availability`: `windows` (JSONB)

---

## Profile fields

| Field | DB Table | Column | Display |
|-------|----------|--------|---------|
| Name | `user_profiles` | `display_name` | Read-only (from auth) |
| WhatsApp | `user_profiles` | `whatsapp_number` | Admin-only view |
| Timezone | `tutor_profiles` | `timezone` | Editable |
| Bio | `tutor_profiles` | `bio` | Editable, shown in admin matching |
| Approved | `tutor_profiles` | `approved` | Admin-only, shown as badge |
| Subjects + Levels | `tutor_subjects` | `subject_id + level` | Multi-select, editable |
| Availability | `tutor_availability` | `windows` | Structured, editable |

---

## Tutor profile view (`/tutor/profile`)

The tutor sees their own profile in read/edit mode:

### Display (read mode)

```
Name: Ali Hassan
Timezone: Asia/Karachi (PKT)
Status: ⏳ Pending approval

Subjects:
  • Mathematics — O Levels, A Levels
  • Physics — A Levels

Availability:
  Monday   6:00 PM – 9:00 PM
  Wednesday 6:00 PM – 9:00 PM
  Saturday 10:00 AM – 1:00 PM

Bio: "I have 5 years of experience teaching A Level Mathematics..."
```

### Edit mode

The same page with editable fields. On save, upserts `tutor_profiles`, `tutor_subjects`, `tutor_availability`.

---

## Admin tutor detail view

When admin views a tutor's full profile:
- All fields above
- Approval status + approve/revoke button
- WhatsApp number (for follow-up)
- Match history (future — not MVP)
- Incident count (future — not MVP)

---

## Acceptance criteria

- [ ] Tutor profile page at `/tutor/profile` shows all fields (name, bio, subjects, levels, availability, status)
- [ ] "Pending approval" badge visible when `approved = false`
- [ ] "Approved" badge visible when `approved = true`
- [ ] All fields can be edited and saved (except `approved` — admin-only)
- [ ] Admin viewing tutor detail at `/admin/tutors/[id]` sees full profile including WhatsApp number
- [ ] Availability windows displayed in a human-readable format (not raw JSON)

---

## Availability display helper

```ts
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatAvailability(windows: { day: number; start: string; end: string }[]) {
  return windows.map(w => `${DAY_NAMES[w.day]}: ${w.start} – ${w.end}`).join(', ')
}
```

---

## Definition of done

- [ ] Tutor profile page shows all fields
- [ ] Approval status badge is visible
- [ ] Availability displayed in human-readable format
- [ ] Admin tutor detail page shows full profile

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor_profiles, tutor_subjects, tutor_availability)
- `docs/MVP.md` — section 10.2 (tutor requirements)
