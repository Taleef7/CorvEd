'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.')
      setStatus('error')
      return
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0] px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1" aria-hidden="true">
            <div className="h-5 w-5 rounded-full bg-[#D02020]" />
            <div className="h-5 w-5 bg-[#F0C020]" />
            <div className="h-5 w-5" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#1040C0' }} />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-[#121212]">CorvEd</span>
        </div>

        <div className="border-4 border-[#121212] bg-white px-8 py-10 shadow-[8px_8px_0_0_#121212]">
          <h1 className="mb-2 text-2xl font-black uppercase tracking-tighter text-[#121212]">
            New Password
          </h1>
          <p className="mb-6 text-sm text-[#121212]/60">
            Choose a new password for your account.
          </p>

          {status === 'success' ? (
            <div className="border-l-4 border-[#1040C0] bg-[#1040C0]/5 px-4 py-3">
              <p className="text-sm font-medium text-[#1040C0]">Password updated!</p>
              <p className="mt-1 text-xs text-[#121212]/60">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {status === 'error' && errorMsg && (
                <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-4 py-2">
                  <p className="text-xs text-[#D02020]">{errorMsg}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
