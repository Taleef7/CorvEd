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
  const tierParam = searchParams.get('tier')

  const [selected, setSelected] = useState<number | null>(
    tierParam ? Number(tierParam) : null
  )
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
    const startDate = today.toISOString().slice(0, 10)
    // Compute end date as same day next month, clamped to last day of that month
    const endDateObj = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate()),
    )
    // If day overflowed into the following month (e.g. Jan 31 → Mar), clamp to last day
    if (endDateObj.getUTCMonth() !== (today.getUTCMonth() + 1) % 12) {
      endDateObj.setUTCDate(0)
    }
    const endDate = endDateObj.toISOString().slice(0, 10)

    // Check for existing active/pending package to prevent duplicates
    const { data: existingPkg } = await supabase
      .from('packages')
      .select('id')
      .eq('request_id', requestId)
      .in('status', ['pending', 'active'])
      .maybeSingle()

    if (existingPkg) {
      router.push(`/dashboard/packages/${existingPkg.id}`)
      return
    }

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
    const { data: updatedRequests, error: reqError } = await supabase
      .from('requests')
      .update({ status: 'payment_pending' })
      .eq('id', requestId)
      .eq('status', 'new')
      .select()

    if (reqError || !updatedRequests || updatedRequests.length === 0) {
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
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
            Select a package
          </h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            Choose the number of sessions per month. All sessions are 60 minutes, one-to-one, online.
          </p>
        </div>

        {error && (
          <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-4 py-3">
            <p className="text-sm font-bold text-[#D02020]">{error}</p>
          </div>
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
                className={`border-4 border-[#121212] p-6 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1040C0] ${
                  isSelected
                    ? 'bg-[#1040C0] text-white shadow-[6px_6px_0px_0px_#121212]'
                    : 'bg-white hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121212]'
                }`}
              >
                <p className={`text-xl font-black ${isSelected ? 'text-white' : 'text-[#121212]'}`}>
                  {pkg.sessionsPerMonth} Sessions
                </p>
                <p className={`mt-1 text-sm ${isSelected ? 'text-white/70' : 'text-[#121212]/60'}`}>{pkg.typicalFrequency}</p>
                <p className={`mt-3 text-lg font-bold ${isSelected ? 'text-white' : 'text-[#1040C0]'}`}>
                  PKR {pkg.pricePerMonthPkr.toLocaleString()}
                </p>
                <p className={`mt-1 text-xs ${isSelected ? 'text-white/60' : 'text-[#121212]/40'}`}>{pkg.description}</p>
                {isSelected && (
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white">
                    &#10003; Selected
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Policy notes */}
        <div className="border-4 border-[#121212] bg-white p-4 text-sm text-[#121212]/60">
          <p>📦 Packages are per subject — one package covers one subject for the month.</p>
          <p className="mt-1">⚠️ Unused sessions do not carry over to the next month.</p>
          <p className="mt-1">🕐 All sessions are 60 minutes, one-to-one, online via Google Meet.</p>
        </div>

        <button
          type="button"
          onClick={handleSelect}
          disabled={loading || !selected}
          className="inline-flex min-h-[52px] w-full items-center justify-center border-2 border-[#121212] bg-[#D02020] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121212] disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
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
        <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
          <p className="text-center text-[#121212]/60">Loading…</p>
        </div>
      }
    >
      <NewPackageContent />
    </Suspense>
  )
}
