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
  rejection_note: string | null
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
  const [proofUrl, setProofUrl] = useState<string | null>(null)
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
          .select('id, amount_pkr, status, reference, proof_path, rejection_note')
          .eq('package_id', id)
          .maybeSingle(),
      ])

      setRequest(reqData as RequestRow | null)
      setPayment(payData)
      if (payData?.reference) setReference(payData.reference)
      if (payData?.proof_path) {
        // Use server action to get signed URL for private bucket
        const { getPaymentProofSignedUrl } = await import('@/app/dashboard/packages/actions')
        const { url } = await getPaymentProofSignedUrl(payData.proof_path, id)
        if (url) setProofUrl(url)
      }
      if (payData?.status === 'paid') setSubmitted(true)
      // For rejected payments, do NOT set submitted — allow re-upload
      if (payData?.status === 'pending' && (payData?.proof_path || payData?.reference)) setSubmitted(true)
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

    // If payment was rejected, use the resubmit flow
    if (payment.status === 'rejected') {
      let newProofPath: string | null = payment.proof_path
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
        newProofPath = uploadData.path
      }

      const { resubmitRejectedPayment } = await import('@/app/dashboard/packages/actions')
      const result = await resubmitRejectedPayment(
        payment.id,
        reference.trim() || null,
        newProofPath
      )
      if (!result.success) {
        if (file && newProofPath && newProofPath !== payment.proof_path) {
          await supabase.storage.from('payment-proofs').remove([newProofPath])
        }
        setError(result.error || 'Failed to resubmit payment.')
        setSubmitting(false)
        return
      }
      // Refresh the page to show updated status
      router.refresh()
      setSubmitted(true)
      setSubmitting(false)
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

    const { updatePendingPaymentDetails } = await import('@/app/dashboard/packages/actions')
    const result = await updatePendingPaymentDetails(
      payment.id,
      reference.trim() || null,
      proofPath,
    )

    if (!result.success) {
      if (file && proofPath && proofPath !== payment.proof_path) {
        await supabase.storage.from('payment-proofs').remove([proofPath])
      }
      setError(result.error || 'Failed to save payment details. Please try again.')
      setSubmitting(false)
      return
    }

    // Update proof URL for display using signed URL
    if (proofPath) {
      const { getPaymentProofSignedUrl } = await import('@/app/dashboard/packages/actions')
      const { url } = await getPaymentProofSignedUrl(proofPath, id)
      if (url) setProofUrl(url)
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
        <p className="text-center text-[#121212]/60">Loading…</p>
      </div>
    )
  }

  if (!pkg || !payment || !request) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
        <p className="text-center text-[#121212]/60">Package not found.</p>
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
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Package summary */}
        <div className="border-4 border-[#121212] bg-white px-8 py-8">
          <h1 className="text-xl font-bold text-[#121212]">
            {pkg.tier_sessions} Sessions/Month
          </h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            {levelLabel} — {subjectName}
          </p>
          <p className="mt-1 text-sm text-[#121212]/60">
            {formatDate(pkg.start_date)} → {formatDate(pkg.end_date)}
          </p>
          <p className="mt-3 text-2xl font-bold text-[#1040C0]">
            PKR {payment.amount_pkr.toLocaleString()}
          </p>
          {pkgConfig && (
            <p className="mt-1 text-xs text-[#121212]/40">{pkgConfig.typicalFrequency} · 60 min/session</p>
          )}
        </div>

        {/* Payment status banner */}
        {payment.status === 'paid' && (
          <div className="border-2 border-[#121212] bg-white p-4">
            <p className="text-sm font-semibold text-[#121212]">
              ✅ Payment confirmed! Your package is now active.
            </p>
          </div>
        )}
        {payment.status === 'rejected' && (
          <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 p-4 space-y-2">
            <p className="text-sm font-semibold text-[#D02020]">
              Payment was rejected.
            </p>
            {payment.rejection_note && (
              <p className="text-sm text-[#121212]/70">
                Reason: {payment.rejection_note}
              </p>
            )}
            <p className="text-sm text-[#121212]/60">
              Please re-upload your proof of payment below.
            </p>
          </div>
        )}
        {payment.status === 'pending' && submitted && (
          <div className="border-l-4 border-[#F0C020] bg-[#F0C020]/20 p-4">
            <p className="text-sm font-semibold text-[#121212]">
              ⏳ Payment pending verification. We&apos;ll notify you on WhatsApp once confirmed.
            </p>
          </div>
        )}

        {/* Bank transfer instructions */}
        <div className="border-4 border-[#121212] bg-white px-8 py-6">
          <h2 className="mb-4 text-base font-semibold text-[#121212]">
            Bank Transfer Instructions
          </h2>
          <dl className="space-y-2 text-sm">
            {PAYMENT_INSTRUCTIONS.bankName && (
              <div className="flex justify-between">
                <dt className="text-[#121212]/60">Bank</dt>
                <dd className="font-medium text-[#121212]">
                  {PAYMENT_INSTRUCTIONS.bankName}
                </dd>
              </div>
            )}
            {PAYMENT_INSTRUCTIONS.accountTitle && (
              <div className="flex justify-between">
                <dt className="text-[#121212]/60">Account title</dt>
                <dd className="font-medium text-[#121212]">
                  {PAYMENT_INSTRUCTIONS.accountTitle}
                </dd>
              </div>
            )}
            {PAYMENT_INSTRUCTIONS.accountNumber && (
              <div className="flex justify-between">
                <dt className="text-[#121212]/60">Account / IBAN</dt>
                <dd className="font-medium text-[#121212]">
                  {PAYMENT_INSTRUCTIONS.accountNumber}
                </dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-[#121212]/60">Reference to use</dt>
              <dd className=" bg-[#F0F0FF] px-3 py-2 font-mono text-sm font-semibold text-[#0830A0]">
                {reference_}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[#121212]/60">{PAYMENT_INSTRUCTIONS.notes}</p>
        </div>

        {/* Proof upload form (show if payment is pending and not yet submitted, OR if rejected for re-upload) */}
        {((payment.status === 'pending' && !submitted) || payment.status === 'rejected') && (
          <div className="border-4 border-[#121212] bg-white px-8 py-6">
            <h2 className="mb-4 text-base font-semibold text-[#121212]">
              Submit payment confirmation
            </h2>
            <p className="mb-4 text-sm text-[#121212]/60">
              After making the transfer, optionally upload a screenshot and/or enter your transaction
              reference ID below.
            </p>

            {error && (
              <p className="mb-3 border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2 text-sm text-[#D02020]">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="transaction-reference"
                  className="mb-1 block text-sm font-medium text-[#121212]/80"
                >
                  Transaction reference / ID (optional)
                </label>
                <input
                  id="transaction-reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TRX123456789"
                  className="w-full  border border-[#B0B0B0] px-3 py-2 text-sm placeholder:text-[#121212]/40 focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0]"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-proof"
                  className="mb-1 block text-sm font-medium text-[#121212]/80"
                >
                  Payment proof screenshot (optional, max 5 MB)
                </label>
                <input
                  id="payment-proof"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[#121212]/60 file:mr-3 file: file:border-0 file:bg-[#F0F0FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0830A0] hover:file:bg-[#E0E8FF]"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full inline-flex min-h-[44px] items-center border-2 border-[#121212] bg-[#1040C0] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'I have made the transfer →'}
              </button>
            </div>
          </div>
        )}

        {/* Show already-submitted payment info */}
        {payment.status === 'pending' && submitted && (
          <div className="border-4 border-[#121212] bg-white px-8 py-6 space-y-4">
            <h2 className="text-base font-semibold text-[#121212]">
              Your submission
            </h2>
            {payment.reference && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#121212]/50">
                  Transaction Reference
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-[#121212]">
                  {payment.reference}
                </p>
              </div>
            )}
            {proofUrl && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#121212]/50">
                  Payment Proof
                </p>
                {proofUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofUrl}
                      alt="Payment proof"
                      className="max-h-48 border-2 border-[#D0D0D0] object-contain"
                    />
                    <span className="mt-1 block text-xs text-[#1040C0] underline">View full image</span>
                  </a>
                ) : (
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#1040C0] underline underline-offset-2"
                  >
                    📎 View uploaded proof
                  </a>
                )}
              </div>
            )}
            {!payment.reference && !proofUrl && (
              <p className="text-sm text-[#121212]/60">
                No reference or proof was submitted yet.
              </p>
            )}
            <p className="text-xs text-[#121212]/40 mt-2">
              Need to update? Upload a new screenshot below.
            </p>

            {error && (
              <p className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2 text-sm text-[#D02020]">
                {error}
              </p>
            )}

            <div className="space-y-3 border-t border-[#E0E0E0] pt-4">
              <div>
                <label
                  htmlFor="transaction-reference-update"
                  className="mb-1 block text-sm font-medium text-[#121212]/80"
                >
                  Update reference (optional)
                </label>
                <input
                  id="transaction-reference-update"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TRX123456789"
                  className="w-full border border-[#B0B0B0] px-3 py-2 text-sm placeholder:text-[#121212]/40 focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0]"
                />
              </div>
              <div>
                <label
                  htmlFor="payment-proof-update"
                  className="mb-1 block text-sm font-medium text-[#121212]/80"
                >
                  Upload new proof (optional, max 5 MB)
                </label>
                <input
                  id="payment-proof-update"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[#121212]/60 file:mr-3 file:border-0 file:bg-[#F0F0FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0830A0] hover:file:bg-[#E0E8FF]"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex min-h-[40px] items-center border-2 border-[#121212] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? 'Updating…' : 'Update payment details'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <a
            href="/dashboard"
            className="text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
