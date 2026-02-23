## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## Objective

Build the admin tutor directory at `/admin/tutors` — a filterable list of all tutors showing their approval status, subjects, levels, timezone, and availability — enabling the admin to quickly find eligible tutors when matching (E7).

---

## Background

From `docs/MVP.md` section 10.3 (admin requirements — matching):
> "view eligible tutors by: subject, level, timezone overlap / availability overlap"

From `docs/OPS.md` section 4 Workflow C:
> "pick tutor based on subject, level, availability, timezone compatibility"

The tutor directory is used in two contexts:
1. Standalone admin management (`/admin/tutors`) — approve/revoke, view details
2. Matching screen (E7 T7.2) — filtered list of eligible tutors for a specific request

This task covers the standalone directory. E7 reuses the same data and query patterns.

---

## Page: `app/admin/tutors/page.tsx`

### Data query

```ts
const { data: tutors } = await adminClient
  .from('tutor_profiles')
  .select(`
    tutor_user_id, approved, bio, timezone, created_at,
    user_profiles!tutor_user_id(display_name, whatsapp_number),
    tutor_subjects(subject_id, level, subjects(name)),
    tutor_availability(windows)
  `)
  .order('created_at', { ascending: false })
```

### Filter controls

```
[ Status: All | Pending | Approved ]
[ Subject: All | Math | Physics | Chemistry | ... ]
[ Level: All | O Levels | A Levels ]
```

Filters are applied client-side (small dataset for MVP) or via server-side query parameters.

---

## Tutor list table

| Name | Subjects | Levels | Timezone | Status | Actions |
|------|----------|--------|----------|--------|---------|
| Ali Hassan | Math, Physics | O, A | PKT | ⏳ Pending | [Approve] [View] |
| Sara Khan | Chemistry | A | PKT | ✅ Approved | [Revoke] [View] |

### Subject + level badge display

For each tutor, show subjects as grouped badges:
- "Math (O, A)" — if they teach both levels
- "Chemistry (A)" — if A Level only

---

## Tutor detail page: `app/admin/tutors/[id]/page.tsx`

Full profile read-only view for admin:
- Name, WhatsApp, timezone
- Approval status + Approve/Revoke button
- Bio
- All subjects × levels
- Availability windows in human-readable format

---

## Acceptance criteria

- [ ] `/admin/tutors` exists and lists all tutor profiles
- [ ] Filter by status (all / pending / approved) works
- [ ] Filter by subject works
- [ ] Filter by level works
- [ ] Each row shows: name, subjects+levels, timezone, approval status, actions
- [ ] "Approve" and "Revoke" buttons call Server Actions (T6.2)
- [ ] "View" links to `/admin/tutors/[id]` detail page
- [ ] Detail page shows full profile including WhatsApp number
- [ ] Page is accessible only to admins (via `app/admin/layout.tsx` — T3.2)

---

## Reusability for E7 matching

The tutor data query from this page is reused in E7 (T7.2) with additional filters:
- Filter by `approved = true` (only approved tutors are shown for matching)
- Filter by specific subject_id + level matching the student's request
- The UI in E7 is embedded in the matching screen, not a standalone page

Document the shared query pattern in `lib/services/matching.ts` to avoid duplication.

---

## Definition of done

- [ ] `/admin/tutors` page exists with tutor list + filters
- [ ] Approve/revoke actions work
- [ ] `/admin/tutors/[id]` detail page exists
- [ ] Query fetches subjects, levels, availability, and user profile in one call
- [ ] Filter by status, subject, level works

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor tables), section 3.2 (data access pattern)
- `docs/MVP.md` — section 10.3 (admin — eligible tutors by subject/level/availability)
- `docs/OPS.md` — section 4 Workflow C (matching criteria)
