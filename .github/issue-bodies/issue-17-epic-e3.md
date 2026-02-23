## Goal

Implement Supabase Auth (email/password + Google OAuth) with email verification enforcement, user profile creation on signup, role-based access control (student / parent / tutor / admin), and role-aware dashboard routing — so that every user type can securely access only the features they are permitted to use.

This epic is the security and identity bedrock of the entire platform. Every subsequent epic (E4–E12) assumes that auth and roles are in place.

---

## Why this matters

CorvEd has four distinct user roles with completely different permissions:
- **Students/parents** submit requests and view their own sessions
- **Tutors** view their assigned sessions and submit notes
- **Admins** manage the entire platform (payments, matching, scheduling)

Without proper auth and RLS, any user could read or modify any data. Without role-based routing, users land on the wrong dashboards.

---

## Stack context

| Layer | Choice |
|-------|--------|
| Auth provider | Supabase Auth |
| Email/password | Supabase built-in with email confirmation required |
| Google OAuth | Supabase Google provider |
| SSR auth | `@supabase/ssr` (browser + server clients) |
| Session cookies | Managed by `@supabase/ssr` middleware |
| Role storage | `public.user_roles` table |
| Route protection | Next.js middleware + server-side auth checks |

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S3.1 (#18) | Story | As a user, I can sign up/login with email/password or Google | **open** |
| S3.2 (#19) | Story | As an admin, I can assign roles (student/parent/tutor/admin) | **open** |
| T3.1 (#20) | Task | Auth setup (Supabase Auth, middleware, callback route) | **open** |
| T3.2 (#21) | Task | Role-based route protection (student vs tutor vs admin) | **open** |
| T3.3 (#22) | Task | Basic profile fields (name, WhatsApp number, timezone) | **open** |
| T3.4 (#23) | Task | Admin-only user role management screen | **open** |

---

## Pages and routes (this epic)

```
app/
  auth/
    sign-in/page.tsx        ← email/password login + Google button
    sign-up/page.tsx        ← registration form
    callback/route.ts       ← Supabase OAuth callback handler (PKCE)
    verify/page.tsx         ← post-signup "check your email" screen
  dashboard/
    page.tsx                ← role-aware redirect (student / tutor / admin)
```

**Middleware** (`middleware.ts` at project root): Intercepts all requests, refreshes Supabase session cookie, protects `/dashboard/**`, `/tutor/**`, and `/admin/**` routes.

---

## Auth flows

### Email/password signup
1. User fills sign-up form (display name, email, password, timezone)
2. Supabase sends verification email
3. User lands on `auth/verify` page: "Check your email and click the confirmation link"
4. User clicks link → Supabase confirms → redirects to `auth/callback`
5. Callback exchanges code → session created → redirect to `/dashboard`

### Google OAuth
1. User clicks "Sign in with Google" on sign-in or sign-up page
2. Supabase redirects to Google consent
3. Google redirects to `auth/callback?code=...`
4. Callback exchanges code → session created → redirect to `/dashboard`

### Role-aware dashboard redirect
- `app/dashboard/page.tsx` reads `primary_role` from user profile
- Redirects:
  - `student` / `parent` → `/dashboard` (student dashboard, E9)
  - `tutor` → `/tutor` (tutor dashboard, E10)
  - `admin` → `/admin` (admin dashboard, E7)

---

## Database requirements (from `docs/ARCHITECTURE.md`)

The following must be set up as Supabase migrations:

1. **`public.user_profiles`** table (section 5.3)
2. **`public.user_roles`** table (section 5.3)
3. **`public.subjects`** reference table + seed data (section 5.2)
4. **`handle_new_user()` trigger** — auto-creates profile and assigns `student` role on signup (section 6.2)
5. **RLS policies** for `user_profiles` and `user_roles` (section 6.4–6.5)
6. **Helper functions**: `has_role()`, `is_admin()`, `is_tutor()` (section 6.1)

---

## Exit criteria (E3 is done when)

- [ ] User can sign up with email/password and receives a verification email
- [ ] Email verification is enforced — unverified users see the verify screen, not the dashboard
- [ ] User can sign up / sign in with Google OAuth
- [ ] OAuth callback at `auth/callback/route.ts` is working
- [ ] `handle_new_user()` trigger creates `user_profiles` and `user_roles` rows on every signup
- [ ] Middleware protects `/dashboard`, `/tutor`, and `/admin` routes (unauthenticated → sign-in)
- [ ] Role-aware redirect in `dashboard/page.tsx` routes to correct dashboard
- [ ] Admin can assign/remove roles via admin UI screen (`/admin` role management)
- [ ] `user_profiles` and `user_roles` tables exist with correct RLS policies
- [ ] `helper functions` (`has_role`, `is_admin`, `is_tutor`) exist in Supabase

---

## References

- `docs/ARCHITECTURE.md` — section 4.1 (Auth setup), section 5.3 (user profile + roles schema), section 6.1–6.5 (RLS + helper functions)
- `docs/MVP.md` — section 3.1 (roles), section 10.1 (student/parent requirements), section 10.2 (tutor requirements)
- `docs/PRODUCT.md` — section 5.1 step 2 (create account), section 5.2 step 1 (tutor onboarding)
- `docs/ROADMAP.md` — Sprint 1 (Next.js + Supabase auth, user profiles + roles)
