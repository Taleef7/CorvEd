// E12 T12.2: Tutor code of conduct page — public, linked from tutor profile form
// Closes #79

import Link from 'next/link'

export const metadata = {
  title: 'Tutor Code of Conduct — CorvEd',
  description:
    'CorvEd expectations for tutor punctuality, session quality, communication, privacy, and incident handling.',
}

export default function TutorConductPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-bold text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            CorvEd
          </Link>
          <Link
            href="/tutor/profile"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            ← Back to Profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        {/* Title */}
        <div>
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4">
            Tutor Agreement
          </span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            CorvEd Tutor Code of Conduct
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            As a CorvEd tutor, you agree to uphold the following standards of professional
            conduct. These expectations exist to protect students, maintain platform quality, and
            provide a fair environment for all parties.
          </p>
        </div>

        {/* Section 1 — Punctuality */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              1
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Punctuality</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Join your Google Meet session within{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">5 minutes</strong> of the
                scheduled start time.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Notify admin at least{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">24 hours in advance</strong>{' '}
                if you cannot attend a session.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Repeated late joins or unannounced absences are grounds for{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  removal from the platform
                </strong>
                .
              </span>
            </li>
          </ul>
        </section>

        {/* Section 2 — Session Quality */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              2
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Session Quality</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Conduct sessions professionally and with the{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  student&apos;s learning goals
                </strong>{' '}
                in mind.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Log attendance (done / no-show) and session notes within{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">12 hours</strong> of each
                session.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Session notes should be meaningful — include topics covered and follow-up work
                (not just &ldquo;done&rdquo;).
              </span>
            </li>
          </ul>
        </section>

        {/* Section 3 — Communication */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              3
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Communication</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                All student/parent communication is{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  mediated through CorvEd admin
                </strong>
                .
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Do not share personal contact details with students or parents.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                If a student contacts you directly, redirect them to admin.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 4 — Privacy */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              4
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Privacy</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Do not share student information (name, contact, performance) with anyone outside
                CorvEd.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Respect student{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">confidentiality</strong> in
                all communications.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 5 — Quality Expectations */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              5
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quality Expectations</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Maintain a clear and effective teaching approach suited to the student&apos;s
                level and goals.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                If you are struggling with a student, inform admin — do not ghost the student.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-indigo-500">•</span>
              <span>
                Admin will review tutor quality based on session notes, student feedback, and
                attendance records.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 6 — Incidents */}
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
              6
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Incidents &amp; Enforcement</h2>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              <span>
                Three confirmed incidents (no-shows, quality complaints, late log submission) will
                trigger a{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">formal review</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              <span>
                Admin may pause your assignments during a review period.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              <span>
                Serious misconduct (harassment, breach of privacy) results in{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">immediate removal</strong>{' '}
                from the platform.
              </span>
            </li>
          </ul>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/tutor/profile"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
          >
            ← Return to tutor profile
          </Link>
        </div>
      </main>
    </div>
  )
}
