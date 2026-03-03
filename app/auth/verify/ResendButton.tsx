'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ResendVerificationButton() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleResend() {
    if (!email) {
      setErrorMsg('Please enter your email address.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Re-enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={status === 'loading' || status === 'sent'}
        >
          {status === 'loading'
            ? 'Sending...'
            : status === 'sent'
              ? '✓ Sent'
              : 'Resend'}
        </Button>
      </div>
      {status === 'error' && errorMsg && (
        <p className="text-xs text-[#D02020]">{errorMsg}</p>
      )}
      {status === 'sent' && (
        <p className="text-xs text-[#1040C0]">Verification email resent. Check your inbox.</p>
      )}
    </div>
  )
}
