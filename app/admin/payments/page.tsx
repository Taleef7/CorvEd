// E5 T5.3 S5.2 E11 T11.2 T11.3: Admin payments list — view, mark paid, mark rejected, WhatsApp actions
// Closes #35 #32 #75 #76

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { LEVEL_LABELS } from '@/lib/utils/request'
import { MarkPaidForm, RejectForm } from './PaymentActions'
import { ViewProofButton } from './ViewProofButton'
import { PaymentQuickActions } from './PaymentQuickActions'
import Link from 'next/link'
import { templates } from '@/lib/whatsapp/templates'
import { PAYMENT_INSTRUCTIONS } from '@/lib/config/pricing'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'

const STATUS_COLOURS: Record<string, string> = {
  pending: 'border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]',
  paid: 'border-2 border-[#121212] bg-[#121212] text-white',
  rejected: 'border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]',
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
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { filter, page } = await searchParams
  const activeFilter: FilterStatus =
    filter === 'paid' || filter === 'rejected' ? filter : filter === 'all' ? 'all' : 'pending'
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  // Separate count query (complex joins + range interact badly)
  let countQuery = admin
    .from('payments')
    .select('id', { count: 'exact', head: true })
  if (activeFilter !== 'all') countQuery = countQuery.eq('status', activeFilter)

  let dataQuery = admin
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
    .range(from, to)

  if (activeFilter !== 'all') {
    dataQuery = dataQuery.eq('status', activeFilter)
  }

  const [{ count: totalCount }, { data: payments }] = await Promise.all([countQuery, dataQuery])

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
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Payments</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filterLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/payments?filter=${value}`}
            className={` px-3 py-1.5 text-sm font-medium transition ${
              activeFilter === value
                ? 'bg-[#1040C0] text-white'
                : 'bg-white text-[#121212]/70 hover:bg-[#E0E0E0] '
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center ">
          <p className="text-[#121212]/60">No {activeFilter === 'all' ? '' : activeFilter} payments found.</p>
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
                className="border-4 border-[#121212] bg-white px-6 py-5 "
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#121212]">
                      {profile?.display_name ?? '—'}
                    </p>
                    <p className="text-sm text-[#121212]/60">
                      {subjectName} · {level} · {pkg?.tier_sessions ?? '?'} sessions/month
                    </p>
                    <p className="text-sm text-[#121212]/60">
                      Amount: <span className="font-bold text-[#121212]">PKR {payment.amount_pkr.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-[#121212]/40">Submitted: {submittedDate}</p>
                    {payment.reference && (
                      <p className="text-xs text-[#121212]/60">Ref: {payment.reference}</p>
                    )}
                    {payment.rejection_note && (
                      <p className="text-xs text-red-600">
                        Note: {payment.rejection_note}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOURS[payment.status] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
                  >
                    {payment.status}
                  </span>
                </div>

                {/* Action buttons — only for pending payments with valid related data */}
                {payment.status === 'pending' && pkg?.id && req?.id && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {payment.proof_path && (
                      <ViewProofButton proofPath={payment.proof_path} />
                    )}

                    <MarkPaidForm
                      paymentId={payment.id}
                      packageId={pkg.id}
                      requestId={req.id}
                    />

                    <RejectForm paymentId={payment.id} />
                  </div>
                )}

                {/* Quick actions: WhatsApp + copy messages */}
                {profile?.display_name && subjectName !== '—' && (
                  <div className="mt-3 border-t border-[#E0E0E0] pt-3">
                    <PaymentQuickActions
                      whatsappNumber={profile?.whatsapp_number ?? null}
                      confirmedMessage={templates.paid({ subject: subjectName })}
                      instructionsMessage={templates.paybank({
                        accountTitle: PAYMENT_INSTRUCTIONS.accountTitle,
                        bank: PAYMENT_INSTRUCTIONS.bankName,
                        accountNumber: PAYMENT_INSTRUCTIONS.accountNumber,
                        studentName: profile.display_name,
                        level,
                        subject: subjectName,
                      })}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalCount={totalCount ?? 0}
        baseHref={`/admin/payments?filter=${activeFilter}`}
      />
    </div>
  )
}


