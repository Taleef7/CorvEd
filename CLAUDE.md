# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.
Goal: keep changes correct, reproducible, and aligned with the locked MVP scope.

---

## Tooling and MCPs

Configured MCP servers in this environment:

- serena — semantic code navigation and safe refactors (symbols, references, structured edits)
- supabase-local — local Supabase stack MCP endpoint (http://127.0.0.1:54321/mcp)
- playwright — browser automation for verification and E2E test authoring
- sequential-thinking — planning and tool-routing for multi-step work
- context7 — authoritative docs grounding for libraries/frameworks (avoid stale API usage)
- tavily — up-to-date web research (release notes, breaking changes, best practices)
- grep — GitHub-wide code search for real-world examples
- github — GitHub issues/PR automation (optional; use only when asked)
- MCP_DOCKER — Docker MCP gateway (use only if needed)

### Default workflow for any non-trivial task

Always follow this sequence unless the request is extremely small:

1) Use sequential-thinking to produce a short execution plan and select tools.
2) Use serena to locate the correct files/symbols and map call sites before editing.
3) Use supabase-local to confirm schema/RPC signatures and avoid guessing DB structure.
4) Implement code changes in small, coherent steps.
5) Run lint/tests and verify user flows with playwright when UI/behavior changes.
6) If external API behavior is involved, use context7 to confirm correct usage.
7) Use tavily only when information freshness is required.
8) Use grep when a real-world pattern is needed (copy the idea, not the whole implementation).
9) Use github MCP only for creating/updating issues/PRs when explicitly requested.

### Tool selection rules

- "Where is this implemented?" / "What calls this?" / "Refactor safely?" → serena first
- "Is this the correct Next.js/Supabase/Luxon/Zod/Playwright API?" → context7 first
- "What is the latest guidance / breaking change / release note?" → tavily
- "How do other repos handle this edge case?" → grep
- "Does the UI really work?" → playwright (do not guess)
- "What is the DB schema/RPC signature / RLS policy reality?" → supabase-local (do not infer columns/functions)

---

## Commands (use these exact commands on this machine)

### App lifecycle

```bash
npm run dev        # Next.js dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

Unit tests (Vitest)
npm test              # Run all unit tests once
npm run test:watch    # Vitest in watch mode

E2E tests (Playwright)
npm run test:e2e        # Playwright end-to-end tests
npm run test:e2e:ui     # Playwright with interactive UI

Type checking
npm run typecheck     # tsc --noEmit
Local Supabase (Docker-backed)

Important: supabase binary is not on PATH; use npx supabase consistently.

npx supabase start       # Local Postgres + Auth + Studio (Docker required)
npx supabase status      # Show URLs/ports and service status
npx supabase stop        # Stop local stack

npx supabase db reset    # Apply all migrations + seed.sql (local)
npx supabase db push     # Deploy migrations to hosted Supabase project (remote)

npx supabase gen types typescript --local > lib/supabase/database.types.ts
Docker diagnostics (when local Supabase acts weird)
docker ps
docker logs supabase_db_corved --tail 200
Local Supabase + DB workflow (authoritative)

Local Supabase is a set of Docker containers started by npx supabase start. Never treat the database as "editable state". It is migration-managed.

Hard rules

Never make schema changes directly in the database UI.

All schema changes and DB functions/RPCs must be implemented as SQL migrations under supabase/migrations/.

After any schema/RPC change:

npx supabase db reset

npx supabase gen types typescript --local > lib/supabase/database.types.ts

update application code and tests

Using supabase-local MCP properly

Use it for:

schema introspection (tables/columns/indexes)

confirming RPC/function existence and signatures

checking local stack health and endpoints

supporting correct migrations workflow

Do not use it for:

“quick” production-like DDL or permanent ad-hoc edits outside migrations

Required environment

Required .env.local:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=923001234567    # admin WhatsApp, no +

Security rules:

Never prefix SUPABASE_SERVICE_ROLE_KEY with NEXT_PUBLIC_.

Never commit secrets.

Never log secret values.

Never use service role on the client.

Architecture Overview

CorvEd is a managed tutoring platform (not a marketplace). Admin manually handles matching, payment verification, and session generation. WhatsApp Business is the primary communication layer — no API integration for MVP.

Stack:

Next.js 16 App Router

Supabase (Postgres + Auth + Storage)

Tailwind CSS v4

TypeScript

luxon for timezone handling

Supabase clients (use the right one)
Client	File	When to use
Browser	lib/supabase/client.ts	Client components (anon key, RLS-scoped)
Server	lib/supabase/server.ts	Server Components, Route Handlers (cookie-based session)
Admin	lib/supabase/admin.ts	Server Actions in app/admin/** only (service role; bypasses RLS)

admin.ts must import 'server-only'. Never use createAdminClient() in browser code.

Route → Role Mapping
Route	Audience	Auth enforcement
app/auth/	All	Unauthenticated
app/dashboard/	Students & parents	primary_role = student
app/tutor/	Tutors	primary_role = tutor
app/admin/	Admin	primary_role = admin + service role actions

middleware.ts handles unauthenticated redirects at the edge.
Layout components (app/admin/layout.tsx, app/tutor/layout.tsx) verify roles server-side.
app/dashboard/page.tsx reads primary_role and redirects admin/tutor to their routes.

Data model
request → package → payment
request → match → sessions
match → tutor_profiles (via tutor_user_id)
user_profiles ←→ user_roles (many roles)

Request lifecycle:
new → payment_pending → ready_to_match → matched → active → paused → ended

Session lifecycle:
scheduled → done | rescheduled | no_show_student | no_show_tutor

schedule_pattern JSONB on matches:
{ "timezone": "Asia/Karachi", "days": [1,3], "time": "19:00", "duration_mins": 60 } (days: 0=Sun…6=Sat)

Locked policies (from docs/MVP.md)

Sessions: 60 minutes, Google Meet only; one recurring Meet link per match (stored on matches.meet_link)

Packages: per subject per month — 8, 12, or 20 sessions only; no carryover between months

Payments: bank transfer only, manually verified by admin

Student no-show → sessions_used + 1 via increment_sessions_used RPC. Tutor no-show → no increment.

Reschedule cutoff: 24 hours before session, via WhatsApp to admin

Meet link must start with https://meet.google.com/

Coding standards and change discipline
General standards

Prefer server-side enforcement over client-side checks for role/security.

Keep functions small, typed, and testable.

Validate all external inputs (forms, route handlers, server actions) with Zod.

Use consistent naming: *_utc for UTC timestamps and explicit status enums.

Avoid silent failures. When a mutation fails, surface a meaningful error.

Refactoring rules

Use serena to find all call sites before renaming/moving anything.

After refactors, run npm run lint and relevant Playwright flows.

If behavior changes, update docs in docs/ and the corresponding utils/constants.

Performance sanity

Prefer single Supabase queries with deep joins over N+1 patterns.

Keep server components dynamic only where necessary.

Avoid heavy computation in client components.

Key patterns
Admin server action pattern (mandatory)

All admin mutations follow this pattern:

'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function myAdminAction(input: ValidatedInput) {
  const admin = createAdminClient()

  // 0. Validate input upstream with Zod (lib/validators/)
  // 1. Mutate tables
  await admin.from('table').update({ ... }).eq('id', input.id)

  // 2. Write audit log
  await admin.from('audit_logs').insert([{
    actor_user_id,
    action,
    entity_type,
    entity_id,
    details,
  }])

  // 3. Revalidate
  revalidatePath('/admin/...')
}

Validate all inputs with Zod schemas from lib/validators/ before calling admin actions.

Timezone handling

Store timestamps as UTC: scheduled_start_utc, scheduled_end_utc

Display in viewer's user_profiles.timezone (IANA string, default Asia/Karachi)

Use luxon for UTC↔local conversions (session generation)

Use Intl.DateTimeFormat for display-only

Phone numbers stored in international format (+92 for Pakistan); normalize local format on save

Session generation algorithm (lib/services/scheduling.ts)

Iterate dates from start_date to end_date in schedule_pattern.timezone

For each date with day-of-week in pattern.days, combine date + pattern.time → convert to UTC

Insert session row; stop at N = tier_sessions sessions created

Never spill into next month

Atomic RPCs

increment_sessions_used(p_request_id) — use for done and no_show_student (not direct update)

tutor_update_session(p_session_id, p_status, p_notes) — tutors update sessions via this RPC only

Supabase deep join pattern
supabase.from("sessions").select(`
  id, scheduled_start_utc, status,
  matches!match_id(
    meet_link,
    requests!request_id(level, subjects!subject_id(name),
      user_profiles!created_by_user_id(display_name)
    )
  )
`)
Page conventions

All dashboard/admin pages must export export const dynamic = 'force-dynamic'

Server Components: use createClient() from lib/supabase/server.ts; redirect to /auth/sign-in if no user

Status badge utilities:

lib/utils/request.ts (STATUS_LABELS, STATUS_COLOURS)

lib/utils/session.ts (SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS)

All schema changes via migrations in supabase/migrations/ — never edit the DB directly

Debugging playbook

When something breaks:

Reproduce and write the exact steps.

Use serena to locate the code path and identify the entry point.

If DB-related, use supabase-local MCP to confirm schema/RPCs (do not guess).

Run npm run lint.

For UI flows, use playwright to reproduce and capture the failing step.

If it’s a config/version issue, use context7 (and tavily if freshness is required).

Fix, then re-run minimal verification:

npm run lint

relevant npm run test:e2e flow(s)

Key file locations
Area	Path
Supabase clients	lib/supabase/{client,server,admin}.ts (all typed with Database generic)
Database types	lib/supabase/database.types.ts (generated — regenerate after migrations)
Validators (Zod)	lib/validators/
Services	lib/services/ (sessions.ts, requests.ts, payments.ts, matching.ts, scheduling.ts)
Rate limiting	lib/rate-limit.ts (in-memory sliding window)
WhatsApp templates	lib/whatsapp/templates.ts (14 typed functions)
WhatsApp link builder	lib/whatsapp/buildLink.ts → buildWaLink(number, message?)
Pricing config	lib/config/pricing.ts (PACKAGES, PAYMENT_INSTRUCTIONS — reads from env vars)
Timezone config	lib/config/timezones.ts
Admin auth guard	lib/auth/requireAdmin.ts
CopyMessageButton	components/CopyMessageButton.tsx — admin WhatsApp copy + open
SessionCompleteForm	components/dashboards/SessionCompleteForm.tsx (with toast feedback)
PackageSummary	components/dashboards/PackageSummary.tsx — renewal alert at ≤3 sessions or ≤5 days
OnboardingChecklist	components/dashboards/OnboardingChecklist.tsx — step-by-step progress
StatusBanner	components/dashboards/StatusBanner.tsx — request status banners
Unit tests	lib/**/__tests__/*.test.ts (vitest — `npm test`)
Cron jobs	app/api/cron/expire-packages/route.ts (daily via vercel.json)
Deployment	vercel.json, .env.example
RLS helpers (DB functions)
public.has_role(uid, role_enum)   -- general role check
public.is_admin(uid)              -- checks 'admin' role
public.is_tutor(uid)              -- checks 'tutor' role

handle_new_user() trigger auto-creates user_profiles + user_roles (default: student) on every signup.

Reference docs

docs/ARCHITECTURE.md — full DB schema, RLS SQL, RPC definitions, scheduling algorithm, timezone model

docs/MVP.md — scope lock, locked policies, status lifecycles, acceptance criteria by role

docs/OPS.md — all 14 WhatsApp templates, admin playbook, no-show workflow