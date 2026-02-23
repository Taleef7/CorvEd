## Parent epic

Epic E10: tutor dashboard and session notes (P0) — #65

## Objective

Build the session completion form — a small inline form on each session card allowing the tutor to select a status (done / no_show_student / no_show_tutor) and add a note — and wire it to the `tutor_update_session` RPC or equivalent Server Action.

---

## Form component: `components/dashboards/SessionCompleteForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SessionStatus = 'done' | 'no_show_student' | 'no_show_tutor'

interface Props {
  sessionId: string
  onSuccess: () => void
}

export function SessionCompleteForm({ sessionId, onSuccess }: Props) {
  const [status, setStatus] = useState<SessionStatus>('done')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: status,
      p_notes: notes,
    })

    if (error) {
      setError(error.message)
    } else {
      onSuccess()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded p-3 mt-2">
      <div className="flex gap-3">
        {(['done', 'no_show_student', 'no_show_tutor'] as SessionStatus[]).map(s => (
          <label key={s} className="flex items-center gap-1">
            <input type="radio" value={s} checked={status === s} onChange={() => setStatus(s)} />
            {s === 'done' ? '✅ Done' : s === 'no_show_student' ? '❌ Student No-show' : '🤒 My No-show'}
          </label>
        ))}
      </div>

      <textarea
        placeholder="Session notes (optional but encouraged)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        className="w-full border rounded p-2 text-sm"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Submit'}
      </button>
    </form>
  )
}
```

---

## Inline form placement

Each upcoming session card on `/tutor/sessions` shows:

```
[✅ Mark Session] → toggles the SessionCompleteForm inline (no navigation)
```

After successful submit, the card re-renders with the new status badge (optimistic UI or page reload with `router.refresh()`).

---

## Acceptance criteria

- [ ] `SessionCompleteForm` component exists
- [ ] Status selection: Done / Student No-show / Tutor No-show
- [ ] Notes textarea (optional)
- [ ] Calls `tutor_update_session` Supabase RPC
- [ ] Error message shown on failure
- [ ] Card updates after successful submission
- [ ] Form disabled while submitting

---

## Definition of done

- [ ] `components/dashboards/SessionCompleteForm.tsx` exists
- [ ] RPC call wired correctly
- [ ] Integrated into `/tutor/sessions` session cards

---

## References

- `docs/MVP.md` — section 10.2 (tutor requirements — mark session + notes)
- `docs/ARCHITECTURE.md` — section 6.6 (tutor_update_session RPC)
- `docs/OPS.md` — section 4 Workflow E (day-of-class — tutor logs attendance)
