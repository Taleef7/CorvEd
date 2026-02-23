## Parent epic

Epic E3: authentication and roles (P0) — #17

## Objective

Build an admin-only screen at `/admin` (or `/admin/users`) where the admin can view all users, see their current roles, and assign or remove roles — enabling the platform to control who is a tutor, who is an admin, and which account is a parent vs student.

---

## Background

From `docs/ARCHITECTURE.md` section 6.4 (RLS for user_roles):
> "insert/update/delete: admin only"

From `docs/MVP.md` section 10.3 (admin requirements):
> "Matching — view eligible tutors by subject/level/timezone overlap"

The admin needs to manage user roles to:
- Promote a newly signed-up tutor to the `tutor` role (alongside E6 tutor approval)
- Promote a trusted user to `admin`
- Change `primary_role` when a user should use a different dashboard

---

## UI structure

**File**: `app/admin/users/page.tsx`

This is a Server Component that fetches all user profiles using the admin client (bypasses RLS):

```ts
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminUsersPage() {
  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('user_profiles')
    .select('user_id, display_name, whatsapp_number, timezone, primary_role, created_at')
    .order('created_at', { ascending: false })

  const { data: roles } = await admin
    .from('user_roles')
    .select('user_id, role')

  // Group roles by user_id
  // ...
}
```

---

## Table columns

| Column | Description |
|--------|-------------|
| Name | `display_name` |
| Primary role | `primary_role` (shown as badge) |
| All roles | Comma-separated list of roles from `user_roles` |
| WhatsApp | `whatsapp_number` |
| Joined | `created_at` formatted in admin timezone |
| Actions | "+ Role" and "× Role" buttons |

---

## Role assignment (Server Action)

Create a Server Action in `app/admin/actions.ts`:

```ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function assignRole(userId: string, role: string) {
  const admin = createAdminClient()
  await admin.from('user_roles').upsert({ user_id: userId, role })
  revalidatePath('/admin/users')
}

export async function removeRole(userId: string, role: string) {
  const admin = createAdminClient()
  await admin.from('user_roles').delete().eq('user_id', userId).eq('role', role)
  revalidatePath('/admin/users')
}

export async function setPrimaryRole(userId: string, primaryRole: string) {
  const admin = createAdminClient()
  await admin.from('user_profiles').update({ primary_role: primaryRole }).eq('user_id', userId)
  revalidatePath('/admin/users')
}
```

---

## Safety guard: cannot remove own last admin role

In `removeRole`, check if the actor is removing their own `admin` role and if they have no other admin:

```ts
// Before deleting admin role:
if (role === 'admin') {
  const { count } = await admin
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  if ((count ?? 0) <= 1) {
    throw new Error('Cannot remove the last admin role')
  }
}
```

---

## Acceptance criteria

- [ ] `/admin/users` page exists and is server-rendered
- [ ] Page is accessible only to users with `admin` role (redirect non-admins to `/dashboard`)
- [ ] Lists all users with: display name, primary role badge, all assigned roles, WhatsApp, joined date
- [ ] "+ Role" button opens a small form/dropdown to assign a new role
- [ ] "× Role" button removes a role from a user
- [ ] "Set primary" action updates `user_profiles.primary_role`
- [ ] Safety guard prevents removing the last `admin` role
- [ ] Page uses `createAdminClient()` (service role — bypasses RLS)
- [ ] Server Actions handle role changes and call `revalidatePath`

---

## Definition of done

- [ ] `app/admin/users/page.tsx` exists and fetches all users via admin client
- [ ] Role assignment and removal work via Server Actions
- [ ] `setPrimaryRole` updates `user_profiles.primary_role`
- [ ] Admin lockout guard is implemented
- [ ] Non-admin users are redirected (from `app/admin/layout.tsx` — T3.2)
- [ ] Mobile-responsive table or card list

---

## Dependencies

- **T3.1 (#20)** — `user_profiles`, `user_roles` tables and helper functions must exist
- **T3.2 (#21)** — `app/admin/layout.tsx` must protect this route

---

## References

- `docs/ARCHITECTURE.md` — section 5.3 (user_profiles + user_roles schema), section 6.4 (RLS intent for user_roles)
- `docs/MVP.md` — section 10.3 (admin requirements), section 3.1 (roles)
