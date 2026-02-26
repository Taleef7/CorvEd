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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Audit Log</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Most recent {logs.length} platform events — times shown in PKT (Asia/Karachi)
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No audit events recorded yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Events are logged automatically when admin actions are performed (payments, tutor
            approvals, session updates, etc.).
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
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
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {formatAuditTime(log.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{actorName}</td>
                    <td className="px-4 py-2.5 text-zinc-900 dark:text-zinc-100">{actionLabel}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {log.entity_type}
                      </span>{' '}
                      <span className="text-zinc-400 dark:text-zinc-500">{entityIdShort}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
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
