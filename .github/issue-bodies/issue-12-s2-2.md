## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## User story

**As a parent or student**, I can fill out a short intake form on the landing page and submit my tutoring request — without needing to create an account first — so that CorvEd can contact me and begin the matching process.

---

## Background

During Phase 0 (concierge validation), CorvEd operates as a manually-matched service. The intake form is the primary mechanism for collecting qualified lead information before the full auth + request flow (E3–E4) is built.

From `docs/OPS.md` section 4, Workflow A (inbound lead → qualified request), the minimum intake required is:
- who: student or parent
- level: O or A
- subject
- goal (exam date / weak areas)
- timezone / city
- availability windows

From `docs/OPS.md` section 6.2 (/intake quick reply), the exact fields are:
1. Student or Parent?
2. Level: O Levels or A Levels
3. Subject
4. Exam board (Cambridge / Edexcel / Other) — optional
5. Availability (days + time windows) + timezone
6. Goal (target grade, weak topics, exam date)

The intake form on the landing page should capture these same fields so that admins receive complete information via database + notification, enabling them to follow up via WhatsApp without additional back-and-forth.

---

## Acceptance criteria

- [ ] Intake form is embedded on the landing page (no separate page required for MVP)
- [ ] Form includes the following fields:
  - **Full name** (text, required)
  - **WhatsApp number** (text, required) — used for follow-up
  - **I am a** (radio: Student / Parent, required)
  - **Child's name** (text, visible only when "Parent" is selected, optional)
  - **Level** (select: O Levels / A Levels, required)
  - **Subject** (select from 9 MVP subjects, required)
  - **Exam board** (select: Cambridge / Edexcel / Other / Not sure, optional)
  - **Availability** (textarea: days and time windows, required) — e.g., "Mon/Wed 6–8 PM PKT"
  - **City / Timezone** (text, required) — e.g., "Lahore (PKT)" or "Toronto (EST)"
  - **Goals** (textarea: target grade, weak areas, exam date, optional but recommended)
  - **Preferred package** (radio: 8 / 12 / 20 sessions/month, optional)
- [ ] Client-side validation using Zod (required fields must not be empty)
- [ ] On successful submission, the user sees a **confirmation message**: "We've received your request and will contact you on WhatsApp within a few hours."
- [ ] Form submission is **disabled after successful submit** (prevent duplicate submissions)
- [ ] Form data is saved to Supabase (see T2.3 for storage details)
- [ ] Admin receives notification of new submission (see T2.3)
- [ ] Form is usable on mobile (all inputs accessible without horizontal scroll)

---

## Field validation rules

| Field | Rule |
|-------|------|
| Full name | Required, min 2 characters |
| WhatsApp number | Required, must start with `+` or be 10–15 digits |
| Role | Required, must be "student" or "parent" |
| Level | Required, must be "o_levels" or "a_levels" |
| Subject | Required, must be one of 9 MVP subject codes |
| Availability | Required, min 10 characters |
| City / Timezone | Required, min 2 characters |

---

## Implementation notes

- **File**: `app/page.tsx` (inline form component) or `components/LeadForm.tsx` (extracted)
- Use React Hook Form with Zod resolver for validation
- Use Supabase browser client (`lib/supabase/client.ts`) to insert the lead
- The `leads` table (or reuse `requests` table if schema is ready) — see T2.3 for schema decision
- This form should work **without login**. Use the Supabase anon key for unauthenticated inserts with RLS allowing public insert to the leads table
- WhatsApp number field should auto-format or accept any of: `03xx`, `+923xx`, `923xx`

---

## Proposed steps

1. Create `components/LeadForm.tsx` with React Hook Form + Zod
2. Add Zod schema for lead form to `lib/validators/lead.ts` (or `request.ts`)
3. Wire up Supabase insert on form submit (see T2.3 for table name)
4. Add success/error states to the form
5. Embed `<LeadForm />` into `app/page.tsx`
6. Test on mobile viewport (375px)

---

## Dependencies

- **T2.1 (#13)** — landing page must exist before the form can be embedded
- **T2.3 (#15)** — `leads` table in Supabase must exist before form can insert data
- **E1 T1.1 (#6)** — `lib/supabase/client.ts` must exist

---

## References

- `docs/MVP.md` — section 10.1 (student/parent functional requirements — request fields)
- `docs/OPS.md` — section 4 Workflow A, section 6.2 (/intake quick reply template)
- `docs/PRODUCT.md` — section 5.1 step 3 (submit request fields)
- `docs/ARCHITECTURE.md` — section 5.5 (requests table schema — use as reference for lead fields)
