// E5 S5.1 T5.3: Package selection page — student selects 8/12/20 session tier
// Closes #31 #35

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PACKAGES } from '@/lib/config/pricing'

function NewPackageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('requestId')

  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect() {
    if (!selected) {
      setError('Please select a package to continue.')
      return
    }
    if (!requestId) {
      setError('No request linked. Please go back and try again.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    const pkg = PACKAGES.find((p) => p.tier === selected)
    if (!pkg) {
      setError('Invalid package selection.')
      setLoading(false)
      return
    }

    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      .toISOString()
      .split('T')[0]

    // Insert package row
    const { data: newPkg, error: pkgError } = await supabase
      .from('packages')
      .insert([
        {
          request_id: requestId,
          tier_sessions: pkg.tier,
          start_date: startDate,
          end_date: endDate,
          sessions_total: pkg.tier,
          sessions_used: 0,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (pkgError || !newPkg) {
      setError('Failed to create package. Please try again.')
      setLoading(false)
      return
    }

    // Advance request status to payment_pending
    const { error: reqError } = await supabase
      .from('requests')
      .update({ status: 'payment_pending' })
      .eq('id', requestId)
      .eq('status', 'new')

    if (reqError) {
      setError('Package created but failed to update request status. Please contact support.')
      setLoading(false)
      return
    }

    // Create initial payment row
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .insert([
        {
          package_id: newPkg.id,
          payer_user_id: user.id,
          amount_pkr: pkg.pricePerMonthPkr,
          method: 'bank_transfer',
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (payError || !payment) {
      setError('Package created but failed to create payment record. Please contact support.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/packages/${newPkg.id}`)
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Select a package
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Choose the number of sessions per month. All sessions are 60 minutes, one-to-one, online.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Package cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {PACKAGES.map((pkg) => {
            const isSelected = selected === pkg.tier
            return (
              <button
                key={pkg.tier}
                type="button"
                onClick={() => setSelected(pkg.tier)}
                className={`rounded-2xl border-2 p-6 text-left transition focus:outline-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 shadow-md dark:bg-indigo-900/30'
                    : 'border-zinc-200 bg-white shadow-sm hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600'
                }`}
              >
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {pkg.sessionsPerMonth} Sessions
                </p>
                <p className="mt-1 text-sm text-zinc-500">{pkg.typicalFrequency}</p>
                <p className="mt-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  PKR {pkg.pricePerMonthPkr.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{pkg.description}</p>
                {isSelected && (
                  <span className="mt-3 inline-block rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Selected
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Policy notes */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <p>📦 Packages are per subject — one package covers one subject for the month.</p>
          <p className="mt-1">⚠️ Unused sessions do not carry over to the next month.</p>
          <p className="mt-1">🕐 All sessions are 60 minutes, one-to-one, online via Google Meet.</p>
        </div>

        <button
          type="button"
          onClick={handleSelect}
          disabled={loading || !selected}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Creating package…' : 'Continue to payment →'}
        </button>
      </div>
    </div>
  )
}

export default function NewPackagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
          <p className="text-center text-zinc-500">Loading…</p>
        </div>
      }
    >
      <NewPackageContent />
    </Suspense>
  )
}
