## Parent epic

Epic E3: authentication and roles (P0) — #17

## User story

**As a user (student, parent, or tutor)**, I can create an account on CorvEd using my email and password, or sign in with my Google account — so that I can access my dashboard and begin the tutoring process.

---

## Background

CorvEd requires authentication for all platform features beyond the public landing page. From `docs/MVP.md` section 10.1:

> "sign up with email/password or Google. Email verification required for email/password signup."

From `docs/ARCHITECTURE.md` section 4.1:

> "Enable: email/password signups with email confirmation required. Google OAuth provider enabled."
> "for email/password, user must confirm email before using core features — enforce in app: if auth.user.email_confirmed_at is null, show verify screen and restrict writes"

---

## Acceptance criteria

### Sign-up (email/password)
- [ ] Sign-up page (`auth/sign-up/page.tsx`) has fields: display name, email, password, confirm password, timezone (select, default "Asia/Karachi")
- [ ] Password validation: minimum 8 characters
- [ ] On successful submission, user is redirected to `auth/verify` page
- [ ] `auth/verify/page.tsx` displays: "Check your inbox and click the link to confirm your email."
- [ ] Supabase sends a confirmation email to the provided address
- [ ] Until email is confirmed, user cannot access `/dashboard` (redirected to `auth/verify`)

### Sign-in (email/password)
- [ ] Sign-in page (`auth/sign-in/page.tsx`) has email + password fields
- [ ] Valid credentials → redirect to `/dashboard`
- [ ] Invalid credentials → inline error message (do not reveal whether email exists)
- [ ] "Forgot password?" link is present (can link to Supabase password reset flow)

### Google OAuth
- [ ] "Sign in with Google" button is present on both sign-in and sign-up pages
- [ ] Clicking opens Google consent screen
- [ ] After Google consent, user is redirected to `auth/callback/route.ts`
- [ ] Callback exchanges the PKCE code and creates a session
- [ ] User is then redirected to `/dashboard`
- [ ] New Google users have their profile auto-created (via `handle_new_user` trigger)

### Post-auth state
- [ ] Authenticated users visiting `auth/sign-in` or `auth/sign-up` are redirected to `/dashboard`
- [ ] Sign-out button clears session and redirects to `auth/sign-in`

---

## Redirect flows

```
/auth/sign-up → (submit) → /auth/verify
/auth/verify  → (email click) → /auth/callback → /dashboard
/auth/sign-in → (submit) → /auth/callback → /dashboard
```

---

## Implementation notes

- Use `@supabase/ssr` browser client for sign-up and sign-in (`lib/supabase/client.ts`)
- The `auth/callback/route.ts` must use the **server** client (`lib/supabase/server.ts`) to exchange the `code` for a session
- After exchange, redirect to `/dashboard` (or a `next` query param if present)
- Google OAuth redirect URL must be configured in Supabase Dashboard under **Auth → URL Configuration → Redirect URLs**: `https://<your-domain>/auth/callback`

---

## Dependencies

- **E1 T1.1 (#6)** — `lib/supabase/client.ts`, `lib/supabase/server.ts` must exist
- **T3.1 (#20)** — Auth setup (Supabase Auth config + middleware + callback) implements this story
- **T3.3 (#22)** — User profile fields collected during sign-up

---

## References

- `docs/ARCHITECTURE.md` — section 4.1 (Auth setup), section 8.1 (signup + profile creation workflow)
- `docs/MVP.md` — section 10.1 (student/parent requirements — account and identity)
- `docs/PRODUCT.md` — section 5.1 step 2 (create account)
