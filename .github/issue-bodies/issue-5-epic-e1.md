## Goal

Set up the repository scaffolding, baseline documentation, continuous integration, and local development environment so that all future engineering work on CorvEd is organized, consistent, and immediately productive for any developer or AI agent joining the project.

This epic must be completed **before any application code is written**. It is the engineering bedrock for every subsequent epic (E2–E12).

---

## Why this matters

CorvEd is being built as a side-hustle with potentially changing contributors. Without a clean foundation:
- Developers waste time figuring out where files go
- Missing CI lets broken or type-unsafe code reach the main branch
- Inconsistent local dev setup causes environment bugs that waste hours
- Poor documentation makes onboarding slow and error-prone

A solid E1 means every future task is unambiguous and the platform stays maintainable at pace.

---

## Stack context (from `docs/ARCHITECTURE.md`)

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, TypeScript) |
| Backend | Supabase (Postgres + Auth + Storage) |
| Deployment | Vercel (Next.js) + Supabase hosted |
| Local dev | Supabase CLI (`supabase start`) + `npm run dev` |

---

## Child tasks and status

| Issue | Task | Status |
|-------|------|--------|
| T1.1 (#6) | Repo structure and base docs scaffolded | **open** |
| T1.2 (#7) | Issue templates and PR template added | closed ✅ |
| T1.3 (#8) | Basic CI (lint + build) on PR | **open** |
| T1.4 (#9) | Environment setup guide in README | closed ✅ |

---

## Exit criteria (E1 is done when)

- [ ] Folder structure matches `docs/ARCHITECTURE.md` section 3.1 (`app/`, `lib/`, `components/`, `supabase/`)
- [ ] All five docs files exist in `docs/` and are complete
- [ ] `.github/ISSUE_TEMPLATE/` has task, story, bug, and config YAMLs ✅
- [ ] `.github/pull_request_template.md` exists ✅
- [ ] GitHub Actions CI workflow runs lint + type-check + build on every PR
- [ ] CI status check is required to pass before merging (branch protection on `main`)
- [ ] `README.md` covers prerequisites, clone, env var setup, `supabase start`, and `npm run dev`
- [ ] `.env.example` committed with the three required env var names (no real values)

---

## References

- `docs/ARCHITECTURE.md` — section 2 (env/deployment), section 3.1 (folder layout), section 4.1 (Supabase auth config)
- `docs/MVP.md` — section 15 (definition of done)
- `docs/ROADMAP.md` — Sprint 0 and Sprint 1 notes
