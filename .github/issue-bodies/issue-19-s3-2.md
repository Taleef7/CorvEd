## Parent epic

Epic E3: authentication and roles (P0) — #17

## User story

**As an admin**, I can assign, change, or remove roles (student, parent, tutor, admin) for any user — so that I can control what each person can access on the platform, including promoting a user to admin or approving a tutor account.

---

## Background

CorvEd has four roles: `student`, `parent`, `tutor`, `admin`. By default, every new signup receives the `student` role via the `handle_new_user()` trigger.

From `docs/MVP.md` section 3.1 (roles):
> "student: the learner. may sign up directly."
> "parent: may sign up and manage tutoring for their child."
> "tutor: teaches a subject at a given level."
> "admin: operates the service (matching, scheduling, payment verification, issue handling)."

From `docs/ARCHITECTURE.md` section 5.3:
> "`user_roles` supports multiple roles (admin can assign tutor+admin, etc.)"
> "`primary_role` drives UI routing (dashboard choice)"

Role management is admin-only. The `user_roles` table has admin-only write RLS policies. Roles cannot be self-assigned.

---

## Acceptance criteria

- [ ] Admin can navigate to a user list at `/admin` or a dedicated `/admin/users` screen
- [ ] Admin can view any user's current roles
- [ ] Admin can add a role to a user (e.g., change from `student` to `tutor`)
- [ ] Admin can remove a role from a user
- [ ] Admin can set the `primary_role` on a user's profile (controls dashboard routing)
- [ ] Role changes take effect immediately (next page load for the affected user reflects the new role)
- [ ] Admin cannot remove the last `admin` role from themselves (guard against lockout)
- [ ] Non-admin users cannot access the role management screen (route-protected)

---

## Roles matrix

| Role | Can assign | Can remove | Notes |
|------|-----------|------------|-------|
| `student` | ✅ admin | ✅ admin | Default on signup |
| `parent` | ✅ admin | ✅ admin | Change from student if user is a parent |
| `tutor` | ✅ admin | ✅ admin | Must be accompanied by T6.1/T6.2 tutor approval |
| `admin` | ✅ admin | ✅ admin | Guard: cannot remove self's last admin role |

---

## UI / implementation notes

- **File**: `app/admin/page.tsx` or a dedicated `app/admin/users/page.tsx`
- Use a Server Action (`/app/admin/actions.ts` or similar) that calls `lib/supabase/admin.ts` (service role client) to update `user_roles` and `user_profiles.primary_role`
- The service role key bypasses RLS, ensuring the admin can always update any user's roles
- Display the user list with: email, display name, current roles, last sign-in

---

## Dependencies

- **T3.1 (#20)** — Supabase Auth and `user_roles` table must exist
- **T3.4 (#23)** — implements the admin UI for this story

---

## References

- `docs/ARCHITECTURE.md` — section 5.3 (user_profiles + user_roles tables), section 6.4 (RLS for user_roles: admin only write)
- `docs/MVP.md` — section 3.1 (roles), section 10.3 (admin requirements)
- `docs/PRODUCT.md` — section 9.1 (tutor verification — admin approval required)
