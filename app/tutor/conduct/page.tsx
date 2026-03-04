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
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      {/* Header */}
      <header className="border-b border-[#D0D0D0] bg-white px-6 py-4 ">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-bold text-[#121212] hover:text-[#1040C0] transition">
            CorvEd
          </Link>
          <Link
            href="/tutor/profile"
            className="text-sm text-[#121212]/60 hover:text-[#121212] transition"
          >
            ← Back to Profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        {/* Title */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-[#121212] bg-[#121212] text-white mb-4">
            Tutor Agreement
          </span>
          <h1 className="text-3xl font-bold text-[#121212]">
            CorvEd Tutor Code of Conduct
          </h1>
          <p className="mt-3 text-sm text-[#121212]/60 leading-relaxed">
            As a CorvEd tutor, you agree to uphold the following standards of professional
            conduct. These expectations exist to protect students, maintain platform quality, and
            provide a fair environment for all parties.
          </p>
        </div>

        {/* Section 1 — Punctuality */}
        <section className="border-2 border-[#121212] border border-[#D0D0D0] bg-white p-6  ">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Punctuality</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Join your Google Meet session within{' '}
                <strong className="text-[#121212]">5 minutes</strong> of the
                scheduled start time.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Notify admin at least{' '}
                <strong className="text-[#121212]">24 hours in advance</strong>{' '}
                if you cannot attend a session.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Repeated late joins or unannounced absences are grounds for{' '}
                <strong className="text-[#121212]">
                  removal from the platform
                </strong>
                .
              </span>
            </li>
          </ul>
        </section>

        {/* Section 2 — Session Quality */}
        <section className="border-2 border-[#121212] border border-[#D0D0D0] bg-white p-6  ">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Session Quality</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Conduct sessions professionally and with the{' '}
                <strong className="text-[#121212]">
                  student&apos;s learning goals
                </strong>{' '}
                in mind.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Log attendance (done / no-show) and session notes within{' '}
                <strong className="text-[#121212]">12 hours</strong> of each
                session.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Session notes should be meaningful — include topics covered and follow-up work
                (not just &ldquo;done&rdquo;).
              </span>
            </li>
          </ul>
        </section>

        {/* Section 3 — Communication */}
        <section className="border-2 border-[#121212] border border-[#D0D0D0] bg-white p-6  ">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white">
              3
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Communication</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                All student/parent communication is{' '}
                <strong className="text-[#121212]">
                  mediated through CorvEd admin
                </strong>
                .
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Do not share personal contact details with students or parents.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                If a student contacts you directly, redirect them to admin.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 4 — Privacy */}
        <section className="border-2 border-[#121212] border border-[#D0D0D0] bg-white p-6  ">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white">
              4
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Privacy</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Do not share student information (name, contact, performance) with anyone outside
                CorvEd.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Respect student{' '}
                <strong className="text-[#121212]">confidentiality</strong> in
                all communications.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 5 — Quality Expectations */}
        <section className="border-2 border-[#121212] border border-[#D0D0D0] bg-white p-6  ">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white">
              5
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Quality Expectations</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Maintain a clear and effective teaching approach suited to the student&apos;s
                level and goals.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                If you are struggling with a student, inform admin — do not ghost the student.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#1040C0]">•</span>
              <span>
                Admin will review tutor quality based on session notes, student feedback, and
                attendance records.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 6 — Incidents */}
        <section className="border-l-4 border-[#D02020] bg-[#D02020]/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center border-2 border-[#D02020] bg-[#D02020]/10 text-sm font-bold text-[#D02020]">
              6
            </span>
            <h2 className="text-lg font-semibold text-[#121212]">Incidents &amp; Enforcement</h2>
          </div>
          <ul className="space-y-2 text-sm text-[#121212]/60  leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">•</span>
              <span>
                Three confirmed incidents (no-shows, quality complaints, late log submission) will
                trigger a{' '}
                <strong className="text-[#121212]">formal review</strong>.
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
                <strong className="text-[#121212]">immediate removal</strong>{' '}
                from the platform.
              </span>
            </li>
          </ul>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-[#D0D0D0]">
          <Link
            href="/tutor/profile"
            className="text-sm font-medium text-[#1040C0] hover:text-[#0830A0] transition"
          >
            ← Return to tutor profile
          </Link>
        </div>
      </main>
    </div>
  )
}
