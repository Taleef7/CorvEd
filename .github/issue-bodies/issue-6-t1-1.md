## Parent epic

Epic E1: repository and engineering foundation (P0) — #5

## Objective

Scaffold the Next.js + Supabase folder structure as specified in `docs/ARCHITECTURE.md` (section 3.1) and confirm that all five baseline documentation files are present in `docs/`. This task ensures every future engineer or AI agent has a clear, unambiguous home for every file they will create across E2–E12.

---

## Background

CorvEd uses Next.js App Router with Supabase. The architecture doc defines the exact intended folder layout. Without this structure in place, later tasks (auth, dashboards, services, etc.) each have to make arbitrary decisions about where to put things — leading to inconsistency and confusion at scale.

The `docs/` folder already exists with the five required files. This task is primarily about scaffolding the **application** folder structure and the three Supabase client files.

---

## Folder structure to create

From `docs/ARCHITECTURE.md` section 3.1. Create each folder and stub file — real content fills in as each Epic is built.

```
app/
  page.tsx                          ← landing page (built in E2)
  auth/
    sign-in/page.tsx                ← email/password + Google sign-in (E3)
    sign-up/page.tsx                ← registration form (E3)
    callback/route.ts               ← Supabase OAuth callback handler (E3)
    verify/page.tsx                 ← post-signup email verify instructions (E3)
  dashboard/
    page.tsx                        ← role-aware redirect (student/tutor/admin) (E3)
    requests/
      new/page.tsx                  ← create tutoring request form (E4)
      [id]/page.tsx                 ← view single request status (E4)
    packages/
      [id]/page.tsx                 ← package details + payment upload (E5)
    sessions/page.tsx               ← student sessions list (E9)
  tutor/
    page.tsx                        ← tutor dashboard home (E10)
    sessions/page.tsx               ← tutor sessions list (E10)
    profile/page.tsx                ← tutor profile editor (E6)
  admin/
    page.tsx                        ← admin dashboard home (E7)
    requests/page.tsx               ← requests inbox with filters (E7)
    requests/[id]/page.tsx          ← single request + match assignment (E7)
    tutors/page.tsx                 ← tutor list + approval (E6)
    matches/[id]/page.tsx           ← match detail + schedule + sessions (E8)
    payments/page.tsx               ← payment verification screen (E5)
    sessions/page.tsx               ← admin sessions overview (E8)
  policies/page.tsx                 ← reschedule/no-show/refund policy page (E12)

components/
  ui/                               ← shared UI primitives (Button, Input, Card, Badge…)
  dashboards/                       ← role-specific dashboard widgets

lib/
  supabase/
    client.ts                       ← browser Supabase client (anon key, createBrowserClient)
    server.ts                       ← server-side client (cookies, createServerClient)
    admin.ts                        ← service role client — NEVER expose to browser
  services/
    requests.ts                     ← request CRUD and status transitions
    payments.ts                     ← payment record + proof upload helpers
    matching.ts                     ← match creation + tutor assignment logic
    scheduling.ts                   ← session generation from schedule pattern
    sessions.ts                     ← session status updates + remaining count
    whatsapp.ts                     ← template rendering + wa.me deep link builder
  validators/
    request.ts                      ← Zod schema for request form
    payment.ts                      ← Zod schema for payment form

supabase/
  migrations/                       ← all schema changes go here (never edit DB directly)
  seed.sql                          ← MVP subject list (9 subjects: math, physics…)
  config.toml                       ← local Supabase CLI config (from `supabase init`)
```

---

## Docs to verify in `docs/`

All five files must exist with content (already present — verify only):

| File | Status |
|------|--------|
| `docs/MVP.md` | ✅ exists |
| `docs/PRODUCT.md` | ✅ exists |
| `docs/OPS.md` | ✅ exists |
| `docs/ARCHITECTURE.md` | ✅ exists |
| `docs/ROADMAP.md` | ✅ exists |

No changes needed to the doc files themselves — ensure they are cross-linked in `README.md`.

---

## Supabase client files (critical detail)

These three files in `lib/supabase/` are the foundation of all data access in the app.

**`lib/supabase/client.ts`** — browser client, uses `createBrowserClient` from `@supabase/ssr`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** — server client, reads cookies from the current request:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // setAll is required for server-side auth cookie refresh.
        // See Supabase SSR docs for the full Next.js App Router implementation:
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**`lib/supabase/admin.ts`** — service role client, bypasses RLS — **server-only**:
```ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // never expose to browser
  )
}
```

> ⚠️ `admin.ts` must **never** be imported in any client component or any file the browser bundles. Only use it in Server Actions and Route Handlers.

---

## Environment variables

Create `.env.example` (committed, no real values) and `.env.local` (gitignored, real values):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed `NEXT_PUBLIC_` — doing so would expose it to every browser visitor.

---

## Proposed steps

1. If Next.js is not yet initialised, run:
   ```bash
   npx create-next-app@latest . --typescript --app --eslint --tailwind --no-src-dir --import-alias='@/*'
   ```
2. Create every directory and stub file from the tree above (`mkdir -p` + empty `export {}` or minimal placeholder).
3. Install `@supabase/ssr` and `@supabase/supabase-js`:
   ```bash
   npm install @supabase/ssr @supabase/supabase-js
   ```
4. Create the three Supabase client files in `lib/supabase/` using the patterns above.
5. Initialise local Supabase config (if not present):
   ```bash
   supabase init
   ```
6. Commit `.env.example` with the three env var names, no values.
7. Verify `npm run dev` starts without errors (stub pages returning `null` or `<p>TODO</p>` are fine).

---

## Definition of done

- [ ] All directories and stub files from the tree above exist and are committed
- [ ] `lib/supabase/client.ts`, `server.ts`, and `admin.ts` exist with correct client initialisation patterns
- [ ] `@supabase/ssr` and `@supabase/supabase-js` are in `package.json` dependencies
- [ ] `.env.example` committed with the three required env var names (no values)
- [ ] `supabase/config.toml` exists (from `supabase init`)
- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes with zero errors on the stub files

---

## Dependencies

None — this is the first task and unblocks everything else in E2–E12.

---

## Risks / edge cases

- `create-next-app` may generate a `src/` directory by default — use `--no-src-dir` flag to keep the flat `app/` layout as specified in `docs/ARCHITECTURE.md`.
- The older `@supabase/auth-helpers-nextjs` package is deprecated — use `@supabase/ssr` exclusively.
- If deploying to Vercel, the Node.js version should match the `engines` field in `package.json` (18+ recommended; 20 LTS preferred).

---

## References

- `docs/ARCHITECTURE.md` — section 3.1 (full folder layout), section 2.3 (env vars), section 4.1 (Supabase auth setup)
- `docs/MVP.md` — section 15 (definition of done)
- `README.md` — local development prerequisites and setup steps
