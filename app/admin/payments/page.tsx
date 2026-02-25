// E5 T5.3 S5.2 E11 T11.2 T11.3: Admin payments list — view, mark paid, mark rejected, WhatsApp actions
// Closes #35 #32 #75 #76

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { LEVEL_LABELS } from '@/lib/utils/request'
import { MarkPaidForm, RejectForm } from './PaymentActions'
import Link from 'next/link'
import { CopyMessageButton } from '@/components/CopyMessageButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { templates } from '@/lib/whatsapp/templates'
import { PAYMENT_INSTRUCTIONS } from '@/lib/config/pricing'

const STATUS_COLOURS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
}

type FilterStatus = 'all' | 'pending' | 'paid' | 'rejected'

type PaymentRow = {
  id: string
  amount_pkr: number
  status: string
  reference: string | null
  proof_path: string | null
  created_at: string
  rejection_note: string | null
  packages: {
    id: string
    tier_sessions: number
    request_id: string
    requests: {
      id: string
      level: string
      subjects: { name: string } | null
      user_profiles: { display_name: string; whatsapp_number: string | null } | null
    } | null
  } | null
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const activeFilter: FilterStatus =
    filter === 'paid' || filter === 'rejected' ? filter : filter === 'all' ? 'all' : 'pending'

  const admin = createAdminClient()

  let query = admin
    .from('payments')
    .select(
      `id, amount_pkr, status, reference, proof_path, created_at, rejection_note,
       packages (
         id, tier_sessions, request_id,
         requests (
           id, level,
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number )
         )
       )`
    )
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: payments } = await query

  const rows = (payments ?? []) as unknown as PaymentRow[]

  const filterLinks: { label: string; value: FilterStatus }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payments</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filterLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/payments?filter=${value}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              activeFilter === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-md dark:bg-zinc-900">
          <p className="text-zinc-500">No {activeFilter === 'all' ? '' : activeFilter} payments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((payment) => {
            const pkg = payment.packages
            const req = pkg?.requests
            const profile = req?.user_profiles
            const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
            const level = LEVEL_LABELS[req?.level ?? ''] ?? req?.level ?? '—'
            const submittedDate = new Date(payment.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={payment.id}
                className="rounded-2xl bg-white px-6 py-5 shadow-md dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {profile?.display_name ?? '—'}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {subjectName} · {level} · {pkg?.tier_sessions ?? '?'} sessions/month
                    </p>
                    <p className="text-sm text-zinc-500">
                      Amount: <span className="font-medium text-zinc-800 dark:text-zinc-200">PKR {payment.amount_pkr.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-zinc-400">Submitted: {submittedDate}</p>
                    {payment.reference && (
                      <p className="text-xs text-zinc-500">Ref: {payment.reference}</p>
                    )}
                    {payment.rejection_note && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Note: {payment.rejection_note}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOURS[payment.status] ?? 'bg-zinc-100 text-zinc-700'}`}
                  >
                    {payment.status}
                  </span>
                </div>

                {/* Action buttons — only for pending payments with valid related data */}
                {payment.status === 'pending' && pkg?.id && req?.id && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {payment.proof_path && (
                      <ProofLinkButton proofPath={payment.proof_path} />
                    )}

                    <MarkPaidForm
                      paymentId={payment.id}
                      packageId={pkg.id}
                      requestId={req.id}
                    />

                    <RejectForm paymentId={payment.id} />
                  </div>
                )}

                {/* WhatsApp message buttons — only when student and subject data are available */}
                {profile?.display_name && subjectName !== '—' && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <WhatsAppLink number={profile?.whatsapp_number ?? null} label="Open chat" />
                    <CopyMessageButton
                      message={templates.paid({ subject: subjectName })}
                      whatsappNumber={profile?.whatsapp_number ?? undefined}
                      label="Copy payment confirmed"
                    />
                    <CopyMessageButton
                      message={templates.paybank({
                        accountTitle: PAYMENT_INSTRUCTIONS.accountTitle,
                        bank: PAYMENT_INSTRUCTIONS.bankName,
                        accountNumber: PAYMENT_INSTRUCTIONS.accountNumber,
                        studentName: profile.display_name,
                        level,
                        subject: subjectName,
                      })}
                      whatsappNumber={profile?.whatsapp_number ?? undefined}
                      label="Copy payment instructions"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Inline server component for proof indicator (signed URL generation is in PaymentActions)
function ProofLinkButton({ proofPath }: { proofPath: string }) {
  void proofPath
  return (
    <span className="text-xs text-zinc-400 italic">
      Proof on file (view via Supabase Storage)
    </span>
  )
}
