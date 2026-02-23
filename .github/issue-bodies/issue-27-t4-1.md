## Parent epic

Epic E4: student/parent intake flow (P0) — #24

## Objective

Build the authenticated request creation form at `app/dashboard/requests/new/page.tsx` with all required fields, Zod validation, and a Supabase insert — saving the request as `status = 'new'` and redirecting to the confirmation screen.

Also create the Supabase migration for the `public.requests` table and its RLS policies.

---

## Background

From `docs/ARCHITECTURE.md` section 5.5 — the requests table:
```sql
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references public.user_profiles(user_id) on delete restrict,
  requester_role public.role_enum not null default 'student',
  for_student_name text,
  level public.level_enum not null,
  subject_id smallint not null references public.subjects(id),
  exam_board public.exam_board_enum not null default 'unspecified',
  goals text,
  timezone text not null default 'Asia/Karachi',
  availability_windows jsonb not null default '[]'::jsonb,
  preferred_start_date date,
  status public.request_status_enum not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.requests (status, created_at desc);
```

---

## Migration: `<ts>_create_requests_table.sql`

Include the table creation, indexes, and RLS policies from `docs/ARCHITECTURE.md` section 6.5:

```sql
create table public.requests ( ... ); -- schema above

alter table public.requests enable row level security;

create policy "requests_insert_self"
  on public.requests for insert to authenticated
  with check (created_by_user_id = auth.uid());

create policy "requests_select_creator_or_admin"
  on public.requests for select to authenticated
  using (created_by_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "requests_update_creator_limited"
  on public.requests for update to authenticated
  using (created_by_user_id = auth.uid() and status in ('new','payment_pending'))
  with check (created_by_user_id = auth.uid() and status in ('new','payment_pending'));

create policy "requests_admin_update"
  on public.requests for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
```

---

## Form fields and Zod schema

Create `lib/validators/request.ts`:

```ts
import { z } from 'zod'

export const requestSchema = z.object({
  requester_role: z.enum(['student', 'parent']),
  for_student_name: z.string().optional(),
  level: z.enum(['o_levels', 'a_levels']),
  subject_id: z.number().int().positive(),
  exam_board: z.enum(['cambridge', 'edexcel', 'other', 'unspecified']).default('unspecified'),
  goals: z.string().optional(),
  timezone: z.string().min(1),
  availability_windows: z.string().min(10, 'Please describe your availability'),
  preferred_start_date: z.string().optional(), // ISO date string from input[type=date]
})

export type RequestFormData = z.infer<typeof requestSchema>
```

---

## Page structure

`app/dashboard/requests/new/page.tsx`:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSchema, RequestFormData } from '@/lib/validators/request'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewRequestPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requester_role: 'student', exam_board: 'unspecified' }
  })

  const requesterRole = watch('requester_role')

  async function onSubmit(data: RequestFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: req, error } = await supabase.from('requests').insert([{
      created_by_user_id: user!.id,
      requester_role: data.requester_role,
      for_student_name: data.for_student_name,
      level: data.level,
      subject_id: data.subject_id,
      exam_board: data.exam_board,
      goals: data.goals,
      timezone: data.timezone,
      availability_windows: data.availability_windows,
      preferred_start_date: data.preferred_start_date || null,
      status: 'new',
    }]).select().single()

    if (error) throw error
    router.push(`/dashboard/requests/${req.id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* All fields from S4.1 and S4.2 */}
    </form>
  )
}
```

---

## Proposed steps

1. Create migration `<ts>_create_requests_table.sql` with table + RLS
2. Create `lib/validators/request.ts` with Zod schema
3. Create `app/dashboard/requests/new/page.tsx` with full form
4. Fetch subjects from Supabase on page load for the select dropdown
5. Pre-fill `timezone` from user profile
6. Handle `requester_role = 'parent'` → show `for_student_name` field
7. On submit → insert to `requests` → redirect to `/dashboard/requests/[id]`
8. Test: submit form → verify row in Supabase with `status = 'new'`

---

## Definition of done

- [ ] `supabase/migrations/<ts>_create_requests_table.sql` exists with table + RLS
- [ ] `lib/validators/request.ts` Zod schema covers all request fields
- [ ] `app/dashboard/requests/new/page.tsx` renders all fields
- [ ] Subjects fetched from `subjects` table (not hardcoded)
- [ ] Timezone pre-filled from user profile
- [ ] Successful submit creates request in Supabase and redirects to confirmation
- [ ] All required field validations work

---

## References

- `docs/ARCHITECTURE.md` — section 5.5 (requests table), section 6.4–6.5 (RLS for requests)
- `docs/MVP.md` — section 4.2 (subjects), section 10.1 (request fields), section 12.1 (status lifecycle)
