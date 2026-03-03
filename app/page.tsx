import Link from 'next/link'
import { WhatsAppCTA } from '@/components/WhatsAppCTA'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'Pakistan Studies',
  'Islamiyat',
  'Urdu',
]

const PACKAGES = [
  {
    sessions: 8,
    frequency: '~2× per week',
    price: 'PKR —',
    description: 'Ideal for focused revision or lighter weekly commitment.',
    highlight: false,
    accentColor: '#D02020',
    shape: 'circle' as const,
  },
  {
    sessions: 12,
    frequency: '~3× per week',
    price: 'PKR —',
    description: 'The most popular choice for consistent weekly progress.',
    highlight: true,
    accentColor: '#1040C0',
    shape: 'square' as const,
  },
  {
    sessions: 20,
    frequency: '~5× per week',
    price: 'PKR —',
    description: 'Intensive preparation for upcoming exams.',
    highlight: false,
    accentColor: '#F0C020',
    shape: 'triangle' as const,
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Submit Your Request',
    body: 'Choose your level and subject, share your availability and goals.',
    bg: 'bg-white',
    numBg: '#D02020',
    numText: 'white',
  },
  {
    step: 2,
    title: 'Pay for Your Package',
    body: 'Bank transfer, manually verified by our team within a few hours.',
    bg: 'bg-[#F0F0F0]',
    numBg: '#1040C0',
    numText: 'white',
  },
  {
    step: 3,
    title: 'Get Matched',
    body: 'We assign a verified teacher based on your subject, level, and schedule.',
    bg: 'bg-white',
    numBg: '#F0C020',
    numText: '#121212',
  },
  {
    step: 4,
    title: 'Start Learning',
    body: 'Join via a recurring Google Meet link and track sessions on your dashboard.',
    bg: 'bg-[#F0F0F0]',
    numBg: '#1040C0',
    numText: 'white',
  },
]

const FAQS = [
  {
    q: 'Do I need to create an account?',
    a: "No — just fill out the form and we'll follow up on WhatsApp.",
  },
  {
    q: 'How does matching work?',
    a: 'We manually assign a verified teacher based on your level, subject, and availability.',
  },
  {
    q: 'What if I need to reschedule?',
    a: 'Request via WhatsApp at least 24 hours before your class. Late reschedules are treated as no-shows.',
  },
  {
    q: "What if the teacher doesn't show up?",
    a: 'Tutor no-shows are not deducted from your package. We reschedule immediately.',
  },
  {
    q: 'Do you support overseas students?',
    a: 'Yes — we are timezone-aware. Share your city and timezone when requesting.',
  },
  {
    q: 'Can I try one session before committing?',
    a: 'Packages are monthly. Contact us on WhatsApp to discuss your needs.',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Determine where to send a logged-in user
  let dashboardHref = '/dashboard'
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('primary_role')
      .eq('user_id', user.id)
      .single()
    if (profile?.primary_role === 'admin') dashboardHref = '/admin'
    else if (profile?.primary_role === 'tutor') dashboardHref = '/tutor'
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-[#121212]">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo mark + wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div aria-hidden="true" className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
              <div className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '14px solid #F0C020',
                  filter: 'drop-shadow(0 0 0 2px #121212)',
                }}
              />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter group-hover:text-[#D02020] transition">
              CorvEd
            </span>
          </Link>

          {/* Nav links */}
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-[#121212] rounded-full hover:bg-[#121212] hover:text-white transition"
                >
                  My Dashboard
                </Link>
                <form action={signOut} className="inline">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-[#D02020] text-white border-2 border-[#121212] rounded-full shadow-[3px_3px_0px_0px_#121212] hover:bg-[#D02020]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-[#121212] rounded-full hover:bg-[#121212] hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-[#D02020] text-white border-2 border-[#121212] rounded-full shadow-[3px_3px_0px_0px_#121212] hover:bg-[#D02020]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="border-b-4 border-[#121212] grid lg:grid-cols-[58%_42%] min-h-[88vh]">
        {/* Left: Text panel */}
        <div className="bg-white border-r-0 lg:border-r-4 border-[#121212] px-8 sm:px-12 lg:px-16 py-16 sm:py-20 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D02020] border-2 border-[#121212]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#121212]/50">
              Pakistan-First · Overseas Supported
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black uppercase leading-[0.88] tracking-tighter text-[#121212]">
            1:1 Online
            <br />
            Tutoring
            <br />
            <span className="text-[#1040C0]">for O &amp; A</span>
            <br />
            <span className="text-[#1040C0]">Levels.</span>
          </h1>

          <div className="mt-8 border-l-4 border-[#D02020] pl-5">
            <p className="text-lg leading-relaxed text-[#121212]/60">
              Verified teachers. Fixed schedules.
              <br />
              Google Meet. WhatsApp-first support.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 bg-[#D02020] text-white font-black uppercase tracking-wider text-sm border-2 border-[#121212] shadow-[5px_5px_0px_0px_#121212] hover:bg-[#D02020]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
            >
              Get Started
            </Link>
            <WhatsAppCTA
              label="Chat on WhatsApp"
              className="!rounded-none !border-2 !border-[#121212] !shadow-[5px_5px_0px_0px_#121212] !font-black !uppercase !tracking-wider !text-sm active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-none"
            />
          </div>

          {/* Geometric row accent */}
          <div aria-hidden="true" className="mt-14 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#1040C0] border-2 border-[#121212]" />
            <div className="w-5 h-5 bg-[#F0C020] border-2 border-[#121212]" />
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '17px solid #D02020',
              }}
            />
            <div className="flex-1 h-[3px] bg-[#121212]" />
          </div>
        </div>

        {/* Right: Blue geometric composition */}
        <div
          aria-hidden="true"
          className="hidden lg:flex relative bg-[#1040C0] items-center justify-center overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Yellow circle — top right, partially off-screen */}
          <div
            className="absolute w-56 h-56 rounded-full bg-[#F0C020] border-4 border-[#121212]"
            style={{ top: '6%', right: '-6%' }}
          />
          {/* White square with triangle — center */}
          <div className="relative z-10 w-48 h-48 bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] flex items-center justify-center">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderBottom: '68px solid #121212',
              }}
            />
          </div>
          {/* Red rotated square (diamond) — bottom right */}
          <div
            className="absolute w-40 h-40 bg-[#D02020] border-4 border-[#121212]"
            style={{ bottom: '10%', right: '8%', transform: 'rotate(45deg)' }}
          />
          {/* Small black filled circle — top left */}
          <div
            className="absolute w-14 h-14 rounded-full bg-[#121212]"
            style={{ top: '22%', left: '10%' }}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b-4 border-[#121212] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
              How It Works
            </h2>
          </div>
          <div className="mb-14 inline-block bg-[#F0C020] border-2 border-[#121212] px-4 py-1.5">
            <span className="text-xs font-black uppercase tracking-[0.15em]">
              Get matched and learning in 24–48 hours.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, body, bg, numBg, numText }, i) => (
              <div
                key={step}
                className={`${bg} border-2 border-[#121212] p-8 flex flex-col ${
                  i < HOW_IT_WORKS.length - 1 ? 'border-b-0 lg:border-b-2 lg:border-r-0' : ''
                }`}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center border-2 border-[#121212] font-black text-lg mb-6 rounded-full flex-shrink-0"
                  style={{ background: numBg, color: numText }}
                >
                  {step}
                </div>
                <h3 className="font-black uppercase tracking-tight text-sm mb-3">{title}</h3>
                <p className="text-sm text-[#121212]/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#F0C020] border-b-4 border-[#121212] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-4xl sm:text-5xl font-black uppercase tracking-tighter text-[#121212]">
            Subjects We Cover
          </h2>
          <p className="mb-10 text-xs font-black uppercase tracking-[0.15em] text-[#121212]/50">
            Available for both O Levels and A Levels
          </p>
          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((subject) => (
              <span
                key={subject}
                className="bg-white border-2 border-[#121212] px-5 py-2.5 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#121212] hover:-translate-y-0.5 transition cursor-default"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#D02020] border-b-4 border-[#121212] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">
            Monthly Packages
          </h2>
          <p className="mb-12 text-xs font-black uppercase tracking-[0.15em] text-white/50">
            All sessions are 60 minutes · Per subject · Prices in PKR
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {PACKAGES.map(({ sessions, frequency, price, description, highlight, accentColor, shape }) => (
              <div
                key={sessions}
                className="relative bg-white border-4 border-[#121212] p-8 flex flex-col shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-1 transition"
              >
                {/* Geometric accent — top right corner */}
                <div className="absolute top-4 right-4">
                  {shape === 'circle' && (
                    <div
                      className="w-5 h-5 rounded-full border-2 border-[#121212]"
                      style={{ background: accentColor }}
                    />
                  )}
                  {shape === 'square' && (
                    <div
                      className="w-5 h-5 border-2 border-[#121212]"
                      style={{ background: accentColor }}
                    />
                  )}
                  {shape === 'triangle' && (
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: `17px solid ${accentColor}`,
                      }}
                    />
                  )}
                </div>

                {highlight && (
                  <span className="mb-4 self-start bg-[#1040C0] text-white text-xs font-black uppercase tracking-wider px-3 py-1 border-2 border-[#121212] rounded-full">
                    Most popular
                  </span>
                )}

                <p className="text-5xl font-black leading-none">
                  {sessions}
                  <span className="text-sm font-medium text-[#121212]/40 ml-1">sessions/month</span>
                </p>
                <p className="mt-1 text-xs font-black uppercase tracking-wider text-[#121212]/40">
                  {frequency}
                </p>
                <p className="mt-6 text-2xl font-black text-[#1040C0]">{price}</p>
                <p className="mt-3 text-sm text-[#121212]/55 leading-relaxed flex-1">{description}</p>

                <Link
                  href="/auth/sign-up"
                  className="mt-8 block text-center border-2 border-[#121212] px-4 py-3 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#121212] hover:bg-[#121212] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── GET STARTED CTA ─────────────────────────────────────────────── */}
      <section
        id="get-started"
        className="bg-[#1040C0] border-b-4 border-[#121212] px-6 py-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 2px, transparent 2px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">
            Ready to Start Learning?
          </h2>
          <p className="mb-10 text-xs font-black uppercase tracking-[0.15em] text-white/50">
            Create a free account — matching takes 24–48 hours.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_rgba(255,255,255,0.25)] p-8">
              <div className="mb-4" aria-hidden="true">
                <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Start Learning Today</h3>
              <p className="text-sm text-[#121212]/60 mb-6 leading-relaxed">
                Create a free account to request a tutor, view scheduled sessions, and track progress.
              </p>
              <div className="space-y-3">
                <Link
                  href="/auth/sign-up"
                  className="block text-center border-2 border-[#121212] bg-[#D02020] text-white px-4 py-3 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#121212] hover:bg-[#D02020]/90 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
                >
                  Create Account &rarr;
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="block text-center border-2 border-[#D0D0D0] px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#F0F0F0] transition"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="bg-[#F0C020] border-4 border-[#121212] shadow-[8px_8px_0px_0px_rgba(255,255,255,0.25)] p-8">
              <div className="mb-4 flex" aria-hidden="true">
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: '14px solid transparent',
                    borderRight: '14px solid transparent',
                    borderBottom: '24px solid #121212',
                  }}
                />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Book a Free Demo</h3>
              <p className="text-sm text-[#121212]/60 mb-6 leading-relaxed">
                Not sure yet? Book a no-obligation 30-minute trial session on WhatsApp before committing.
              </p>
              <WhatsAppCTA
                label="Book a Free Demo"
                className="!rounded-none !border-2 !border-[#121212] !shadow-[3px_3px_0px_0px_#121212] !font-black !uppercase !tracking-wider !text-sm !bg-white !text-[#121212] active:!translate-x-[1px] active:!translate-y-[1px] active:!shadow-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b-4 border-[#121212] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Frequently Asked Questions
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 border-2 border-[#121212]">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={q}
                className={`p-6 border-[#121212] ${
                  i % 2 === 0 ? 'bg-[#F0F0F0] sm:border-r-2' : 'bg-white'
                } ${i < FAQS.length - 2 ? 'border-b-2' : ''}`}
              >
                <dt className="font-black uppercase tracking-tight text-sm mb-3 text-[#121212]">
                  {q}
                </dt>
                <dd className="text-sm text-[#121212]/55 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#121212] text-white px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between border-b-2 border-white/10 pb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div aria-hidden="true" className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-white/20" />
                  <div className="w-4 h-4 bg-[#1040C0] border-2 border-white/20" />
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '14px solid #F0C020',
                    }}
                  />
                </div>
                <span className="text-xl font-black uppercase tracking-tighter">CorvEd</span>
              </div>
              <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                Structured 1:1 online tutoring for O &amp; A Level students in Pakistan and abroad.
              </p>
              <p className="mt-3 text-xs text-white/25 uppercase tracking-widest">
                Math · Physics · Chemistry · Biology · English · CS
              </p>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 gap-10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-white/30">
                  Platform
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { href: '/auth/sign-in', label: 'Log In' },
                    { href: '/auth/sign-up', label: 'Sign Up' },
                    { href: '/auth/sign-up/tutor', label: 'Teach with Us' },
                    { href: '/dashboard', label: 'Dashboard' },
                  ].map(({ href, label }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs font-black uppercase tracking-wider text-white/50 hover:text-white transition"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-white/30">
                  Info
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { href: '/policies', label: 'Full Policies' },
                  ].map(({ href, label }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs font-black uppercase tracking-wider text-white/50 hover:text-white transition"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-white/10">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/30">Policy Highlights</p>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {[
                { bar: '#F0C020', text: 'Reschedule: 24h notice via WhatsApp required.' },
                { bar: '#D02020', text: 'Student no-show: session counted as used.' },
                { bar: '#1040C0', text: 'Tutor no-show: not deducted — rescheduled immediately.' },
                { bar: '#444',    text: 'Packages: monthly, no session carryover.' },
              ].map(({ bar, text }) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: bar }} />
                  <span className="text-[11px] text-white/40 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/policies"
              className="mt-4 inline-block text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white underline underline-offset-4 transition"
            >
              Read full policies &rarr;
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-white/20 uppercase tracking-widest">
            © {new Date().getFullYear()} CorvEd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
