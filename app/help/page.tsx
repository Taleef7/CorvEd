import Link from 'next/link'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

const faqs = [
  {
    question: 'How do I get started?',
    answer:
      'Sign up with your email or Google account, complete your profile, and submit a tutoring request with your subject and level. Select a monthly package and make a bank transfer to begin.',
  },
  {
    question: 'How do I make a payment?',
    answer:
      'After selecting a package, you\'ll see our bank transfer details. Make the transfer using the reference format provided, then upload a screenshot or enter your transaction reference on the package page. We verify payments within 24 hours.',
  },
  {
    question: 'How do I reschedule a session?',
    answer:
      'Reschedule requests must be made at least 24 hours before the session. Tap the "Reschedule" button on your session card to send us a WhatsApp message with your preferred alternative times.',
  },
  {
    question: 'What happens if I miss a session?',
    answer:
      'A student no-show counts as a used session from your package. If you need to cancel, please do so at least 24 hours in advance via WhatsApp.',
  },
  {
    question: 'What if my tutor doesn\'t show up?',
    answer:
      'If your tutor doesn\'t join within 10 minutes, let us know on WhatsApp. The session will not be deducted from your package, and we will reschedule immediately.',
  },
  {
    question: 'How do I renew my package?',
    answer:
      'You\'ll see a renewal alert on your dashboard when you have 3 or fewer sessions remaining. Contact us on WhatsApp to renew, or submit a new request for the next month.',
  },
  {
    question: 'What subjects do you offer?',
    answer:
      'We currently offer Math, Physics, Chemistry, Biology, English, Computer Science, Pakistan Studies, Islamiyat, and Urdu for O Levels and A Levels.',
  },
  {
    question: 'Do you support overseas students?',
    answer:
      'Yes! We support students worldwide. All session times are displayed in your local timezone. Just set your timezone in your profile and we\'ll handle the rest.',
  },
  {
    question: 'Can I change my tutor?',
    answer:
      'Yes. Contact us on WhatsApp if you\'d like to be matched with a different tutor. We\'ll reassign you as quickly as possible.',
  },
  {
    question: 'How are sessions conducted?',
    answer:
      'All sessions are 1-on-1 and conducted online via Google Meet. You\'ll receive a recurring Meet link that stays the same for all your sessions with your tutor.',
  },
]

export default function HelpPage() {
  const waLink = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi CorvEd, I need help with...')}`
    : null

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Header */}
      <div className="border-b-4 border-[#121212] bg-white px-4 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] sm:text-4xl">
            Help & Support
          </h1>
          <p className="mt-2 text-sm text-[#121212]/60">
            Find answers to common questions or reach out to us directly.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        {/* Contact card */}
        <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#121212]/50 mb-3">
            Contact Us
          </h2>
          <p className="text-sm text-[#121212]/70 mb-4">
            The fastest way to reach us is via WhatsApp. We respond within 1-2 hours during operating
            hours (12 PM - 10 PM PKT, Mon-Sat).
          </p>
          <div className="flex flex-wrap gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 border-2 border-[#121212] bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Message us on WhatsApp
              </a>
            )}
            <a
              href="mailto:support@corved.com"
              className="inline-flex min-h-[44px] items-center gap-2 border-2 border-[#121212] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Email Support
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#121212]/50">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border-4 border-[#121212] bg-white shadow-[4px_4px_0px_0px_#121212]"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-[#121212] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-2 text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="border-t-2 border-[#121212] bg-[#F0F0F0] px-5 py-4">
                  <p className="text-sm leading-relaxed text-[#121212]/70">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="border-4 border-[#121212] bg-white p-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#121212]/50">
            Quick Links
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/policies"
              className="text-sm font-bold text-[#1040C0] underline underline-offset-2"
            >
              Session Policies
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-bold text-[#1040C0] underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm font-bold text-[#1040C0] underline underline-offset-2"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
