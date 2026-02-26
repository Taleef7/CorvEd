// E12 T12.1: Public policies page — reschedule, no-show, refund/expiry, package terms, privacy
// Closes #78

import Link from 'next/link'

export const metadata = {
  title: 'Policies — CorvEd',
  description:
    'CorvEd reschedule policy, no-show policy, refund and expiry policy, package terms, and privacy basics.',
}

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-[#121212]">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
              <div className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '14px solid #F0C020',
                }}
              />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter group-hover:text-[#D02020] transition">
              CorvEd
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-widest text-[#121212]/50 hover:text-[#D02020] transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white border-b-4 border-[#121212] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 bg-[#1040C0] border-2 border-[#121212]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#121212]/50">
              Platform Policies
            </span>
          </div>
          <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter text-[#121212]">
            CorvEd Policies
          </h1>
          <p className="mt-4 text-base text-[#121212]/60 leading-relaxed max-w-xl">
            These policies apply to all students, parents, and tutors on the CorvEd platform.
            They are locked for the current MVP launch and are referenced in all confirmation
            messages.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        {/* ── 1. Reschedule Policy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              1
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Reschedule Policy</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">⏰</span>
                <span>
                  Reschedule requests must be submitted via WhatsApp at least{' '}
                  <strong className="text-[#121212] font-black">24 hours</strong> before the
                  scheduled session time.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">📍</span>
                <span>
                  When requesting a reschedule, provide{' '}
                  <strong className="text-[#121212] font-black">2–3 alternate time slots</strong>{' '}
                  along with your timezone.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">⚠️</span>
                <span>
                  Late reschedule requests (less than 24 hours before the session) may be treated
                  as a <strong className="text-[#121212] font-black">no-show</strong> at admin
                  discretion.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">🩺</span>
                <span>
                  <strong className="text-[#121212] font-black">Exceptions</strong> may be
                  granted for: medical emergency, verified power or internet outage, or a genuine
                  first-time mistake. These must be communicated to admin and may be logged.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 2. No-Show Policy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              2
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">No-Show Policy</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white shadow-[6px_6px_0px_0px_#121212] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#121212] text-white">
                  <tr>
                    <th className="px-5 py-3 text-left font-black uppercase tracking-wider">
                      Scenario
                    </th>
                    <th className="px-5 py-3 text-left font-black uppercase tracking-wider">
                      Effect on sessions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#121212]">
                  {[
                    {
                      scenario: 'Student no-show',
                      effect: '1 session deducted from package',
                      highlight: true,
                    },
                    {
                      scenario: 'Tutor no-show',
                      effect: '0 sessions deducted — reschedule arranged immediately',
                      highlight: false,
                    },
                    {
                      scenario: 'Student joins late (> 10 min)',
                      effect: 'Treated as a student no-show',
                      highlight: true,
                    },
                    {
                      scenario: 'Tutor joins late (> 10 min)',
                      effect: 'Tutor no-show procedure begins',
                      highlight: false,
                    },
                  ].map(({ scenario, effect, highlight }) => (
                    <tr key={scenario} className={highlight ? 'bg-[#D02020]/5' : 'bg-white'}>
                      <td className="px-5 py-3 font-semibold text-[#121212]">{scenario}</td>
                      <td className="px-5 py-3 text-[#121212]/70">{effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 3. Refund and Expiry Policy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              3
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Refund &amp; Expiry Policy
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span className="text-lg leading-none mt-0.5">📅</span>
                <span>
                  Monthly packages expire at the{' '}
                  <strong className="text-[#121212] font-black">end date</strong> (30 days from
                  activation).
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span className="text-lg leading-none mt-0.5">🚫</span>
                <span>
                  <strong className="text-[#121212] font-black">No session carryover</strong>{' '}
                  between months — unused sessions are forfeited at the package end date.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span className="text-lg leading-none mt-0.5">💬</span>
                <span>
                  Refund requests are considered at{' '}
                  <strong className="text-[#121212] font-black">admin discretion</strong>. Contact
                  us via WhatsApp to discuss your situation.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span className="text-lg leading-none mt-0.5">✅</span>
                <span>
                  If CorvEd cancels or is unable to deliver sessions, affected sessions will be{' '}
                  <strong className="text-[#121212] font-black">credited or refunded</strong>.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 4. Package Terms ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#121212] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              4
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Package Terms</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span className="text-lg leading-none mt-0.5">📦</span>
                <span>
                  Packages are{' '}
                  <strong className="text-[#121212] font-black">per subject</strong> — one package
                  covers one subject for one month.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span className="text-lg leading-none mt-0.5">🎥</span>
                <span>
                  All sessions are{' '}
                  <strong className="text-[#121212] font-black">60 minutes</strong> via Google
                  Meet using a dedicated recurring link.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span className="text-lg leading-none mt-0.5">👤</span>
                <span>
                  Sessions are with your{' '}
                  <strong className="text-[#121212] font-black">assigned tutor</strong> —
                  substitutions are arranged by admin if needed.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span className="text-lg leading-none mt-0.5">🛡️</span>
                <span>
                  All communication between student and tutor is{' '}
                  <strong className="text-[#121212] font-black">mediated by admin</strong> via
                  WhatsApp.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 5. Privacy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 border-2 border-[#121212] flex items-center justify-center font-black text-sm"
              style={{
                background: '#F0C020',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                borderRadius: 0,
              }}
            >
              <span className="font-black text-[#121212]">5</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Privacy</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">🔒</span>
                <span>
                  Your contact details are used{' '}
                  <strong className="text-[#121212] font-black">
                    only for tutoring coordination
                  </strong>{' '}
                  — never shared with third parties.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">🚫</span>
                <span>
                  Tutors do{' '}
                  <strong className="text-[#121212] font-black">not receive</strong> student
                  contact information — all communication is admin-mediated.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span className="text-lg leading-none mt-0.5">📝</span>
                <span>
                  Session notes are visible to the{' '}
                  <strong className="text-[#121212] font-black">student, tutor, and admin</strong>{' '}
                  only.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="border-4 border-[#121212] bg-[#1040C0] p-6 shadow-[6px_6px_0px_0px_#121212] text-white">
          <h2 className="text-lg font-black uppercase tracking-tighter mb-2">Questions?</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            If you have questions about any of these policies or need to request an exception,
            contact us via WhatsApp. We aim to respond within a few hours during business hours.
          </p>
        </section>

        {/* ── Back ── */}
        <div className="pt-4 border-t-2 border-[#121212]">
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-widest underline underline-offset-4 hover:text-[#D02020] transition"
          >
            ← Back to CorvEd home
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#121212] text-white px-6 py-8 mt-4 border-t-4 border-[#121212]">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-black uppercase tracking-tighter">CorvEd</span>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            © {new Date().getFullYear()} CorvEd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
