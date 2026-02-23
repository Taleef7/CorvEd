## Parent epic

Epic E11: WhatsApp-first operations (P0) — #71

## User story

**As a student or tutor**, when a key event happens (payment confirmed, match made, session reminder), I receive a WhatsApp message from CorvEd with all the details I need — so I'm always informed without needing to check the platform.

---

## Background

From `docs/OPS.md` section 4 Workflow D:
> "send confirmation message to both [student and tutor]: start date/time, recurring days/time, Meet link, reschedule cutoff"

From `docs/OPS.md` Workflow E:
> "1-hour reminder (recommended): send to student/parent + send to tutor"

In MVP, these messages are sent **manually** by the admin (WhatsApp Business). The platform provides the tool to make this fast. Automated WhatsApp Business API messages are deferred to post-MVP.

---

## Acceptance criteria

- [ ] Admin can access "copy message" buttons for the following events:
  - Payment confirmed → confirmation + next steps
  - Match confirmed → tutor name, schedule, Meet link
  - Session reminder (1 hour before) → time + Meet link
- [ ] All messages include the correct variable values pulled from the database
- [ ] Admin can click "Open WhatsApp" for the student/tutor associated with the event
- [ ] No automated messaging required for MVP — admin manually copies and sends

---

## Message content (from OPS.md)

**Match confirmation template**:
```
Hi [Name] 👋 Great news! You've been matched with your teacher.

Teacher: [TutorName]
Subject: [Subject] ([Level])
Schedule: [Days] at [Time] ([StudentTZ])
Google Meet link (recurring): [MeetLink]

⚠️ Reschedule rule: request via WhatsApp at least 24 hours before class.
Student no-show = session counted. Tutor no-show = session not counted.
```

---

## Dependencies

- **T11.1 (#74)** — template constants must exist
- **T11.2 (#75)** — copy buttons implementation

---

## References

- `docs/OPS.md` — section 4 Workflows C, D, E (when confirmations are sent), section 6.7–6.8 (templates)
- `docs/MVP.md` — section 8 (WhatsApp-first comms)
