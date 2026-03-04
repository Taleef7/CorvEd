'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0] px-4">
      <div className="max-w-md border-4 border-[#121212] bg-white px-8 py-12 text-center shadow-[8px_8px_0_0_#121212]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-[#D02020] bg-[#D02020]">
          <span className="text-2xl font-black text-white">!</span>
        </div>
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tighter text-[#121212]">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-[#121212]/60">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
