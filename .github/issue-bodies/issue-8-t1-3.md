## Parent epic

Epic E1: repository and engineering foundation (P0) — #5

## Objective

Add a GitHub Actions workflow that runs automatically on every pull request targeting `main` to:

1. Lint all TypeScript/JavaScript files (ESLint via `npm run lint`)
2. Type-check the entire codebase (`npx tsc --noEmit`)
3. Verify the Next.js app builds successfully (`npm run build`)

This prevents broken, type-unsafe, or lint-failing code from being merged into the main branch, keeping the codebase healthy from day one.

---

## Background

CorvEd is a side-hustle project — there will be stretches of solo development and periods of contributor change. Without automated checks on PRs:
- Type errors slip through and break the Vercel deployment
- ESLint issues accumulate and make diffs harder to review
- Regressions in one area are invisible until someone manually re-tests

A passing CI on every PR gives confidence that the build is always green before merging.

---

## Workflow file

Create `.github/workflows/ci.yml` with the following content:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-build:
    name: Lint, type-check, and build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          # Placeholder values — Next.js requires NEXT_PUBLIC_* at build time.
          # These stubs allow the build to complete in CI without a live Supabase project.
          # Use the Supabase CLI local default URL so the format is valid but clearly local.
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder_anon_key
          SUPABASE_SERVICE_ROLE_KEY: placeholder_service_role_key
```

---

## Why placeholder env vars are needed for the build step

Next.js inlines `NEXT_PUBLIC_*` environment variables at build time. The CI runner has no real Supabase project, so without placeholder values the build fails with `undefined` URL errors. Providing dummy strings lets the build complete while confirming the code compiles.

**Security note:** `SUPABASE_SERVICE_ROLE_KEY` is intentionally **not** a `NEXT_PUBLIC_` variable. It is only used in Server Actions and Route Handlers at runtime, so a placeholder value in CI is safe — it is never shipped to the browser bundle.

---

## Preventing runtime Supabase calls at build time

If any page or layout makes a top-level Supabase call (e.g., in a Server Component that runs during `next build`), the build will fail even with placeholder env vars because the placeholder URL is unreachable.

To avoid this, add the following to any page/layout that queries Supabase:

```ts
export const dynamic = 'force-dynamic'
```

This forces Next.js to treat the route as always server-rendered and skips static generation, preventing build-time Supabase calls.

---

## Branch protection (strongly recommended)

After the workflow is working, protect `main`:

1. Go to **GitHub → Settings → Branches → Add rule** for `main`
2. Enable: **Require status checks to pass before merging**
3. Select the `lint-and-build` check from the dropdown (it appears after the first CI run)
4. Enable: **Require branches to be up to date before merging**
5. Enable: **Require a pull request before merging** (prevents direct pushes)

---

## Proposed steps

1. Confirm `package.json` has a `lint` script — `create-next-app` adds `"lint": "next lint"` by default.
2. Confirm `tsconfig.json` exists — `create-next-app` generates this.
3. Confirm `next.config.ts` (or `next.config.js`) exists with `typescript.ignoreBuildErrors: false` and `eslint.ignoreDuringBuilds: false` — CI should fail on errors, not silently pass.
4. Create `.github/workflows/ci.yml` with the content above.
5. Push to a feature branch, open a PR, and confirm the workflow triggers and all three steps pass.
6. Once passing, enable branch protection on `main` as described above.

---

## Definition of done

- [ ] `.github/workflows/ci.yml` exists and is syntactically valid YAML
- [ ] Workflow triggers automatically on PRs targeting `main`
- [ ] `npm run lint` step passes (zero ESLint errors on the scaffolded codebase)
- [ ] `npx tsc --noEmit` step passes (zero TypeScript errors)
- [ ] `npm run build` step passes with placeholder env vars
- [ ] CI status check is visible on GitHub PRs (green checkmark or red ✗ when failing)
- [ ] (Recommended) Branch protection on `main` requires this check to pass before merge

---

## Dependencies

- Depends on **T1.1** (#6) — the repo must have `package.json`, `tsconfig.json`, and `next.config.*` in place before CI can run lint and build.

---

## Risks / edge cases

- **`npm ci` vs `npm install`:** Always use `npm ci` in CI to install exact lockfile versions. If `package-lock.json` is not committed, the pipeline will fail — make sure the lockfile is in the repo.
- **Node.js version:** Use Node 20 LTS in CI to match Vercel's default. Mismatched Node versions can cause subtle build differences.
- **`next.config` strictness:** Ensure `typescript.ignoreBuildErrors` is `false` (the default). Setting it to `true` to silence errors locally defeats the purpose of the type-check step.
- **ESLint config:** `create-next-app` generates a base ESLint config. If any existing files have ESLint errors, fix them before enabling CI so the first run passes.
- **Caching:** The `cache: 'npm'` option in `setup-node` caches `~/.npm` between runs, significantly speeding up `npm ci` on subsequent PRs.

---

## References

- `docs/ARCHITECTURE.md` — section 2 (deployment architecture), section 2.3 (env vars and secrets)
- `docs/ROADMAP.md` — Sprint 0 (setup tasks), Sprint 1 (foundation)
- `README.md` — local development prerequisites
