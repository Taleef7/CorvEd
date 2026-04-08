// Admin User Management — role tabs, multi-column filters, inline edit & delete
// Closes #19 #23 #76

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { assignRole, removeRole, setPrimaryRole, updateUserProfile, deleteUser } from '../actions'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'
import { UserFilters } from './UserFilters'
import { DeleteUserButton } from './DeleteUserButton'
import { getAdminUserPaymentBadge, getHighestPriorityPaymentStatus } from '@/lib/admin/users'

const ALL_ROLES = ['student', 'parent', 'tutor', 'admin'] as const
type Role = (typeof ALL_ROLES)[number]

type UserProfile = {
  user_id: string
  display_name: string
  whatsapp_number: string | null
  primary_role: Role
  created_at: string
}

type UserRoleRow = {
  user_id: string
  role: Role
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    role?: string
    search?: string
    level?: string
    subject?: string
    payment?: string
  }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const activeRole = params.role ?? ''
  const activeSearch = params.search ?? ''
  const activeLevel = params.level ?? ''
  const activeSubject = params.subject ?? ''
  const activePayment = params.payment ?? ''

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  // 1. Subjects for the filter dropdown
  const { data: subjects } = await admin
    .from('subjects')
    .select('id, name')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  // 2. Cross-table pre-query: level / subject → restrict user_ids
  let restrictToUserIds: string[] | null = null // null = no restriction

  if (activeLevel || activeSubject) {
    let reqQuery = admin.from('requests').select('created_by_user_id')
    if (activeLevel) reqQuery = reqQuery.eq('level', activeLevel as 'o_levels' | 'a_levels')
    if (activeSubject) reqQuery = reqQuery.eq('subject_id', parseInt(activeSubject, 10))
    const { data: matchingReqs } = await reqQuery
    restrictToUserIds = [
      ...new Set((matchingReqs ?? []).map((r) => r.created_by_user_id as string)),
    ]
  }

  // 3. Payment pre-query → payer user_ids
  let payerIds: string[] | null = null
  if (activePayment === 'yes' || activePayment === 'no') {
    const { data: payments } = await admin.from('payments').select('payer_user_id')
    payerIds = [...new Set((payments ?? []).map((p) => p.payer_user_id as string))]
  }

  // 4. Build main user_profiles query with all filters
  const IMPOSSIBLE_ID = '00000000-0000-0000-0000-000000000000'

  let query = admin
    .from('user_profiles')
    .select('user_id, display_name, whatsapp_number, primary_role, created_at', {
      count: 'exact',
    })

  if (activeRole) query = query.eq('primary_role', activeRole as Role)
  if (activeSearch) query = query.ilike('display_name', `%${activeSearch}%`)

  if (restrictToUserIds !== null) {
    const ids = restrictToUserIds.length > 0 ? restrictToUserIds : [IMPOSSIBLE_ID]
    query = query.in('user_id', ids)
  }

  if (payerIds !== null) {
    if (activePayment === 'yes') {
      const ids = payerIds.length > 0 ? payerIds : [IMPOSSIBLE_ID]
      query = query.in('user_id', ids)
    } else if (activePayment === 'no' && payerIds.length > 0) {
      query = query.not('user_id', 'in', `(${payerIds.join(',')})`)
    }
  }

  const {
    data: profiles,
    count: totalCount,
    error: profilesError,
  } = await query.order('created_at', { ascending: false }).range(from, to)

  if (profilesError) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter text-[#121212]">
          User Management
        </h1>
        <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-6 py-4 text-sm text-[#D02020]">
          <p className="font-semibold">Failed to load users.</p>
          <p className="mt-1">{profilesError.message}</p>
        </div>
      </div>
    )
  }

  const users = (profiles ?? []) as UserProfile[]
  const userIds = users.map((u) => u.user_id)
  const safeIds = userIds.length > 0 ? userIds : [IMPOSSIBLE_ID]

  // 5. Batch post-joins for the paginated users
  const [{ data: roleRows }, { data: latestReqs }, { data: userPayments }] = await Promise.all([
    admin.from('user_roles').select('user_id, role').in('user_id', safeIds),
    admin
      .from('requests')
      .select('created_by_user_id, level, status, subjects!subject_id(name)')
      .in('created_by_user_id', safeIds)
      .order('created_at', { ascending: false }),
    admin.from('payments').select('payer_user_id, status').in('payer_user_id', safeIds),
  ])

  // Build lookup maps
  const rolesByUser = new Map<string, Role[]>()
  for (const row of (roleRows ?? []) as UserRoleRow[]) {
    const arr = rolesByUser.get(row.user_id) ?? []
    arr.push(row.role)
    rolesByUser.set(row.user_id, arr)
  }

  // Latest request per user (first = most recent, already ordered DESC)
  type RequestInfo = { level: string; status: string; subjectName: string }
  const requestByUser = new Map<string, RequestInfo>()
  for (const req of latestReqs ?? []) {
    const uid = req.created_by_user_id as string
    if (!requestByUser.has(uid)) {
      requestByUser.set(uid, {
        level: req.level as string,
        status: req.status as string,
        subjectName: (req.subjects as { name: string } | null)?.name ?? '—',
      })
    }
  }

  const paymentByUser = new Map<string, string>()
  for (const pay of userPayments ?? []) {
    const uid = pay.payer_user_id as string
    const nextStatus = getHighestPriorityPaymentStatus([paymentByUser.get(uid), pay.status as string])
    if (nextStatus) paymentByUser.set(uid, nextStatus)
  }

  const filtersActive = !!(activeSearch || activeLevel || activeSubject || activePayment)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
            User Management
          </h1>
          <p className="mt-1 text-sm text-[#121212]/50">
            {totalCount ?? 0} user{(totalCount ?? 0) !== 1 ? 's' : ''}
            {filtersActive ? ' matching filters' : ' total'}
          </p>
        </div>
      </div>

      {/* Tabs + Filter bar (client component) */}
      <UserFilters
        subjects={(subjects ?? []).map((s) => ({ id: s.id as number, name: s.name as string }))}
        activeRole={activeRole}
        activeSearch={activeSearch}
        activeLevel={activeLevel}
        activeSubject={activeSubject}
        activePayment={activePayment}
      />

      {/* Table */}
      <div className="overflow-x-auto border-4 border-[#121212] bg-white">
        <table className="min-w-full divide-y divide-[#D0D0D0] text-sm">
          <thead className="bg-[#121212]">
            <tr>
              {[
                'Name',
                'Primary Role',
                'All Roles',
                'WhatsApp',
                'Latest Request',
                'Payment',
                'Joined',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {users.map((user) => {
              const userRoles = rolesByUser.get(user.user_id) ?? []
              const missingRoles = ALL_ROLES.filter((r) => !userRoles.includes(r))
              const reqInfo = requestByUser.get(user.user_id)
              const payStatus = paymentByUser.get(user.user_id)

              return (
                <tr key={user.user_id} className="align-top hover:bg-[#F8F8F8]">
                  {/* Name + inline edit */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#121212]">{user.display_name}</p>
                    <details className="mt-1">
                      <summary className="cursor-pointer select-none text-[11px] text-[#1040C0] hover:underline">
                        Edit profile ▸
                      </summary>
                      <EditProfileForm user={user} />
                    </details>
                  </td>

                  {/* Primary role */}
                  <td className="px-4 py-3">
                    <RoleBadge role={user.primary_role} />
                    <SetPrimaryButton
                      userId={user.user_id}
                      roles={userRoles}
                      currentPrimary={user.primary_role}
                    />
                  </td>

                  {/* All roles */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {userRoles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1 rounded-full bg-[#E0E0E0] px-2 py-0.5 text-[11px] font-medium text-[#121212]/80"
                        >
                          {r}
                          <RemoveRoleButton userId={user.user_id} role={r} />
                        </span>
                      ))}
                    </div>
                    {missingRoles.length > 0 && (
                      <div className="mt-2">
                        <AddRoleForm userId={user.user_id} missingRoles={missingRoles} />
                      </div>
                    )}
                  </td>

                  {/* WhatsApp */}
                  <td className="px-4 py-3 text-[#121212]/60">
                    {user.whatsapp_number ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs">{user.whatsapp_number}</span>
                        <WhatsAppLink number={user.whatsapp_number} label="Open chat" />
                      </div>
                    ) : (
                      <span className="text-xs text-[#121212]/30">—</span>
                    )}
                  </td>

                  {/* Latest request */}
                  <td className="px-4 py-3">
                    {reqInfo ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-[#121212]">
                          {reqInfo.subjectName}
                        </p>
                        <p className="text-[11px] text-[#121212]/50">
                          {LEVEL_LABELS[reqInfo.level] ?? reqInfo.level}
                        </p>
                        <RequestStatusBadge status={reqInfo.status} />
                      </div>
                    ) : (
                      <span className="text-xs text-[#121212]/30">No requests</span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    {payStatus ? (
                      <PaymentBadge status={payStatus} />
                    ) : (
                      <span className="text-xs text-[#121212]/30">None</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-[#121212]/50">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3">
                    <DeleteUserButton
                      userId={user.user_id}
                      displayName={user.display_name}
                      deleteAction={deleteUser}
                    />
                  </td>
                </tr>
              )
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#121212]/40">
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalCount={totalCount ?? 0}
        baseHref={buildBaseHref({ activeRole, activeSearch, activeLevel, activeSubject, activePayment })}
      />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildBaseHref(filters: {
  activeRole: string
  activeSearch: string
  activeLevel: string
  activeSubject: string
  activePayment: string
}): string {
  const params: Record<string, string> = {}
  if (filters.activeRole) params.role = filters.activeRole
  if (filters.activeSearch) params.search = filters.activeSearch
  if (filters.activeLevel) params.level = filters.activeLevel
  if (filters.activeSubject) params.subject = filters.activeSubject
  if (filters.activePayment) params.payment = filters.activePayment
  const qs = new URLSearchParams(params).toString()
  return `/admin/users${qs ? `?${qs}` : ''}`
}

const LEVEL_LABELS: Record<string, string> = {
  o_levels: 'O Levels',
  a_levels: 'A Levels',
}

// ── Server-rendered sub-components ───────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    student: 'border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]',
    parent: 'border-2 border-[#1040C0] bg-[#1040C0] text-white',
    tutor: 'border-2 border-[#121212] bg-[#121212] text-white',
    admin: 'border-2 border-[#D02020] bg-[#D02020] text-white',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[role]}`}
    >
      {role}
    </span>
  )
}

function RequestStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-[#E0E0E0] text-[#121212]/60',
    payment_pending: 'bg-yellow-100 text-yellow-800',
    ready_to_match: 'bg-blue-100 text-blue-800',
    matched: 'bg-purple-100 text-purple-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
    ended: 'bg-[#E0E0E0] text-[#121212]/40',
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[status] ?? 'bg-[#E0E0E0] text-[#121212]/60'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const cfg = getAdminUserPaymentBadge(status)
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  )
}

function RemoveRoleButton({ userId, role }: { userId: string; role: Role }) {
  async function action() {
    'use server'
    await removeRole(userId, role)
  }
  return (
    <form action={action} className="inline">
      <button
        type="submit"
        title={`Remove ${role} role`}
        className="ml-0.5 leading-none text-[#121212]/40 hover:text-red-500"
        aria-label={`Remove ${role} role`}
      >
        ×
      </button>
    </form>
  )
}

function AddRoleForm({ userId, missingRoles }: { userId: string; missingRoles: Role[] }) {
  async function action(formData: FormData) {
    'use server'
    const role = formData.get('role') as string
    await assignRole(userId, role)
  }
  return (
    <form action={action} className="flex items-center gap-1">
      <select
        name="role"
        aria-label="Role to add"
        className="border-2 border-[#121212] px-2 py-1 text-xs"
      >
        {missingRoles.map((r) => (
          <option key={r} value={r}>
            + {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-[#1040C0] px-2 py-1 text-xs font-medium text-white hover:bg-[#0830A0]"
      >
        Add
      </button>
    </form>
  )
}

function SetPrimaryButton({
  userId,
  roles,
  currentPrimary,
}: {
  userId: string
  roles: Role[]
  currentPrimary: Role
}) {
  async function action(formData: FormData) {
    'use server'
    const role = formData.get('primaryRole') as string
    await setPrimaryRole(userId, role)
  }
  return (
    <form action={action} className="mt-1 flex items-center gap-1">
      <select
        name="primaryRole"
        aria-label="Set primary role"
        defaultValue={currentPrimary}
        className="border-2 border-[#121212] px-2 py-1 text-xs"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-[#D0D0D0] px-2 py-1 text-xs font-medium text-[#121212]/80 hover:bg-[#C0C0C0]"
      >
        Set primary
      </button>
    </form>
  )
}

function EditProfileForm({ user }: { user: UserProfile }) {
  async function action(formData: FormData) {
    'use server'
    await updateUserProfile(user.user_id, formData)
  }
  return (
    <form action={action} className="mt-2 flex flex-col gap-2 border-t border-[#E0E0E0] pt-2">
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
          Display name
        </label>
        <input
          name="display_name"
          defaultValue={user.display_name}
          required
          className="border-2 border-[#121212] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
          WhatsApp number
        </label>
        <input
          name="whatsapp_number"
          defaultValue={user.whatsapp_number ?? ''}
          placeholder="+92300..."
          className="border-2 border-[#121212] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
        />
      </div>
      <button
        type="submit"
        className="self-start bg-[#1040C0] px-3 py-1 text-xs font-bold text-white hover:bg-[#0830A0]"
      >
        Save changes
      </button>
    </form>
  )
}
