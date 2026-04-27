'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AUTH_THROTTLE_MESSAGE,
  checkClientAuthThrottle,
  getFriendlyAuthErrorMessage,
} from '@/lib/auth/throttle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const throttle = checkClientAuthThrottle('password_reset', window.localStorage)
    if (!throttle.allowed) {
      setStatus('error')
      setErrorMsg(AUTH_THROTTLE_MESSAGE)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(
        getFriendlyAuthErrorMessage(
          error.message,
          'Could not send reset instructions. Please wait and try again.',
        ),
      )
    } else {
      setStatus('sent')
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
            Reset Password
          </h1>
          <p className="mb-6 text-sm text-[#121212]/60">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {status === 'sent' ? (
            <div className="space-y-4">
              <div className="border-l-4 border-[#1040C0] bg-[#1040C0]/5 px-4 py-3">
                <p className="text-sm font-medium text-[#1040C0]">Check your email</p>
                <p className="mt-1 text-xs text-[#121212]/60">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>.
                  Check your inbox (and spam folder).
                </p>
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/sign-in">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {status === 'error' && errorMsg && (
                <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-4 py-2">
                  <p className="text-xs text-[#D02020]">{errorMsg}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <p className="text-center text-sm text-[#121212]/60">
                Remember your password?{' '}
                <Link href="/auth/sign-in" className="font-bold text-[#1040C0] underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
