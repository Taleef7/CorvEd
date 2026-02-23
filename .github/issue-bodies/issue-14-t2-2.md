## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## Objective

Build the intake form component that collects prospective student/parent information from the landing page. The form must work **without login** for Phase 0 concierge operations, where leads are submitted and followed up manually via WhatsApp.

---

## Background

In Phase 0 (concierge validation), CorvEd needs to collect qualified lead information before the full auth + request system (E3–E4) is available. The intake form bridges that gap.

From `docs/OPS.md` section 4 Workflow A:

> "Trigger: someone messages CorvEd or fills website intake form.  
> Steps: collect minimum intake: who, level, subject, goal, timezone/city, availability windows"

The form should collect exactly these fields so that an admin can process the lead via WhatsApp without needing to ask follow-up questions.

---

## Form fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full name | text input | ✅ | Min 2 characters |
| WhatsApp number | text input | ✅ | Primary contact method; accept `03xx`, `+923xx` |
| I am a | radio | ✅ | "Student" or "Parent" |
| Child's name | text input | ❌ | Show only when "Parent" is selected |
| Level | select | ✅ | "O Levels" / "A Levels" |
| Subject | select | ✅ | All 9 MVP subjects |
| Exam board | select | ❌ | Cambridge / Edexcel / Other / Not sure |
| Availability | textarea | ✅ | Free text: days + time windows + timezone |
| City / Timezone | text input | ✅ | e.g., "Lahore, PKT" or "Toronto, EST" |
| Goals | textarea | ❌ | Target grade, weak areas, exam date |
| Preferred package | radio | ❌ | 8 / 12 / 20 sessions/month |

---

## Validation rules (Zod schema)

Create the Zod schema in `lib/validators/lead.ts`:

```ts
import { z } from 'zod'

export const leadSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp_number: z
    .string()
    .min(9, 'Enter a valid WhatsApp number')
    .regex(/^[+\d][\d\s\-()]{7,}$/, 'Enter a valid phone number'),
  role: z.enum(['student', 'parent']),
  child_name: z.string().optional(),
  level: z.enum(['o_levels', 'a_levels']),
  subject: z.enum([
    'math', 'physics', 'chemistry', 'biology', 'english',
    'cs', 'pak_studies', 'islamiyat', 'urdu'
  ]),
  exam_board: z.enum(['cambridge', 'edexcel', 'other', 'not_sure']).optional(),
  availability: z.string().min(10, 'Please describe your availability'),
  city_timezone: z.string().min(2, 'Please enter your city or timezone'),
  goals: z.string().optional(),
  preferred_package: z.enum(['8', '12', '20']).optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
```

---

## Component structure

Create `components/LeadForm.tsx`:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadSchema, LeadFormData } from '@/lib/validators/lead'
import { createClient } from '@/lib/supabase/client'

export function LeadForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const role = watch('role')

  async function onSubmit(data: LeadFormData) {
    const supabase = createClient()
    const { error } = await supabase.from('leads').insert([data])
    if (error) throw error
  }

  if (isSubmitSuccessful) {
    return (
      <div>
        <h3>Request received ✅</h3>
        <p>We'll contact you on WhatsApp within a few hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Fields listed above */}
      {/* Show child_name field only when role === 'parent' */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
```

---

## Database dependency

This form inserts into a `leads` table (see T2.3 (#15) for table schema). For MVP, a `leads` table is preferred over `requests` because:
- It does not require an authenticated user
- It is a pre-auth qualification step
- A request in the `requests` table is created later when the student creates an account (E4)

---

## UX requirements

- Show inline validation errors below each field as the user types (use `react-hook-form` field state)
- "Child's name" field must appear/disappear instantly when role radio changes (no page reload)
- Submit button shows loading state during submission
- Success state replaces the form with a confirmation message (no redirect)
- Error state shows a generic error message: "Something went wrong. Please try again or message us on WhatsApp."

---

## Dependencies

| Dependency | Why |
|------------|-----|
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | Zod integration for react-hook-form |
| `zod` | Input validation |
| `T2.3 (#15)` | `leads` table must exist in Supabase before this form can insert |
| `E1 T1.1 (#6)` | `lib/supabase/client.ts` must exist |

Check for `react-hook-form`, `@hookform/resolvers`, and `zod` in `package.json`; install if missing:

```bash
npm install react-hook-form @hookform/resolvers zod
```

---

## Proposed steps

1. Add Zod schema to `lib/validators/lead.ts`
2. Create `components/LeadForm.tsx` with all form fields
3. Wire up Supabase insert in form submit handler
4. Add conditional render for `child_name` field
5. Add success and error states
6. Embed `<LeadForm />` into `app/page.tsx` at the `id="intake"` anchor
7. Test on mobile viewport (375px): verify all inputs are accessible
8. Test form submission: verify data appears in Supabase `leads` table

---

## Definition of done

- [ ] `lib/validators/lead.ts` exists with the Zod schema above
- [ ] `components/LeadForm.tsx` exists and renders all form fields
- [ ] Child name field shows/hides based on role selection
- [ ] All required field validations work (inline errors shown)
- [ ] Form submission inserts a row in the `leads` table in Supabase (see T2.3 (#15) for table schema)
- [ ] Success state is shown after submission (form replaced with confirmation)
- [ ] Form is mobile-responsive (375px)
- [ ] `react-hook-form`, `@hookform/resolvers`, and `zod` are in `package.json`

---

## References

- `docs/OPS.md` — section 4 Workflow A (intake fields), section 6.2 (/intake quick reply)
- `docs/MVP.md` — section 10.1 (student/parent requirements — request fields)
- `docs/PRODUCT.md` — section 5.1 step 3 (submit request)
- `docs/ARCHITECTURE.md` — section 5.5 (requests schema — reference for lead field names)
