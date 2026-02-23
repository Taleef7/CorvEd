import Link from 'next/link'
import { LeadForm } from '@/components/LeadForm'
import { WhatsAppCTA } from '@/components/WhatsAppCTA'

// Subjects offered at MVP launch
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

// Package tiers
const PACKAGES = [
  {
    sessions: 8,
    frequency: '~2× per week',
    price: 'PKR —',
    description: 'Ideal for focused revision or lighter weekly commitment.',
    highlight: false,
  },
  {
    sessions: 12,
    frequency: '~3× per week',
    price: 'PKR —',
    description: 'The most popular choice for consistent weekly progress.',
    highlight: true,
  },
  {
    sessions: 20,
    frequency: '~5× per week',
    price: 'PKR —',
    description: 'Intensive preparation for upcoming exams.',
    highlight: false,
  },
]

// How it works steps
const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Submit your request',
    body: 'Choose your level and subject, share your availability and goals.',
  },
  {
    step: 2,
    title: 'Pay for your package',
    body: 'Bank transfer, manually verified by our team within a few hours.',
  },
  {
    step: 3,
    title: 'Get matched',
    body: 'We assign a verified teacher based on your subject, level, and schedule.',
  },
  {
    step: 4,
    title: 'Start learning',
    body: 'Join via a recurring Google Meet link and track sessions on your dashboard.',
  },
]

// FAQ items
const FAQS = [
  {
    q: 'Do I need to create an account to submit a request?',
    a: "No — just fill out the form below and we'll follow up on WhatsApp.",
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
    q: "What happens if the teacher doesn't show up?",
    a: 'Tutor no-shows are not deducted from your package. We reschedule immediately.',
  },
  {
    q: 'Do you support overseas students?',
    a: 'Yes — we are timezone-aware. Share your city and timezone when requesting.',
  },
  {
    q: 'Can I try one session before committing?',
    a: 'Packages are monthly. Contact us on WhatsApp to discuss your specific needs.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-20 text-center dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            Pakistan-first · Overseas supported
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            1:1 Online Tutoring for
            <br />
            <span className="text-indigo-600">O Levels &amp; A Levels</span>
          </h1>
          <p className="mt-5 text-lg text-zinc-500 dark:text-zinc-400">
            Verified teachers. Fixed schedules. Google Meet.{' '}
            <span className="whitespace-nowrap">WhatsApp-first support.</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#intake"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Started
            </a>
            <WhatsAppCTA label="Chat on WhatsApp" />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <li key={step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Subjects ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">Subjects We Cover</h2>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Available for both O Levels and A Levels
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SUBJECTS.map((subject) => (
              <span
                key={subject}
                className="rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-zinc-800 dark:text-indigo-300"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ─────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">Monthly Packages</h2>
          <p className="mb-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            All sessions are 60 minutes · Packages are per subject · Prices in PKR
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {PACKAGES.map(({ sessions, frequency, price, description, highlight }) => (
              <div
                key={sessions}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                  highlight
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                {highlight && (
                  <span className="mb-3 self-start rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-3xl font-extrabold">
                  {sessions}
                  <span className="text-base font-medium text-zinc-500"> sessions/month</span>
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{frequency}</p>
                <p className="mt-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {price}
                </p>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                <a
                  href="#intake"
                  className="mt-6 rounded-lg border border-indigo-600 px-4 py-2 text-center text-sm font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                  Get started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Policy Summary ───────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-12 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-bold">Policies (the short version)</h2>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">⏰</span>
              <span>
                <strong>Reschedule:</strong> Request at least 24 hours before your class via
                WhatsApp.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">📋</span>
              <span>
                <strong>Student no-show:</strong> Session is counted as used.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">✅</span>
              <span>
                <strong>Tutor no-show:</strong> Session is not deducted — we reschedule
                immediately.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">📅</span>
              <span>
                <strong>Packages:</strong> Monthly only. Sessions do not carry over to the next
                month.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Intake Form ──────────────────────────────────────────────────────── */}
      <section id="intake" className="bg-white px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">Request Tutoring</h2>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No account needed. Fill in your details and we&apos;ll follow up on WhatsApp.
          </p>
          <LeadForm />
          <div className="mt-6 text-center">
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Prefer WhatsApp? Chat with us directly →
            </p>
            <WhatsAppCTA label="Chat on WhatsApp" />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <dt className="font-semibold">{q}</dt>
                <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-10 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-lg font-bold">CorvEd</p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Structured 1:1 online tutoring for O &amp; A Levels
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Math · Physics · Chemistry · Biology · English · CS · Pak Studies · Islamiyat · Urdu
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <Link
                href="/policies"
                className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Policies
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Create an account
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} CorvEd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
