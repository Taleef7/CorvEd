import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — CorvEd',
  description:
    'CorvEd terms of service covering eligibility, packages, payments, session policies, and liability.',
}

export default function TermsOfServicePage() {
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
            &larr; Back to home
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white border-b-4 border-[#121212] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 bg-[#1040C0] border-2 border-[#121212]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#121212]/50">
              Legal
            </span>
          </div>
          <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter text-[#121212]">
            Terms of Service
          </h1>
          <p className="mt-4 text-base text-[#121212]/60 leading-relaxed max-w-xl">
            These terms govern your use of the CorvEd platform. By creating an account or using our
            services, you agree to be bound by these terms.
          </p>
          <p className="mt-3 text-xs text-[#121212]/40 uppercase tracking-widest">
            Last updated: March 2026
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        {/* ── 1. Service Description ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              1
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Service Description
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd is a <strong className="text-[#121212] font-black">managed 1:1 online
                  tutoring platform</strong> for O Level and A Level students, primarily serving
                  Pakistan with support for overseas students.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd is <strong className="text-[#121212] font-black">not a marketplace</strong>.
                  Admin manually handles tutor matching, payment verification, and session management.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  All sessions are conducted via{' '}
                  <strong className="text-[#121212] font-black">Google Meet</strong> with a dedicated
                  recurring link per tutor-student match.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">WhatsApp</strong> is the primary
                  communication channel between admin and all users (students, parents, and tutors).
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 2. Eligibility ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              2
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Eligibility</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  You must provide a{' '}
                  <strong className="text-[#121212] font-black">valid email address</strong> and
                  verify it to create an account.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Minor students</strong> (under 18)
                  must have a parent or legal guardian who creates the account or provides explicit
                  consent.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Parents or guardians are responsible for monitoring their child&apos;s use of the
                  platform and attending to all communication and payment obligations.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Tutors must be at least 18 years of age and provide accurate qualification details
                  during registration.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 3. Account Responsibilities ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              3
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Account Responsibilities
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  You are responsible for providing{' '}
                  <strong className="text-[#121212] font-black">accurate and up-to-date</strong>{' '}
                  information in your profile, including your name, email, WhatsApp number, and
                  timezone.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  You must complete{' '}
                  <strong className="text-[#121212] font-black">email verification</strong> before
                  your account is fully active.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  You are responsible for maintaining the security of your account credentials. Do not
                  share your password.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  Notify admin immediately if you believe your account has been compromised.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 4. Packages and Payment ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              4
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Packages &amp; Payment
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  Packages are sold on a{' '}
                  <strong className="text-[#121212] font-black">monthly basis</strong>, per subject.
                  Available tiers are 8, 12, or 20 sessions per month.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  All sessions within a package are{' '}
                  <strong className="text-[#121212] font-black">60 minutes</strong> each.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  Payment is by{' '}
                  <strong className="text-[#121212] font-black">bank transfer only</strong>,
                  manually verified by CorvEd admin. We do not accept credit cards, debit cards, or
                  online wallets at this time.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  You must upload a{' '}
                  <strong className="text-[#121212] font-black">payment proof</strong> (bank transfer
                  screenshot) which admin will review and verify before activating your package.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">No session carryover:</strong>{' '}
                  Unused sessions expire at the end of the package period (30 days from activation)
                  and cannot be carried over to the next month.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  Pricing is displayed on the platform and may be updated. Any price changes apply
                  only to new packages, not existing active ones.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 5. Session Policies ── */}
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
            <h2 className="text-2xl font-black uppercase tracking-tighter">Session Policies</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  All sessions are{' '}
                  <strong className="text-[#121212] font-black">60 minutes</strong> conducted via
                  Google Meet using a dedicated recurring link assigned to your match.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Reschedule cutoff:</strong> You must
                  request a reschedule via WhatsApp at least{' '}
                  <strong className="text-[#121212] font-black">24 hours</strong> before the
                  scheduled session time. Late reschedule requests may be treated as a no-show.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  When requesting a reschedule, provide 2-3 alternate time slots along with your
                  timezone.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 6. No-Show Policies ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              6
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">No-Show Policies</h2>
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
                      Consequence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#121212]">
                  <tr className="bg-[#D02020]/5">
                    <td className="px-5 py-3 font-semibold text-[#121212]">Student no-show</td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Session is counted as used. 1 session deducted from your package.
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-5 py-3 font-semibold text-[#121212]">Tutor no-show</td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Session is not deducted from your package. A replacement session is arranged
                      immediately by admin.
                    </td>
                  </tr>
                  <tr className="bg-[#D02020]/5">
                    <td className="px-5 py-3 font-semibold text-[#121212]">
                      Student joins late (&gt; 10 min)
                    </td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Treated as a student no-show. Session counted as used.
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-5 py-3 font-semibold text-[#121212]">
                      Tutor joins late (&gt; 10 min)
                    </td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Tutor no-show procedure begins. Session not deducted from student.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 7. Refund Policy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#121212] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              7
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Refund Policy</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  Refunds are <strong className="text-[#121212] font-black">rare</strong> and
                  handled at admin&apos;s sole discretion on a case-by-case basis.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  Where applicable, CorvEd prefers to issue{' '}
                  <strong className="text-[#121212] font-black">credits</strong> (additional sessions
                  or an extended package) rather than monetary refunds.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  If CorvEd is unable to deliver sessions (e.g., no tutor available), affected
                  sessions will be credited or refunded.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  To request a refund, contact admin via WhatsApp with your reason and relevant
                  details.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 8. Code of Conduct ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              8
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Code of Conduct</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              All users of CorvEd (students, parents, and tutors) agree to:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Treat all participants with{' '}
                  <strong className="text-[#121212] font-black">respect and professionalism</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Not engage in any form of harassment, discrimination, or abusive behaviour.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Use the platform <strong className="text-[#121212] font-black">only</strong> for
                  its intended educational purpose.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Not attempt to circumvent CorvEd by arranging private tutoring sessions outside the
                  platform with matched tutors.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Respect the <strong className="text-[#121212] font-black">privacy</strong> of other
                  users and not share personal information obtained through the platform.
                </span>
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-[#121212]/70">
              Tutors are additionally bound by the{' '}
              <Link
                href="/tutor/conduct"
                className="font-black text-[#1040C0] underline underline-offset-2 hover:text-[#D02020] transition"
              >
                Tutor Code of Conduct
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── 9. Limitation of Liability ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              9
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Limitation of Liability
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd provides the platform on an{' '}
                  <strong className="text-[#121212] font-black">&ldquo;as is&rdquo;</strong> basis.
                  We make reasonable efforts to ensure platform availability but do not guarantee
                  uninterrupted service.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd is not liable for any{' '}
                  <strong className="text-[#121212] font-black">indirect, incidental, or
                  consequential damages</strong> arising from the use of our services.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd&apos;s total liability is limited to the amount paid by you for the most
                  recent active package.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd is not responsible for technical issues with Google Meet, WhatsApp, or your
                  internet connection that may affect sessions.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  While we vet tutors, CorvEd does not guarantee specific academic outcomes or exam
                  results.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 10. Termination ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              10
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Termination</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  You may close your account at any time by contacting admin. Active package sessions
                  already paid for are not automatically refunded.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  CorvEd reserves the right to{' '}
                  <strong className="text-[#121212] font-black">suspend or terminate</strong> any
                  account that violates these terms, engages in misconduct, or provides false
                  information.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  Tutors may be removed from the platform for repeated no-shows, quality issues, or
                  violation of the Tutor Code of Conduct.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 11. Modifications ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              11
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Modifications to Terms
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              CorvEd may update these terms from time to time. Changes will be posted on this page
              with an updated &ldquo;Last updated&rdquo; date. Continued use of CorvEd after changes
              constitutes acceptance of the revised terms. For significant changes, we will notify
              users via WhatsApp or email.
            </p>
          </div>
        </section>

        {/* ── 12. Governing Law ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              12
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Governing Law</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              These terms are governed by and construed in accordance with the{' '}
              <strong className="text-[#121212] font-black">laws of Pakistan</strong>. Any disputes
              arising from these terms or your use of CorvEd shall be subject to the exclusive
              jurisdiction of the courts of Pakistan.
            </p>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="border-4 border-[#121212] bg-[#1040C0] p-6 shadow-[6px_6px_0px_0px_#121212] text-white">
          <h2 className="text-lg font-black uppercase tracking-tighter mb-2">
            Questions About These Terms?
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            If you have questions about these terms of service, contact us via WhatsApp or email us
            at <strong className="text-white">support@corved.com</strong>. We aim to respond within
            a few business days.
          </p>
        </section>

        {/* ── Related Links ── */}
        <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest">
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-[#1040C0] transition"
          >
            Privacy Policy
          </Link>
          <Link
            href="/policies"
            className="underline underline-offset-4 hover:text-[#1040C0] transition"
          >
            Platform Policies
          </Link>
          <Link
            href="/help"
            className="underline underline-offset-4 hover:text-[#1040C0] transition"
          >
            Help &amp; Support
          </Link>
        </div>

        {/* ── Back ── */}
        <div className="pt-4 border-t-2 border-[#121212]">
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-widest underline underline-offset-4 hover:text-[#D02020] transition"
          >
            &larr; Back to CorvEd home
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#121212] text-white px-6 py-8 mt-4 border-t-4 border-[#121212]">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-black uppercase tracking-tighter">CorvEd</span>
          <p className="text-xs text-white/30 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} CorvEd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
