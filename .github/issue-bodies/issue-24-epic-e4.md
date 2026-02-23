## Goal

Build the authenticated tutoring request creation flow — allowing a student or parent to submit a formal tutoring request by specifying their level, subject, availability windows, goals, and preferred start date. This is the first data-capture step inside the platform for authenticated users, bridging from lead (E2) to a real request record that admins can act on.

---

## Why this matters

Every tutoring engagement starts with a request. From `docs/MVP.md` section 4.4:
> "Student/Parent — create tutoring requests (level + subject + goals + availability)"

From `docs/ARCHITECTURE.md` section 8.2 (request creation workflow):
> "student/parent submits request (single subject) → request inserted with status = new → user selects package → payment created"

Without a working request form, admins have no structured data to match against, and the entire flow from E5 (packages/payments) through E8 (scheduling) cannot begin.

---

## Stack context

| Layer | Choice |
|-------|--------|
| Route | `app/dashboard/requests/new/page.tsx` |
| Form | React Hook Form + Zod |
| Storage | Supabase `requests` table |
| Auth | Requires authenticated session |

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S4.1 (#25) | Story | As a parent/student, I can create a tutoring request by selecting level and subjects | **open** |
| S4.2 (#26) | Story | As a parent/student, I can provide availability and goals | **open** |
| T4.1 (#27) | Task | Request form fields (all required + optional fields) | **open** |
| T4.2 (#28) | Task | Request confirmation screen + "we'll match you soon" | **open** |
| T4.3 (#29) | Task | Request status lifecycle and status display | **open** |

---

## Request data model (from `docs/ARCHITECTURE.md` section 5.5)

```
requests:
  id, created_by_user_id
  requester_role (student | parent)
  for_student_name (if parent)
  level (o_levels | a_levels)
  subject_id → subjects table
  exam_board (cambridge | edexcel | other | unspecified)
  goals (text)
  timezone, availability_windows (jsonb)
  preferred_start_date (date, optional)
  status (new | payment_pending | ready_to_match | matched | active | paused | ended)
```

---

## Status lifecycle (from `docs/MVP.md` section 12.1)

```
new → payment_pending → ready_to_match → matched → active → paused → ended
```

- `new`: request submitted, payment not yet initiated
- `payment_pending`: user selected a package and submitted payment (transitions in E5)
- `ready_to_match`: admin marked payment as paid
- `matched`: admin assigned a tutor
- `active`: sessions are generated and running
- `paused`, `ended`: admin-managed lifecycle states

---

## Exit criteria (E4 is done when)

- [ ] Authenticated student/parent can navigate to "New Request" and complete the form
- [ ] Request is created in Supabase with `status = 'new'`
- [ ] User is shown a confirmation screen after submission
- [ ] User can see their request status on the dashboard (`/dashboard/requests/[id]`)
- [ ] Request status transitions correctly through the lifecycle (at least `new → payment_pending`)
- [ ] Form validates all required fields before submission
- [ ] Requests table exists with correct RLS (creator can insert and read own requests)

---

## References

- `docs/ARCHITECTURE.md` — section 5.5 (requests table schema), section 6.4–6.5 (RLS for requests), section 8.2 (request creation workflow)
- `docs/MVP.md` — section 4 (scope), section 10.1 (student/parent requirements — requests), section 12.1 (request status lifecycle)
- `docs/PRODUCT.md` — section 5.1 steps 3–4 (submit request, select package)
- `docs/ROADMAP.md` — Sprint 1 (request creation)
