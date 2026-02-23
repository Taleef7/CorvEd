## Goal

Build the tutor onboarding flow — allowing tutors to apply with their subjects, levels, availability, and bio — and the admin approval workflow that verifies tutors before they can be matched with students. Also build the admin tutor directory for filtering eligible tutors during matching.

---

## Why this matters

CorvEd is not an open marketplace. Tutors must be admin-approved before they can be assigned to any student. From `docs/MVP.md` section 9.1:
> "admin approval required. Tutors can apply, but cannot be assigned until approved. Maintain backups for high-demand subjects."

From `docs/PRODUCT.md` section 3.1:
> "verified teachers (curated supply, not random marketplace)"

Without a working tutor onboarding and approval flow, the admin has no approved tutor pool to match against, and E7 (matching) cannot function.

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S6.1 (#38) | Story | As a tutor, I can apply with my subjects and availability | **open** |
| S6.2 (#39) | Story | As an admin, I can approve tutors and mark them verified | **open** |
| T6.1 (#40) | Task | Tutor application form (subjects, levels, availability, bio) | **open** |
| T6.2 (#41) | Task | Tutor approval workflow (pending → approved) | **open** |
| T6.3 (#42) | Task | Tutor profile fields (subjects, levels, experience, online mode) | **open** |
| T6.4 (#43) | Task | Admin tutor list + filter by subject/availability | **open** |

---

## Data model (from `docs/ARCHITECTURE.md` section 5.4)

```
tutor_profiles:
  tutor_user_id, approved (bool), bio, timezone

tutor_subjects:
  tutor_user_id, subject_id, level (o_levels | a_levels)

tutor_availability:
  tutor_user_id, windows (jsonb)
  -- format: [{ "day": 1, "start": "18:00", "end": "20:00" }, ...]
```

---

## Tutor journey (from `docs/PRODUCT.md` section 5.2)

1. Tutor applies or is pre-added by admin
2. Submits subjects, levels, availability, bio
3. Awaits admin approval
4. Once approved: available for matching (E7)
5. Assigned to student request → tutor confirms schedule
6. Recurring sessions → tutor marks attendance (E10)

---

## Exit criteria (E6 is done when)

- [ ] Tutor can navigate to `/tutor/profile` and fill in their application
- [ ] Application creates `tutor_profiles` row with `approved = false`
- [ ] Admin can view pending tutors at `/admin/tutors`
- [ ] Admin can approve a tutor (sets `approved = true`)
- [ ] Approved tutors appear in the matching filter in E7
- [ ] Tutor can update their availability and subjects after initial setup
- [ ] Admin tutor list can be filtered by subject and level

---

## Migration requirements

Create migrations for:
- `public.tutor_profiles` (section 5.4 of ARCHITECTURE.md)
- `public.tutor_subjects`
- `public.tutor_availability`
- RLS policies for all three tables

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor_profiles, tutor_subjects, tutor_availability), section 6.4 (RLS for tutor tables)
- `docs/MVP.md` — section 9.1 (tutor verification), section 10.2 (tutor requirements)
- `docs/PRODUCT.md` — section 5.2 (tutor journey), section 9.1 (trust and quality)
- `docs/OPS.md` — section 9 (tutor quality monitoring), section 4 Workflow C (matching → tutor confirmation)
