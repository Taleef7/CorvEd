## Parent epic

Epic E4: student/parent intake flow (P0) — #24

## User story

**As a parent or student**, I can create a tutoring request by selecting my level (O Levels / A Levels) and the subject I need help with — so that CorvEd knows exactly what kind of tutoring I need and can match me with the right teacher.

---

## Background

From `docs/MVP.md` section 4.4 (student/parent requirements — requests):
> "Create request with: level (O/A), subject (single subject per request in MVP), optional exam board, goals (free text), availability (days + time windows), preferred start date (optional), timezone"

From `docs/ARCHITECTURE.md` section 5.5:
> "Requests are single-subject in MVP."

The form is intentionally scoped to one subject per request (locked MVP decision). If a student needs tutoring in multiple subjects, they submit multiple requests.

---

## Acceptance criteria

- [ ] Request form is accessible at `app/dashboard/requests/new/page.tsx` (requires authentication)
- [ ] Form field: **I am a** — radio: Student / Parent (required)
- [ ] Form field: **Child's name** — text (visible only when "Parent" selected, optional)
- [ ] Form field: **Level** — select: O Levels / A Levels (required)
- [ ] Form field: **Subject** — select from the 9 MVP subjects (required, single selection)
- [ ] Form field: **Exam board** — select: Cambridge / Edexcel / Other / Not sure (optional)
- [ ] On subject selection, the form shows the selected level + subject as a summary badge
- [ ] Submitting only this step does not save yet — all fields are part of the same multi-step form (or single long form)
- [ ] If the user has an existing request for the same subject + level that is still `new` or `payment_pending`, warn them before creating a duplicate

---

## Subject list (MVP)

The select dropdown pulls from the `public.subjects` table (seeded in E3 T3.1):

| Code | Display Name |
|------|-------------|
| math | Mathematics |
| physics | Physics |
| chemistry | Chemistry |
| biology | Biology |
| english | English |
| cs | Computer Science |
| pak_studies | Pakistan Studies |
| islamiyat | Islamiyat |
| urdu | Urdu |

Fetch subjects client-side from Supabase `subjects` table (public, no RLS needed for reads).

---

## Implementation notes

- **File**: `app/dashboard/requests/new/page.tsx`
- Form state managed with React Hook Form + Zod (reuse patterns from E2)
- Level and subject drive `level` and `subject_id` fields in the `requests` table
- `requester_role` is stored as `student` or `parent` based on the "I am a" selection
- `for_student_name` is stored only when `requester_role = 'parent'`

---

## Dependencies

- **E3 T3.1 (#20)** — subjects table must be seeded; user must be authenticated
- **T4.1 (#27)** — full form implementation (this story is implemented by T4.1)
- **S4.2 (#26)** — availability and goals are the second half of the same form

---

## References

- `docs/MVP.md` — section 4.2 (subjects), section 4.4 (student/parent requirements — requests), section 12.1 (request status)
- `docs/ARCHITECTURE.md` — section 5.5 (requests table schema)
- `docs/PRODUCT.md` — section 5.1 step 3 (submit request)
