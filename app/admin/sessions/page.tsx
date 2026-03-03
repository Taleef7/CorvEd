// E8 T8.4 S8.2 E11 T11.2: Admin sessions overview — list all sessions, update status, reschedule, WhatsApp actions
// Closes #57 #53 #75

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS, formatSessionTime, type SessionStatus } from '@/lib/utils/session'
import { SessionStatusForm, RescheduleForm } from './SessionActions'
import Link from 'next/link'
import { CopyMessageButton } from '@/components/CopyMessageButton'
import { templates } from '@/lib/whatsapp/templates'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'

const ADMIN_TIMEZONE = 'Asia/Karachi'

type SessionRow = {
  id: string
  scheduled_start_utc: string
  scheduled_end_utc: string
  status: SessionStatus
  tutor_notes: string | null
  match_id: string
  matches: {
    meet_link: string | null
    request_id: string
    tutor_user_id: string
    schedule_pattern: { duration_mins?: number; timezone?: string } | null
    tutor_profiles: {
      user_profiles: { display_name: string; whatsapp_number: string | null } | null
    } | null
    requests: {
      id: string
      level: string
      subjects: { name: string } | null
      user_profiles: { display_name: string; whatsapp_number: string | null } | null
    } | null
  } | null
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  const { data: sessionsData, count: totalCount } = await admin
    .from('sessions')
    .select(
      `id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes, match_id,
       matches!sessions_match_id_fkey (
         meet_link, request_id, tutor_user_id, schedule_pattern,
         tutor_profiles!matches_tutor_user_id_fkey (
           user_profiles!tutor_user_id ( display_name, whatsapp_number )
         ),
         requests!matches_request_id_fkey (
           id, level,
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number )
         )
       )`,
      { count: 'exact' }
    )
    .order('scheduled_start_utc', { ascending: true })
    .range(from, to)

  const sessions = (sessionsData ?? []) as unknown as SessionRow[]

  const nowIso = new Date().toISOString()
  const upcoming = sessions.filter((s) => s.scheduled_start_utc >= nowIso)
  const past = sessions.filter((s) => s.scheduled_start_utc < nowIso)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Sessions</h1>
        <p className="text-sm text-[#121212]/60">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No sessions yet.</p>
          <p className="mt-1 text-sm text-[#121212]/40">
            Generate sessions from a{' '}
            <Link href="/admin/matches" className="font-bold text-[#1040C0] underline-offset-4 hover:underline">
              match detail page
            </Link>{' '}
            once the schedule and Meet link are set.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming sessions */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    adminTimezone={ADMIN_TIMEZONE}
                    showActions
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past sessions */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">
                Past ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    adminTimezone={ADMIN_TIMEZONE}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalCount={totalCount ?? 0}
        baseHref="/admin/sessions"
      />
    </div>
  )
}

function SessionCard({
  session,
  adminTimezone,
  showActions,
}: {
  session: SessionRow
  adminTimezone: string
  showActions: boolean
}) {
  const match = session.matches
  const req = match?.requests
  const tutorProfile = match?.tutor_profiles
  const studentName =
    (req?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const studentWhatsApp =
    (req?.user_profiles as { display_name: string; whatsapp_number: string | null } | null)
      ?.whatsapp_number ?? null
  const tutorName =
    (tutorProfile?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const tutorWhatsApp =
    (tutorProfile?.user_profiles as { display_name: string; whatsapp_number: string | null } | null)
      ?.whatsapp_number ?? null
  const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
  const levelLabel = req?.level ?? ''
  const timeDisplay = formatSessionTime(session.scheduled_start_utc, adminTimezone)
  const scheduleTz = match?.schedule_pattern?.timezone ?? adminTimezone
  // Format session time in the schedule/student timezone for WhatsApp messages
  const waTimeDisplay = formatSessionTime(session.scheduled_start_utc, scheduleTz)
  const requestId = match?.request_id ?? ''
  const durationMins = match?.schedule_pattern?.duration_mins ?? 60
  const meetLink = match?.meet_link ?? ''

  // Template strings for WhatsApp buttons (use waTimeDisplay so tz label matches the time)
  const rem1hMsg = meetLink
    ? templates.rem1h({
        level: levelLabel,
        subject: subjectName,
        tutorName,
        time: waTimeDisplay,
        tz: scheduleTz,
        meetLink,
      })
    : null

  const lateJoinMsg = meetLink
    ? templates.lateJoin({ name: studentName, time: waTimeDisplay, meetLink })
    : null

  const studentNoShowMsg = templates.studentNoShow({ name: studentName, time: waTimeDisplay })
  const tutorNoShowMsg = templates.tutorNoShow({ name: studentName })

  return (
    <div className="border-4 border-[#121212] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-[#121212]">{timeDisplay}</p>
          <p className="text-sm text-[#121212]/60">
            {subjectName} · {studentName} ↔ {tutorName}
          </p>
          {session.tutor_notes && (
            <p className="text-xs text-[#121212]/40 italic">Note: {session.tutor_notes}</p>
          )}
          {match?.meet_link && (
            <a
              href={match.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Google Meet session"
              className="text-xs font-bold uppercase tracking-widest text-[#1040C0] underline-offset-4 hover:underline"
            >
              Join Meet →
            </a>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 ${SESSION_STATUS_COLOURS[session.status] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
        >
          {SESSION_STATUS_LABELS[session.status] ?? session.status}
        </span>
      </div>

      {showActions && (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <SessionStatusForm
            sessionId={session.id}
            matchId={session.match_id}
            requestId={requestId}
            currentStatus={session.status}
          />
          <RescheduleForm
            sessionId={session.id}
            scheduledStartUtc={session.scheduled_start_utc}
            adminTimezone={adminTimezone}
            durationMins={durationMins}
          />
        </div>
      )}

      {/* WhatsApp message buttons */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E0E0E0] pt-3">
        {rem1hMsg && (
          <CopyMessageButton
            message={rem1hMsg}
            whatsappNumber={studentWhatsApp ?? undefined}
            label="Copy 1-hour reminder"
          />
        )}
        {lateJoinMsg && (
          <CopyMessageButton
            message={lateJoinMsg}
            whatsappNumber={studentWhatsApp ?? undefined}
            label="Copy late join follow-up"
          />
        )}
        <CopyMessageButton
          message={studentNoShowMsg}
          whatsappNumber={studentWhatsApp ?? undefined}
          label="Copy student no-show notice"
        />
        <CopyMessageButton
          message={tutorNoShowMsg}
          whatsappNumber={studentWhatsApp ?? undefined}
          label="Copy tutor no-show apology"
        />
        {tutorWhatsApp && rem1hMsg && (
          <CopyMessageButton
            message={rem1hMsg}
            whatsappNumber={tutorWhatsApp}
            label="Copy 1-hour reminder (tutor)"
          />
        )}
      </div>
    </div>
  )
}

