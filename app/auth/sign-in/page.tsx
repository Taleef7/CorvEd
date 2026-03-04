// E3 S3.1: sign-in page (email/password + Google OAuth)
// Closes #18 #20

import { Suspense } from 'react'
import { SignInForm } from './SignInForm'
import { BauhausGeometricPanel } from '@/components/ui/bauhaus'

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form panel */}
      <div className="flex flex-col bg-[#F0F0F0]">
        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>
      </div>

      {/* Right — Bauhaus geometric decoration */}
      <BauhausGeometricPanel bg="#1040C0" />
    </div>
  )
}

function SignInSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-[#E0E0E0]" />
      <div className="h-10 bg-[#E0E0E0]" />
      <div className="h-10 bg-[#E0E0E0]" />
      <div className="h-11 bg-[#D02020]/30" />
    </div>
  )
}
