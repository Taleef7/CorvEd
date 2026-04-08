// E3 S3.1: email verification instructions page
// Closes #18 #20

import Link from 'next/link'
import { BauhausLogo, BauhausGeometricPanel } from '@/components/ui/bauhaus'
import { ResendVerificationButton } from './ResendButton'

export default function VerifyPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — content */}
      <div className="flex flex-col items-center justify-center bg-[#F0F0F0] px-6 py-12">
        <div className="w-full max-w-sm">
          <BauhausLogo size="lg" />

          {/* Envelope icon (Bauhaus-styled square container) */}
          <div
            aria-hidden="true"
            className="mt-8 mb-6 flex h-20 w-20 items-center justify-center border-4 border-[#121212] bg-[#1040C0] shadow-[4px_4px_0px_0px_#121212]"
          >
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
            Check Your Inbox
          </h1>
          <p className="mt-3 text-sm text-[#121212]/70 leading-relaxed">
            We sent a confirmation link to your email address. Click it to verify your account and access your dashboard.
          </p>

          <div className="mt-6 border-l-4 border-[#F0C020] bg-[#F0C020]/20 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#121212] mb-1">
              Didn&apos;t receive it?
            </p>
            <ul className="space-y-1 text-sm text-[#121212]/70">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>The link expires after 1 hour</li>
            </ul>
          </div>

          <ResendVerificationButton />

          <p className="mt-6 text-sm text-[#121212]/60">
            Wrong email?{' '}
            <Link
              href="/auth/sign-up"
              className="font-bold text-[#1040C0] underline underline-offset-2 hover:text-[#D02020]"
            >
              Go back and sign up again
            </Link>
          </p>
        </div>
      </div>

      {/* Right — geometric panel */}
      <BauhausGeometricPanel bg="#F0C020" />
    </div>
  )
}
