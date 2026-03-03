import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — CorvEd',
  description:
    'CorvEd privacy policy covering data collection, usage, storage, third-party services, and your rights.',
}

export default function PrivacyPolicyPage() {
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
            <div className="w-2.5 h-2.5 rounded-full bg-[#D02020] border-2 border-[#121212]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#121212]/50">
              Legal
            </span>
          </div>
          <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter text-[#121212]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base text-[#121212]/60 leading-relaxed max-w-xl">
            This policy describes how CorvEd collects, uses, stores, and protects your personal
            information. By using CorvEd, you agree to the practices described below.
          </p>
          <p className="mt-3 text-xs text-[#121212]/40 uppercase tracking-widest">
            Last updated: March 2026
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        {/* ── 1. Information We Collect ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              1
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Information We Collect
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              We collect the following types of personal information when you use CorvEd:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Account information:</strong> Full
                  name, email address, and password (hashed) when you sign up.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Contact details:</strong> WhatsApp
                  phone number, provided during profile setup or tutoring requests. This is our
                  primary communication channel.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Timezone and location:</strong> Your
                  IANA timezone (e.g., Asia/Karachi) and optionally your city, used for scheduling.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Tutoring data:</strong> Subject
                  preferences, academic level, schedule patterns, session attendance, and session
                  notes logged by tutors.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Payment information:</strong> Payment
                  proof images (bank transfer screenshots) uploaded for manual verification. We do not
                  store bank account numbers or card details.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Tutor profiles:</strong> For tutors,
                  we additionally collect education background, teaching experience, subject
                  expertise, and availability.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 2. How We Use Your Data ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              2
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              How We Use Your Data
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Tutor matching:</strong> Your
                  subject, level, and availability are used to match you with a suitable tutor.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Session scheduling:</strong> Your
                  timezone and preferred schedule are used to generate session times.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Communication:</strong> Your WhatsApp
                  number is used to send session reminders, reschedule confirmations, and payment
                  instructions.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Payment verification:</strong>{' '}
                  Payment proof images are reviewed by admin to confirm bank transfers.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Platform improvement:</strong>{' '}
                  Aggregated, anonymised usage data may be used to improve the service.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 3. Who Has Access ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              3
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Who Has Access</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white shadow-[6px_6px_0px_0px_#121212] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#121212] text-white">
                  <tr>
                    <th className="px-5 py-3 text-left font-black uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left font-black uppercase tracking-wider">
                      Data Access
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#121212]">
                  <tr className="bg-[#D02020]/5">
                    <td className="px-5 py-3 font-semibold text-[#121212]">CorvEd Admin</td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Full access to all user data for platform operations, matching, payment
                      verification, and support.
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-5 py-3 font-semibold text-[#121212]">Assigned Tutor</td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      Student&apos;s display name, subject, level, and session schedule only. Tutors
                      do not receive student contact details or payment information.
                    </td>
                  </tr>
                  <tr className="bg-[#D02020]/5">
                    <td className="px-5 py-3 font-semibold text-[#121212]">Other Users</td>
                    <td className="px-5 py-3 text-[#121212]/70">
                      No access. Student information is not visible to other students or unassigned
                      tutors.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 4. Data Storage and Security ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              4
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Data Storage &amp; Security
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Hosting:</strong> All data is stored
                  on Supabase (hosted on AWS infrastructure) with encryption at rest and in transit.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Authentication:</strong> Passwords
                  are hashed using industry-standard algorithms. We use Supabase Auth for secure
                  session management.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Row-Level Security:</strong> Database
                  access is enforced through PostgreSQL Row-Level Security policies, ensuring users
                  can only access data relevant to their role.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">File storage:</strong> Payment proof
                  images are stored in a private Supabase Storage bucket accessible only to admin.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 5. Third-Party Services ── */}
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
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Third-Party Services
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              CorvEd uses the following third-party services as part of its operations:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Google Meet:</strong> All tutoring
                  sessions are conducted via Google Meet. Google&apos;s own privacy policy applies to
                  your use of Meet.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Supabase:</strong> Used for
                  authentication, database hosting, and file storage. Supabase processes data on our
                  behalf.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">WhatsApp:</strong> Used as the
                  primary communication channel between admin and users. WhatsApp messages are subject
                  to Meta&apos;s privacy policy.
                </span>
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-[#121212]/70">
              We do not sell, rent, or trade your personal data to any third party for marketing
              purposes.
            </p>
          </div>
        </section>

        {/* ── 6. Data Retention ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              6
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Data Retention</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  Your data is retained for as long as your account remains active on the platform.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  After account closure, we retain data for a reasonable period (up to 12 months) for
                  record-keeping, audit, and dispute resolution purposes.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  Payment proof images may be retained for financial record-keeping as required by
                  applicable law.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#D02020] pl-4">
                <span>
                  You may request earlier deletion by contacting admin (see below).
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 7. Your Rights ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#121212] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              7
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Your Rights</h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              You have the right to:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Access:</strong> Request a copy of
                  the personal data we hold about you.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Correction:</strong> Request
                  correction of inaccurate or incomplete data.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Deletion:</strong> Request deletion
                  of your account and associated data. Some data may be retained as required by law.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#121212] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">How to exercise:</strong> All
                  requests should be made via WhatsApp to our admin team or by emailing the address
                  listed below.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 8. Minors and Parental Consent ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black text-sm">
              8
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Minors &amp; Parental Consent
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  Many of our students are minors (O Level and A Level students). We take their
                  privacy seriously.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Parental mediation:</strong> Parents
                  or guardians are the primary account holders for minor students. All communication
                  and consent flows through the parent/guardian.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">Admin-tutor mediation:</strong>{' '}
                  Tutors do not have direct contact with students. All communication is routed
                  through CorvEd admin for safety.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#F0C020] pl-4">
                <span>
                  <strong className="text-[#121212] font-black">WhatsApp numbers:</strong> Student
                  WhatsApp numbers are treated as sensitive data and are never shared with tutors.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 9. Pakistan Compliance ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              9
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Compliance &amp; Governing Law
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <ul className="space-y-3 text-sm leading-relaxed text-[#121212]/70">
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  CorvEd operates from Pakistan. This privacy policy is governed by the laws of
                  Pakistan, including the Prevention of Electronic Crimes Act 2016 (PECA) and any
                  applicable data protection regulations.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  We are committed to complying with applicable privacy legislation as it evolves in
                  Pakistan.
                </span>
              </li>
              <li className="flex items-start gap-3 border-l-4 border-[#1040C0] pl-4">
                <span>
                  For users accessing CorvEd from outside Pakistan, please note that your data is
                  processed and stored using infrastructure that may be located in regions outside your
                  country of residence.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── 10. Changes to This Policy ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] flex items-center justify-center font-black text-sm text-white">
              10
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Changes to This Policy
            </h2>
          </div>
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] space-y-4">
            <p className="text-sm leading-relaxed text-[#121212]/70">
              We may update this privacy policy from time to time. Changes will be posted on this
              page with an updated &ldquo;Last updated&rdquo; date. Continued use of CorvEd after
              changes constitutes acceptance of the revised policy.
            </p>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="border-4 border-[#121212] bg-[#1040C0] p-6 shadow-[6px_6px_0px_0px_#121212] text-white">
          <h2 className="text-lg font-black uppercase tracking-tighter mb-2">
            Privacy Concerns?
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            If you have questions about this privacy policy or wish to exercise your data rights,
            contact us via WhatsApp or email us at{' '}
            <strong className="text-white">privacy@corved.com</strong>. We aim to respond within a
            few business days.
          </p>
        </section>

        {/* ── Related Links ── */}
        <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest">
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-[#1040C0] transition"
          >
            Terms of Service
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
