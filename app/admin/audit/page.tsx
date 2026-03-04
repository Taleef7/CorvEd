// E12 T12.3: Admin audit log page — shows recent 200 audit events ordered newest first
// Closes #80

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_TIMEZONE = 'Asia/Karachi'

// Human-readable labels for known audit actions
const AUDIT_ACTION_LABELS: Record<string, string> = {
  payment_marked_paid: '💳 Payment marked paid',
  payment_marked_rejected: '❌ Payment rejected',
  tutor_approved: '✅ Tutor approved',
  tutor_approval_revoked: '🚫 Tutor approval revoked',
  tutor_assigned: '🎓 Tutor assigned to request',
  tutor_reassigned: '🔄 Tutor reassigned',
  sessions_generated: '📅 Sessions generated',
  session_rescheduled: '📅 Session rescheduled',
  session_status_updated: '📝 Session status updated',
  match_details_updated: '🔗 Match details updated',
}

function formatAuditTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ADMIN_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

type AuditLogRow = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user_profiles: { display_name: string } | null
}

export default async function AdminAuditPage() {
  const admin = createAdminClient()

  const { data: logsData } = await admin
    .from('audit_logs')
    .select(
      'id, action, entity_type, entity_id, details, created_at, user_profiles!actor_user_id(display_name)'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  const logs = (logsData ?? []) as unknown as AuditLogRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Audit Log</h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            Most recent {logs.length} platform events — times shown in PKT (Asia/Karachi)
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No audit events recorded yet.</p>
          <p className="mt-1 text-sm text-[#121212]/40">
            Events are logged automatically when admin actions are performed (payments, tutor
            approvals, session updates, etc.).
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-4 border-[#121212] bg-white">
          <table className="min-w-full divide-y divide-[#E0E0E0] text-sm">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {logs.map((log) => {
                const actorName =
                  (log.user_profiles as { display_name: string } | null)?.display_name ?? 'System'
                const actionLabel = AUDIT_ACTION_LABELS[log.action] ?? log.action
                const detailsStr = log.details
                  ? Object.entries(log.details)
                      .map(([k, v]) => {
                        const str =
                          v !== null && typeof v === 'object'
                            ? JSON.stringify(v)
                            : String(v)
                        return `${k}: ${str.length > 80 ? str.slice(0, 77) + '…' : str}`
                      })
                      .join(' · ')
                  : '—'
                // Truncate entity_id to first 8 chars for readability (UUID)
                const entityIdShort = log.entity_id ? log.entity_id.slice(0, 8) + '…' : '—'

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F0F0F0]/50"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#121212]/60 ">
                      {formatAuditTime(log.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-[#121212]/80">{actorName}</td>
                    <td className="px-4 py-2.5 text-[#121212]">{actionLabel}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className="bg-[#E0E0E0] px-1.5 py-0.5 font-mono text-[#121212]">
                        {log.entity_type}
                      </span>{' '}
                      <span className="text-[#121212]/40">{entityIdShort}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#121212]/60  max-w-xs truncate">
                      {detailsStr}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
