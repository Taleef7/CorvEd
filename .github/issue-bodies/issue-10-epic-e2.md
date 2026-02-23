## Goal

Build a public-facing landing page and lead capture flow so that CorvEd can start collecting real student and parent leads immediately — even before the full authentication and dashboards from E3–E12 are complete.

This epic covers the **Phase 0 concierge validation** layer: a credible, mobile-responsive landing page that explains the service, displays subjects and packages, and lets a visitor submit an intake request (with or without an account).

---

## Why this matters

CorvEd's business model depends on a steady flow of qualified leads. Building E2 first means:
- You can start marketing and onboarding real students while core platform features (auth, matching, scheduling) are still being built
- The intake form collects exactly the information needed for admin-mediated matching, so Phase 0 operations can run entirely via WhatsApp + platform admin panel
- The landing page establishes brand credibility and communicates policies upfront, reducing WhatsApp back-and-forth

Without E2, there is no entry point for students or parents. All subsequent epics depend on users actually arriving and creating requests.

---

## Stack context

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router (`app/page.tsx`) |
| Styling | Tailwind CSS |
| Form handling | React Hook Form + Zod validation |
| Data storage | Supabase Postgres (`leads` table or `requests` table) |
| WhatsApp CTA | `wa.me` deep link with prefilled message |
| Deployment | Vercel |

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S2.1 (#11) | Story | As a parent/student, I can view services, subjects, pricing tiers, and how it works | **open** |
| S2.2 (#12) | Story | As a parent/student, I can submit a tutoring request (lead form) | **open** |
| T2.1 (#13) | Task | Landing page sections (value prop, subjects, packages 8/12/20, FAQ) | **open** |
| T2.2 (#14) | Task | Intake form (works without login for Phase 0, optional) | **open** |
| T2.3 (#15) | Task | Store leads/requests in DB and send admin notification | **open** |
| T2.4 (#16) | Task | Add WhatsApp CTA button ("chat to enroll") | **open** |

---

## Page structure (recommended)

```
app/
  page.tsx              ← landing page (this epic)
```

The landing page (`app/page.tsx`) should render the following sections in order:

1. **Hero** — headline, subheadline, primary CTA (intake form or WhatsApp)
2. **How it works** — 4-step summary (request → pay → match → learn)
3. **Subjects** — 9 subjects across O Levels and A Levels
4. **Packages** — 8 / 12 / 20 sessions per month with PKR pricing, per subject
5. **Intake form** — name, student/parent, level, subject, availability, WhatsApp number, goals
6. **WhatsApp CTA** — "Chat to enroll" button linking to `wa.me/<number>` with prefilled text
7. **FAQ** — reschedule policy, no-show policy, how matching works, timezone support
8. **Footer** — service description, subjects, policies link

---

## Exit criteria (E2 is done when)

- [ ] Landing page is deployed and publicly accessible on Vercel
- [ ] All 7 landing page sections are present and mobile-responsive
- [ ] Intake form validates inputs and saves to Supabase (or a `leads` table)
- [ ] Admin receives a notification (email or dashboard item) when a new lead submits
- [ ] WhatsApp CTA button is present with a working `wa.me` link and prefilled message
- [ ] Page renders correctly on mobile (375px width minimum)
- [ ] No broken links or console errors on the deployed page

---

## Design principles

- **Mobile first**: most Pakistani users will visit on mobile via WhatsApp share links
- **Clarity over cleverness**: show prices and policies plainly; do not hide the 24-hour reschedule rule
- **Low friction**: the intake form should be completable in under 2 minutes
- **Trust signals**: "verified teachers", "admin-mediated matching", "structured monthly packages"

---

## References

- `docs/PRODUCT.md` — section 5.1 (student/parent journey), section 7 (UX requirements), section 8 (pricing framing)
- `docs/MVP.md` — section 4 (subjects, packages), section 5 (policies), section 6 (pricing model), section 8 (WhatsApp-first ops)
- `docs/OPS.md` — section 4 workflow A (inbound lead → qualified request), section 6.1–6.3 (greeting/intake/package message templates)
- `docs/ROADMAP.md` — Phase 0 (concierge validation), Sprint 0 (landing page + intake)
- `docs/ARCHITECTURE.md` — section 3.1 (app folder structure), section 5.5 (requests table schema)
