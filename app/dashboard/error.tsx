'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="border-4 border-[#121212] bg-white px-8 py-10 shadow-[8px_8px_0_0_#121212]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-[#D02020] bg-[#D02020]">
          <span className="text-lg font-black text-white">!</span>
        </div>
        <h2 className="mb-2 text-xl font-black uppercase tracking-tighter text-[#121212]">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-[#121212]/60">
          {error.message || 'We couldn\u2019t load this page. Please try again.'}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
