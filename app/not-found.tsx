import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0] px-4">
      <div className="max-w-md border-4 border-[#121212] bg-white px-8 py-12 text-center shadow-[8px_8px_0_0_#121212]">
        <div className="mx-auto mb-6 flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#D02020]" />
          <span className="text-6xl font-black tracking-tighter text-[#121212]">
            404
          </span>
          <div
            className="h-12 w-12"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: '#1040C0',
            }}
          />
        </div>
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tighter text-[#121212]">
          Page Not Found
        </h1>
        <p className="mb-6 text-sm text-[#121212]/60">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
