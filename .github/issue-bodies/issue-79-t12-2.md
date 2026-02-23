## Parent epic

Epic E12: policies, safety, and reliability (P0) — #77

## Objective

Create a tutor code of conduct document — either as a page in the platform (`/tutor/conduct`) or embedded in the tutor profile/onboarding form — that tutors acknowledge when signing up, setting clear expectations for professional behaviour.

---

## Background

From `docs/OPS.md` section 9 (tutor quality monitoring):
> "Expected tutor behaviour: join on time (within 5 minutes), mark session status within 12 hours, maintain professional conduct, communicate exclusively via admin for student matters"

From `docs/PRODUCT.md` section 9.1:
> "admin approval required. Tutors can apply but cannot be assigned until approved. Maintain backup tutors for high-demand subjects."

A clear code of conduct:
- Sets professional expectations before onboarding
- Provides legal/operational grounding for admin action if a tutor is removed
- Builds student trust ("verified teachers")

---

## Code of conduct content

### Tutor Code of Conduct — CorvEd

**As a CorvEd tutor, you agree to:**

#### 1. Punctuality
- Join your Google Meet session within 5 minutes of the scheduled start time
- Notify admin at least 24 hours in advance if you cannot attend a session
- Repeated late joins or unannounced absences are grounds for removal from the platform

#### 2. Session quality
- Conduct sessions professionally and with the student's learning goals in mind
- Log attendance (done / no-show) and session notes within 12 hours of each session
- Session notes should be meaningful (not just "done") — include topics covered and follow-up work

#### 3. Communication
- All student/parent communication is mediated through CorvEd admin
- Do not share personal contact details with students or parents
- If a student contacts you directly, redirect them to admin

#### 4. Privacy
- Do not share student information (name, contact, performance) with anyone outside CorvEd
- Respect student confidentiality in all communications

#### 5. Quality expectations
- Maintain a clear and effective teaching approach
- If you are struggling with a student, inform admin — do not ghost the student
- Admin will review tutor quality based on session notes, student feedback, and attendance

#### 6. Incidents
- Three confirmed incidents (no-shows, quality complaints, late log submission) will trigger a review
- Admin may pause your assignments during a review
- Serious misconduct (harassment, breach of privacy) results in immediate removal

---

## Platform integration

**Option A (recommended for MVP)**: Add a simple checkbox to the tutor application form (E6 T6.1):
```
☐ I have read and agree to the CorvEd Tutor Code of Conduct
   [View Code of Conduct →] (links to /tutor/conduct)
```

**Option B**: Separate page at `/tutor/conduct` (public or tutor-only).

Both options are low-effort for MVP. Option A is preferred as it ensures acknowledgement.

---

## Acceptance criteria

- [ ] Code of conduct content exists in the platform (page or inline on tutor form)
- [ ] Tutor application form has an acknowledgement checkbox (Option A)
- [ ] Checkbox is required — tutor cannot submit form without checking it
- [ ] Content covers: punctuality, session quality, communication, privacy, quality expectations, incidents
- [ ] Content matches `docs/OPS.md` section 9 behaviour expectations

---

## Definition of done

- [ ] Code of conduct content written and available in platform
- [ ] Tutor form has acknowledgement checkbox (required)
- [ ] Content links from tutor onboarding form

---

## References

- `docs/OPS.md` — section 9 (tutor quality monitoring — expected behaviour), section 13 (privacy basics)
- `docs/PRODUCT.md` — section 9.1 (tutor verification + trust signals)
