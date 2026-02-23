## Parent epic

Epic E3: authentication and roles (P0) — #17

## Objective

Implement role-based route protection via Next.js middleware and a role-aware dashboard redirect, ensuring that:
- Unauthenticated users cannot access any protected routes
- Authenticated users land on the correct dashboard based on their `primary_role`
- Admin routes (`/admin/**`) are inaccessible to non-admins even when authenticated

---

## Background

From `docs/ARCHITECTURE.md` section 3.3:
> "app/admin/* pages call Server Actions that use SUPABASE_SERVICE_ROLE_KEY (never exposed)"

From section 3.2:
> "browser reads and writes only where RLS allows using anon key session"

Route protection has two layers:
1. **Middleware** — fast, edge-level check that prevents unauthenticated access to any protected path
2. **Dashboard page** — server-rendered check that reads the user's role and redirects to the appropriate dashboard

---

## Route protection matrix

| Route prefix | Allowed roles | Unauthenticated | Wrong role |
|---|---|---|---|
| `/dashboard/**` | `student`, `parent` | → `/auth/sign-in` | → appropriate dashboard |
| `/tutor/**` | `tutor` | → `/auth/sign-in` | → `/dashboard` |
| `/admin/**` | `admin` | → `/auth/sign-in` | → `/dashboard` |
| `/auth/**` | public | authenticated → `/dashboard` | — |
| `/` (landing) | public | shown | — |

---

## Middleware (route guard)

The middleware created in T3.1 (#20) handles the **unauthenticated → redirect to sign-in** case.

For **role-based redirects within protected areas**, implement checks in the page Server Components:

```ts
// app/admin/layout.tsx (or page.tsx)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const admin = createAdminClient()
  const { data: roles } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const isAdmin = roles?.some(r => r.role === 'admin') ?? false
  if (!isAdmin) redirect('/dashboard')

  return <>{children}</>
}
```

Apply the same pattern for `/tutor/layout.tsx` (check for `tutor` role).

---

## Dashboard role-aware redirect

`app/dashboard/page.tsx` reads `primary_role` and redirects:

```ts
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('primary_role')
    .eq('user_id', user.id)
    .single()

  const role = profile?.primary_role ?? 'student'

  if (role === 'admin') redirect('/admin')
  if (role === 'tutor') redirect('/tutor')

  // student / parent → student dashboard (rendered here in E9)
  return <div>Student dashboard (E9)</div>
}
```

---

## Acceptance criteria

- [ ] Visiting `/dashboard` when not logged in redirects to `/auth/sign-in?next=/dashboard`
- [ ] Visiting `/tutor` when not logged in redirects to `/auth/sign-in`
- [ ] Visiting `/admin` when not logged in redirects to `/auth/sign-in`
- [ ] Admin user visiting `/dashboard` is redirected to `/admin`
- [ ] Tutor user visiting `/dashboard` is redirected to `/tutor`
- [ ] Student visiting `/admin` is redirected to `/dashboard` (not shown a 403 or blank page)
- [ ] Logged-in user visiting `/auth/sign-in` is redirected to `/dashboard`
- [ ] Role check uses server-side Supabase client (cookies) — not client-side state

---

## Proposed steps

1. Confirm middleware in `middleware.ts` (from T3.1) is protecting all protected paths
2. Create `app/dashboard/page.tsx` with role-aware redirect logic
3. Create `app/admin/layout.tsx` with admin role check
4. Create `app/tutor/layout.tsx` with tutor role check
5. Test all redirect scenarios manually (unauthenticated, wrong role, correct role)
6. Verify middleware handles the `/auth/**` redirect for already-logged-in users

---

## Definition of done

- [ ] `middleware.ts` correctly redirects unauthenticated requests for protected paths
- [ ] `app/dashboard/page.tsx` reads `primary_role` and redirects admin/tutor to their dashboards
- [ ] `app/admin/layout.tsx` verifies admin role server-side
- [ ] `app/tutor/layout.tsx` verifies tutor role server-side
- [ ] All redirect scenarios pass manual testing

---

## References

- `docs/ARCHITECTURE.md` — section 3.2 (data access pattern), section 3.3 (route handlers / server actions)
- `docs/MVP.md` — section 3.1 (roles), section 10.3 (admin requirements)
