// E12 T12.3: Admin audit log page — shows recent 200 audit events ordered newest first
// Closes #80

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { AuditFilters } from './AuditFilters'

const ADMIN_TIMEZONE = 'Asia/Karachi'

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
  match_notes_updated: '📋 Match notes updated',
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

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; entity?: string }>
}) {
  const admin = createAdminClient()
  const params = await searchParams
  const searchQ = (params.q ?? '').trim().toLowerCase()
  const filterAction = params.action ?? ''
  const filterEntity = params.entity ?? ''

  let query = admin
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, details, created_at, user_profiles!actor_user_id(display_name)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (filterAction) query = query.eq('action', filterAction)
  if (filterEntity) query = query.eq('entity_type', filterEntity)

  const { data: logsData } = await query
  let logs = (logsData ?? []) as unknown as AuditLogRow[]

  // Client-side keyword search on actor name and details string
  if (searchQ) {
    logs = logs.filter((log) => {
      const actor = ((log.user_profiles as { display_name: string } | null)?.display_name ?? '').toLowerCase()
      const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : ''
      return actor.includes(searchQ) || log.action.includes(searchQ) || detailsStr.includes(searchQ)
    })
  }

  // Collect distinct action types for the filter dropdown
  const { data: allActions } = await admin
    .from('audit_logs')
    .select('action')
    .order('action')
    .limit(500)
  const distinctActions = [...new Set((allActions ?? []).map((r: { action: string }) => r.action))].sort()

  const ENTITY_TYPES = ['session', 'match', 'payment', 'tutor_profile', 'request']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Audit Log</h1>
        <p className="mt-1 text-sm text-[#121212]/60">
          Platform events — times shown in PKT (Asia/Karachi)
        </p>
      </div>

      {/* Filter bar (client component) */}
      <AuditFilters
        currentQ={params.q ?? ''}
        currentAction={filterAction}
        currentEntity={filterEntity}
        actionOptions={distinctActions.map((a) => ({ value: a, label: AUDIT_ACTION_LABELS[a] ?? a }))}
        entityOptions={ENTITY_TYPES}
      />

      <p className="text-xs text-[#121212]/40">
        Showing {logs.length} event{logs.length !== 1 ? 's' : ''}
        {filterAction || filterEntity || searchQ ? ' (filtered)' : ''}
      </p>

      {logs.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No audit events match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-4 border-[#121212] bg-white">
          <table className="min-w-full divide-y divide-[#E0E0E0] text-sm">
            <thead className="bg-[#121212]">
              <tr>
                {['Timestamp', 'Actor', 'Action', 'Entity', 'Details'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white"
                  >
                    {h}
                  </th>
                ))}
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
                const entityIdShort = log.entity_id ? log.entity_id.slice(0, 8) + '…' : '—'

                return (
                  <tr key={log.id} className="hover:bg-[#F0F0F0]/50">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[#121212]/60">
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
                    <td className="max-w-xs truncate px-4 py-2.5 text-xs text-[#121212]/60">
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
