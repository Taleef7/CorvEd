## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## Objective

Build the matching screen embedded in the request detail page (`/admin/requests/[id]`) that shows the request's details and a filtered list of eligible approved tutors — allowing the admin to select the right tutor and assign them.

---

## Background

From `docs/MVP.md` section 10.3:
> "view eligible tutors by: subject, level, timezone overlap / availability overlap"

From `docs/OPS.md` section 4 Workflow C:
> "pick tutor based on subject, level, availability, timezone compatibility"

The matching screen is a two-panel layout:
- **Left**: Request details (student, level, subject, goals, availability, timezone)
- **Right**: Eligible tutors (filtered by subject + level, approved only)

---

## Page: `app/admin/requests/[id]/page.tsx`

### Request details panel

Shows all request fields (level, subject, exam board, goals, availability, timezone, student name/WhatsApp).

### Eligible tutor list

```ts
// Filter: approved + matching subject + level
const { data: eligibleTutors } = await adminClient
  .from('tutor_subjects')
  .select(`
    tutor_user_id,
    tutor_profiles!inner(approved, bio, timezone, tutor_availability(windows)),
    user_profiles!tutor_user_id(display_name, whatsapp_number),
    subjects(name)
  `)
  .eq('subject_id', request.subject_id)
  .eq('level', request.level)
  .eq('tutor_profiles.approved', true)
```

### Tutor card in matching screen

For each eligible tutor:
```
┌─────────────────────────────────────────┐
│ Ali Hassan                               │
│ Timezone: Asia/Karachi (PKT)            │
│ Availability: Mon/Wed 6–9 PM, Sat AM   │
│ Bio: "5 years A Level Math..."          │
│ [Assign this tutor]                     │
└─────────────────────────────────────────┘
```

### Availability overlap hint

Compare tutor's `tutor_availability.windows` with request's `availability_windows` and highlight potential overlaps (optional MVP, but useful). If free-text, just display both side-by-side.

---

## Match assignment form

Once admin selects a tutor:

```
Selected tutor: Ali Hassan
Meet link: [https://meet.google.com/...] (text input)
Schedule timezone: [Select — defaults to student's timezone]
Days of week: ☑ Monday ☐ Tuesday ☑ Wednesday ...
Start time: [18:00]

[Assign Tutor]
```

All fields can be filled now or after initial assignment. The Meet link and schedule pattern are editable on the match detail page.

---

## Acceptance criteria

- [ ] `/admin/requests/[id]` shows request details (all fields)
- [ ] Eligible tutors are shown — filtered by `approved = true`, correct `subject_id` and `level`
- [ ] Each tutor card shows: name, timezone, availability summary, bio snippet
- [ ] Admin can select a tutor and see an assignment form (Meet link + schedule)
- [ ] Submitting the form calls `assignTutor` Server Action (T7.3)
- [ ] After assignment, the page shows the match record and "Generate Sessions" CTA

---

## Definition of done

- [ ] Request detail page exists at `/admin/requests/[id]`
- [ ] Eligible tutor list is filtered correctly
- [ ] Assignment form (tutor, meet link, schedule) is rendered
- [ ] `assignTutor` is called on submit

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor tables), section 5.6 (matches table), section 8.3 (matching workflow)
- `docs/OPS.md` — section 4 Workflow C
- `docs/MVP.md` — section 10.3 (admin — eligible tutors, assign tutor)
