import Link from 'next/link'

export interface OnboardingStep {
  label: string
  completed: boolean
  href?: string
  ctaLabel?: string
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[]
  title?: string
}

export function OnboardingChecklist({ steps, title = 'Getting Started' }: OnboardingChecklistProps) {
  const completedCount = steps.filter((s) => s.completed).length
  const allDone = completedCount === steps.length

  if (allDone) return null

  return (
    <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1040C0]">{title}</h2>
        <span className="text-xs font-bold text-[#121212]/40">
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full border border-[#121212] bg-[#E0E0E0]">
        <div
          className="h-full bg-[#1040C0] transition-all duration-300"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 border-[#121212] text-xs font-bold ${
                step.completed
                  ? 'bg-[#1040C0] text-white'
                  : 'bg-white text-[#121212]/30'
              }`}
            >
              {step.completed ? '✓' : i + 1}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  step.completed ? 'text-[#121212]/50 line-through' : 'text-[#121212]'
                }`}
              >
                {step.label}
              </p>
              {!step.completed && step.href && step.ctaLabel && (
                <Link
                  href={step.href}
                  className="mt-1 inline-flex text-xs font-bold text-[#1040C0] underline underline-offset-2 hover:text-[#0830A0]"
                >
                  {step.ctaLabel} →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
