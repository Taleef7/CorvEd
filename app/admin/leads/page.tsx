export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { leadStatusValues } from '@/lib/validators/lead-admin'
import { updateLeadStatus } from './actions'

type LeadStatus = (typeof leadStatusValues)[number]

type LeadRow = {
  id: string
  full_name: string
  whatsapp_number: string
  role: string
  child_name: string | null
  level: string
  subject: string
  exam_board: string
  availability: string
  city_timezone: string
  goals: string | null
  preferred_package: string | null
  status: LeadStatus
  admin_notes: string | null
  created_at: string
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  disqualified: 'Disqualified',
}

const SUBJECT_LABELS: Record<string, string> = {
  math: 'Math',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
  cs: 'Computer Science',
  pak_studies: 'Pakistan Studies',
  islamiyat: 'Islamiyat',
  urdu: 'Urdu',
}

function formatLeadDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildStatusHref(status: LeadStatus | 'all') {
  return status === 'all' ? '/admin/leads' : `/admin/leads?status=${status}`
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeStatus = leadStatusValues.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : 'all'

  const admin = createAdminClient()
  let query = admin
    .from('leads')
    .select(
      'id, full_name, whatsapp_number, role, child_name, level, subject, exam_board, availability, city_timezone, goals, preferred_package, status, admin_notes, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to load leads: ${error.message}`)

  const leads = (data ?? []) as LeadRow[]
  const statusLinks: (LeadStatus | 'all')[] = ['all', ...leadStatusValues]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Leads</h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            Phase 0 intake records for manual WhatsApp follow-up.
          </p>
        </div>
        <p className="text-sm text-[#121212]/60">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {statusLinks.map((status) => {
          const isActive = activeStatus === status
          return (
            <Link
              key={status}
              href={buildStatusHref(status)}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-[#1040C0] text-white'
                  : 'bg-white text-[#121212]/70 hover:bg-[#E0E0E0]'
              }`}
            >
              {status === 'all' ? 'All' : STATUS_LABELS[status]}
            </Link>
          )
        })}
      </div>

      {leads.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No leads found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <article key={lead.id} className="border-4 border-[#121212] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black uppercase tracking-tight text-[#121212]">
                      {lead.full_name}
                    </h2>
                    <span className="border-2 border-[#121212] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#121212]">
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#121212]/50">
                    {formatLeadDate(lead.created_at)} · {lead.role}
                    {lead.child_name ? ` for ${lead.child_name}` : ''} · {lead.city_timezone}
                  </p>
                </div>
                <WhatsAppLink number={lead.whatsapp_number} label="Open WhatsApp" />
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Subject</dt>
                  <dd className="mt-1 text-[#121212]">{SUBJECT_LABELS[lead.subject] ?? lead.subject}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Level</dt>
                  <dd className="mt-1 text-[#121212]">{lead.level === 'o_levels' ? 'O Levels' : 'A Levels'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Exam Board</dt>
                  <dd className="mt-1 text-[#121212]">{lead.exam_board.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Package</dt>
                  <dd className="mt-1 text-[#121212]">{lead.preferred_package ? `${lead.preferred_package} sessions` : 'Not sure'}</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Availability</p>
                  <p className="mt-1 whitespace-pre-wrap text-[#121212]/70">{lead.availability}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">Goals</p>
                  <p className="mt-1 whitespace-pre-wrap text-[#121212]/70">{lead.goals || 'No goals provided.'}</p>
                </div>
              </div>

              <form action={updateLeadStatus} className="mt-4 grid gap-3 border-t-2 border-[#E0E0E0] pt-4 md:grid-cols-[180px_1fr_auto]">
                <input type="hidden" name="leadId" value={lead.id} />
                <select
                  name="status"
                  defaultValue={lead.status}
                  className="border-2 border-[#121212] px-3 py-2 text-sm"
                  aria-label={`Status for ${lead.full_name}`}
                >
                  {leadStatusValues.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <textarea
                  name="admin_notes"
                  defaultValue={lead.admin_notes ?? ''}
                  rows={2}
                  maxLength={1000}
                  placeholder="Private admin notes"
                  className="border-2 border-[#B0B0B0] px-3 py-2 text-sm outline-none focus:border-[#1040C0] focus:ring-1 focus:ring-[#1040C0]"
                />
                <button
                  type="submit"
                  className="border-2 border-[#121212] bg-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#333]"
                >
                  Save
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
