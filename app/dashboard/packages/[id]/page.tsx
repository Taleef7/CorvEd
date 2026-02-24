// E5 T5.3 S5.1: Package payment submission page — bank instructions + optional proof upload
// Closes #35 #31

'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PAYMENT_INSTRUCTIONS, PACKAGES } from '@/lib/config/pricing'
import { LEVEL_LABELS } from '@/lib/utils/request'

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

type PackageRow = {
  id: string
  tier_sessions: number
  start_date: string
  end_date: string
  status: string
  request_id: string
}

type PaymentRow = {
  id: string
  amount_pkr: number
  status: string
  reference: string | null
  proof_path: string | null
}

type RequestRow = {
  id: string
  level: string
  subject_id: number
  subjects: { name: string } | null
}

type ProfileRow = {
  display_name: string
}

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [pkg, setPkg] = useState<PackageRow | null>(null)
  const [payment, setPayment] = useState<PaymentRow | null>(null)
  const [request, setRequest] = useState<RequestRow | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [reference, setReference] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      const [{ data: pkgData }, { data: profileData }] = await Promise.all([
        supabase
          .from('packages')
          .select('id, tier_sessions, start_date, end_date, status, request_id')
          .eq('id', id)
          .single(),
        supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single(),
      ])

      if (!pkgData) {
        router.push('/dashboard')
        return
      }

      setPkg(pkgData)
      setProfile(profileData)

      const [{ data: reqData }, { data: payData }] = await Promise.all([
        supabase
          .from('requests')
          .select('id, level, subject_id, subjects(name)')
          .eq('id', pkgData.request_id)
          .single(),
        supabase
          .from('payments')
          .select('id, amount_pkr, status, reference, proof_path')
          .eq('package_id', id)
          .maybeSingle(),
      ])

      setRequest(reqData as RequestRow | null)
      setPayment(payData)
      if (payData?.reference) setReference(payData.reference)
      if (payData?.status === 'paid' || payData?.status === 'rejected') setSubmitted(true)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleSubmit() {
    if (!payment) return
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    let proofPath: string | null = payment.proof_path

    // Upload proof file if selected
    if (file) {
      if (file.size > MAX_PROOF_SIZE_BYTES) {
        setError('File is too large. Maximum size is 5 MB.')
        setSubmitting(false)
        return
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, or PDF files are allowed.')
        setSubmitting(false)
        return
      }

      // Sanitize filename: preserve only the final extension, clean the base name
      const lastDot = file.name.lastIndexOf('.')
      const baseName = (lastDot > 0 ? file.name.slice(0, lastDot) : file.name)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 60)
      const ext = lastDot > 0 ? file.name.slice(lastDot).replace(/[^a-zA-Z0-9.]/g, '') : ''
      const safeFileName = baseName + ext
      const filePath = `${user.id}/${id}/${Date.now()}_${safeFileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file)

      if (uploadError) {
        setError('Failed to upload proof. Please try again.')
        setSubmitting(false)
        return
      }
      proofPath = uploadData.path
    }

    // Update payment with reference and/or proof
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        reference: reference.trim() || null,
        proof_path: proofPath,
      })
      .eq('id', payment.id)

    if (updateError) {
      setError('Failed to save payment details. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
        <p className="text-center text-zinc-500">Loading…</p>
      </div>
    )
  }

  if (!pkg || !payment || !request) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
        <p className="text-center text-zinc-500">Package not found.</p>
      </div>
    )
  }

  const pkgConfig = PACKAGES.find((p) => p.tier === pkg.tier_sessions)
  const subjectName =
    (request.subjects as { name: string } | null)?.name ?? `Subject #${request.subject_id}`
  const levelLabel = LEVEL_LABELS[request.level] ?? request.level
  const studentName = profile?.display_name ?? 'Student'

  const sanitizeRefValue = (value: string) => value.replace(/\|/g, '')
  const reference_ = PAYMENT_INSTRUCTIONS.referenceFormat
    .replace('{StudentName}', sanitizeRefValue(studentName))
    .replace('{Subject}', sanitizeRefValue(subjectName))
    .replace('{Level}', sanitizeRefValue(levelLabel))

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Package summary */}
        <div className="rounded-2xl bg-white px-8 py-8 shadow-md dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {pkg.tier_sessions} Sessions/Month
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {levelLabel} — {subjectName}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(pkg.start_date)} → {formatDate(pkg.end_date)}
          </p>
          <p className="mt-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            PKR {payment.amount_pkr.toLocaleString()}
          </p>
          {pkgConfig && (
            <p className="mt-1 text-xs text-zinc-400">{pkgConfig.typicalFrequency} · 60 min/session</p>
          )}
        </div>

        {/* Payment status banner */}
        {payment.status === 'paid' && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              ✅ Payment confirmed! Your package is now active.
            </p>
          </div>
        )}
        {payment.status === 'rejected' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              ❌ Payment was rejected. Please contact us on WhatsApp.
            </p>
          </div>
        )}
        {payment.status === 'pending' && submitted && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              ⏳ Payment pending verification. We&apos;ll notify you on WhatsApp once confirmed.
            </p>
          </div>
        )}

        {/* Bank transfer instructions */}
        <div className="rounded-2xl bg-white px-8 py-6 shadow-md dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Bank Transfer Instructions
          </h2>
          <dl className="space-y-2 text-sm">
            {PAYMENT_INSTRUCTIONS.bankName && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Bank</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                  {PAYMENT_INSTRUCTIONS.bankName}
                </dd>
              </div>
            )}
            {PAYMENT_INSTRUCTIONS.accountTitle && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Account title</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                  {PAYMENT_INSTRUCTIONS.accountTitle}
                </dd>
              </div>
            )}
            {PAYMENT_INSTRUCTIONS.accountNumber && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Account / IBAN</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                  {PAYMENT_INSTRUCTIONS.accountNumber}
                </dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-zinc-500">Reference to use</dt>
              <dd className="rounded-md bg-indigo-50 px-3 py-2 font-mono text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {reference_}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-zinc-500">{PAYMENT_INSTRUCTIONS.notes}</p>
        </div>

        {/* Proof upload form (only show if payment is still pending) */}
        {payment.status === 'pending' && !submitted && (
          <div className="rounded-2xl bg-white px-8 py-6 shadow-md dark:bg-zinc-900">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Submit payment confirmation
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              After making the transfer, optionally upload a screenshot and/or enter your transaction
              reference ID below.
            </p>

            {error && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="transaction-reference"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Transaction reference / ID (optional)
                </label>
                <input
                  id="transaction-reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TRX123456789"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-proof"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Payment proof screenshot (optional, max 5 MB)
                </label>
                <input
                  id="payment-proof"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'I have made the transfer →'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <a
            href="/dashboard"
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
