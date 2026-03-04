'use client'

import { useActionState } from 'react'
import { addSubject } from './actions'

const initialState = { error: null as string | null }

export default function AddSubjectForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return await addSubject(formData)
    },
    initialState,
  )

  return (
    <div className="mb-8 border-4 border-[#121212] bg-white p-6">
      <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-[#121212]">
        Add New Subject
      </h2>
      <form action={formAction} className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide text-[#121212]/60">
            Name *
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Further Mathematics"
            className="w-64 border-2 border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] bg-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide text-[#121212]/60">
            Code *{' '}
            <span className="font-normal normal-case text-[#121212]/40">
              (lowercase, no spaces)
            </span>
          </label>
          <input
            name="code"
            required
            placeholder="e.g. further_math"
            pattern="[a-z0-9_]+"
            title="Lowercase letters, numbers, and underscores only"
            className="w-48 border-2 border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] bg-white"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="border-2 border-[#121212] bg-[#1040C0] px-5 py-2 text-sm font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {isPending ? 'Adding…' : 'Add Subject'}
          </button>
        </div>
      </form>
      {state.error && (
        <p className="mt-3 border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2 text-xs text-[#D02020]">
          {state.error}
        </p>
      )}
    </div>
  )
}
