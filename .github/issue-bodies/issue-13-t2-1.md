## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## Objective

Build the full landing page at `app/page.tsx` with all required sections: hero, how it works, subjects, packages, FAQ, and footer. This task implements the static content layer that makes the service legible and trustworthy to a first-time visitor.

---

## Background

The landing page is the first thing a prospective student or parent sees. From `docs/PRODUCT.md` section 5.1, the first step of the student journey is:

> "Step 1: discover — visits website landing page, sees subjects + packages, understands 'how it works' and policies"

From `docs/ROADMAP.md` Phase 0 deliverables:

> "simple landing page with: subjects offered, package tiers, 'request tutoring' intake form, WhatsApp CTA"

This task covers all static sections. The intake form (T2.2) and WhatsApp CTA (T2.4) are separate tasks that slot into this layout.

---

## Sections to build

### 1. Hero

- **Headline**: "1:1 Online Tutoring for O Levels & A Levels"
- **Subheadline**: "Verified teachers. Fixed schedules. Google Meet. WhatsApp-first support."
- **CTA button**: "Get Started" (scrolls to intake form anchor `#intake`)
- Optional secondary CTA: "Chat on WhatsApp" (wa.me link — see T2.4)
- Background: clean, professional, mobile-friendly

### 2. How It Works

Four numbered steps (horizontal on desktop, vertical on mobile):

1. **Submit your request** — choose your level, subject, and share your availability
2. **Pay for your package** — bank transfer, manually verified by our team
3. **Get matched** — we assign a verified teacher based on your subject and schedule
4. **Start learning** — join via recurring Google Meet link, track sessions on your dashboard

Keep copy concise. One sentence per step.

### 3. Subjects

Two columns or tabs (O Levels / A Levels):

**O Levels**: Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, Urdu
**A Levels**: Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, Urdu

Use badges or a clean grid layout.

### 4. Packages

Three package cards side-by-side (stack vertically on mobile):

| Package | Frequency | Price |
|---------|-----------|-------|
| 8 sessions/month | ~2x per week | PKR — |
| 12 sessions/month | ~3x per week | PKR — |
| 20 sessions/month | ~5x per week | PKR — |

Include a note: "All sessions are 60 minutes. Packages are per subject. Prices in PKR."

> **Pricing placeholder**: Use `PKR —` or `Contact us` until pricing is confirmed. Pricing constants should be in a config file so they can be updated without code changes (see T5.2 for the admin pricing config task).

### 5. Intake Form (placeholder / anchor)

- Add an `id="intake"` anchor at this position in the page
- The actual form is implemented in T2.2 (S2.2) and embedded here

### 6. FAQ

Include at minimum:

| Question | Answer |
|----------|--------|
| Do I need to create an account to submit a request? | No — just fill out the form and we'll follow up on WhatsApp. |
| How does matching work? | We manually assign a verified teacher based on your level, subject, and availability. |
| What if I need to reschedule? | Request via WhatsApp at least 24 hours before your class. Late reschedules are treated as no-shows. |
| What happens if the teacher doesn't show up? | Tutor no-shows are not deducted from your package. We reschedule immediately. |
| Do you support overseas students? | Yes — we're timezone-aware. Share your city and timezone when requesting. |
| Can I try one session before committing? | MVP packages are monthly. Contact us on WhatsApp to discuss your needs. |

### 7. WhatsApp CTA (placeholder / anchor)

- The actual button is implemented in T2.4
- Add an anchor section or include the button inline near the FAQ or below the intake form

### 8. Footer

Minimal footer with:
- Service name: CorvEd
- Tagline: "Structured 1:1 online tutoring for O & A Levels"
- Subjects listed briefly
- Links: Policies (once E12 page exists; can be `href="/policies"` as a stub)

---

## Technical notes

- **File**: `app/page.tsx`
- Mark it with `export const dynamic = 'force-dynamic'` only if it makes Supabase calls (for Phase 0, most content is static)
- Use Tailwind CSS utility classes for all styling
- All sections must pass Lighthouse accessibility score ≥ 80 (no missing alt text, semantic headings, good contrast)
- Use `<section>` tags with appropriate `id` attributes for scroll-to-anchor navigation

---

## Proposed steps

1. Create `app/page.tsx` with a `<main>` wrapper and all section shells
2. Implement Hero section with responsive layout
3. Implement How It Works (numbered steps)
4. Implement Subjects (responsive grid or badge list)
5. Implement Packages (three cards, PKR placeholder pricing)
6. Add intake form anchor `id="intake"` and embed `<LeadForm />` (from T2.2) — can use a placeholder `<div id="intake" />` until T2.2 is complete
7. Implement FAQ (accordion or plain Q&A)
8. Implement Footer
9. Manual QA: check on 375px (mobile), 768px (tablet), 1280px (desktop)
10. Deploy to Vercel and verify no console errors

---

## Definition of done

- [ ] All 7 sections are present and have real content (no Lorem ipsum)
- [ ] Page renders correctly on mobile (375px), tablet (768px), desktop (1280px)
- [ ] "Get Started" CTA scrolls to intake form section
- [ ] Package cards show all three tiers with frequency descriptions
- [ ] All 9 subjects are listed for both O Levels and A Levels
- [ ] FAQ answers the 6 minimum questions listed above
- [ ] No broken links or placeholder hrefs in production
- [ ] Tailwind styles are used (no inline style attributes unless unavoidable)

---

## Dependencies

- **E1 T1.1 (#6)** — `app/page.tsx` stub must exist from repo scaffolding
- **T2.2 (#14)** — intake form component is embedded in this page (can be a placeholder initially)
- **T2.4 (#16)** — WhatsApp CTA button is embedded in this page

---

## References

- `docs/PRODUCT.md` — section 4 (service offerings), section 5.1 step 1 (discover), section 7 (UX requirements), section 8 (pricing framing), section 9 (trust and safety)
- `docs/MVP.md` — section 4 (subjects, levels), section 5 (session policies), section 6 (packages and pricing)
- `docs/OPS.md` — section 6.3 (/packages template), section 5 (policy summary)
- `docs/ROADMAP.md` — Phase 0 deliverables, Sprint 0
