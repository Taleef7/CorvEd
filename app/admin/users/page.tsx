// E3 T3.4 E11 T11.3: admin user role management screen + WhatsApp links
// Closes #19 #23 #76

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { assignRole, removeRole, setPrimaryRole } from '../actions'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'

const ALL_ROLES = ['student', 'parent', 'tutor', 'admin'] as const
type Role = (typeof ALL_ROLES)[number]

type UserProfile = {
  user_id: string
  display_name: string
  whatsapp_number: string | null
  timezone: string
  primary_role: Role
  created_at: string
}

type UserRoleRow = {
  user_id: string
  role: Role
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  const [
    { data: profiles, count: totalCount, error: profilesError },
    { data: roleRows, error: rolesError },
  ] = await Promise.all([
    admin
      .from('user_profiles')
      .select('user_id, display_name, whatsapp_number, timezone, primary_role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to),
    admin.from('user_roles').select('user_id, role'),
  ])

  if (profilesError || rolesError) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter text-[#121212]">
          User Management
        </h1>
        <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-6 py-4 text-sm text-[#D02020]">
          <p className="font-semibold">Failed to load user data.</p>
          {profilesError && <p className="mt-1">Profiles: {profilesError.message}</p>}
          {rolesError && <p className="mt-1">Roles: {rolesError.message}</p>}
          <p className="mt-2 text-xs text-red-600">
            Check that SUPABASE_SERVICE_ROLE_KEY is set correctly.
          </p>
        </div>
      </div>
    )
  }

  // Group roles by user_id for quick lookup
  const rolesByUser = new Map<string, Role[]>()
  for (const row of (roleRows as UserRoleRow[]) ?? []) {
    const existing = rolesByUser.get(row.user_id) ?? []
    existing.push(row.role)
    rolesByUser.set(row.user_id, existing)
  }

  const users = (profiles as UserProfile[]) ?? []

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black uppercase tracking-tighter text-[#121212]">
        User Management
      </h1>

      <p className="mb-4 text-sm text-[#121212]/60">
        {totalCount ?? users.length} user{(totalCount ?? users.length) !== 1 ? 's' : ''} total
      </p>

      <div className="overflow-x-auto border-4 border-[#121212] bg-white">
        <table className="min-w-full divide-y divide-[#D0D0D0] text-sm">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Primary role
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                All roles
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                WhatsApp
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Joined
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {users.map((user) => {
              const userRoles = rolesByUser.get(user.user_id) ?? []
              const missingRoles = ALL_ROLES.filter((r) => !userRoles.includes(r))

              return (
                <tr key={user.user_id} className="hover:bg-[#F0F0F0]/50">
                  <td className="px-4 py-3 font-medium text-[#121212]">
                    {user.display_name}
                  </td>

                  <td className="px-4 py-3">
                    <RoleBadge role={user.primary_role} />
                    <SetPrimaryButton userId={user.user_id} roles={userRoles} currentPrimary={user.primary_role} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {userRoles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1 rounded-full bg-[#E0E0E0] px-2 py-0.5 text-xs font-medium text-[#121212]/80 "
                        >
                          {r}
                          <RemoveRoleButton userId={user.user_id} role={r} />
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[#121212]/60 ">
                    <div className="flex flex-wrap items-center gap-2">
                      {user.whatsapp_number ? (
                        <>
                          <span>{user.whatsapp_number}</span>
                          <WhatsAppLink number={user.whatsapp_number} label="Open chat" />
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[#121212]/60 ">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {missingRoles.length > 0 && (
                      <AddRoleForm userId={user.user_id} missingRoles={missingRoles} />
                    )}
                  </td>
                </tr>
              )
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#121212]/60">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalCount={totalCount ?? 0}
        baseHref="/admin/users"
      />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    student:
      'border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]',
    parent:
      'border-2 border-[#1040C0] bg-[#1040C0] text-white',
    tutor:
      'border-2 border-[#121212] bg-[#121212] text-white',
    admin:
      'border-2 border-[#D02020] bg-[#D02020] text-white',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${colors[role]}`}
    >
      {role}
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
        className="ml-0.5 text-[#121212]/40 hover:text-red-500"
        aria-label={`Remove ${role} role`}
      >
        ×
      </button>
    </form>
  )
}

function AddRoleForm({
  userId,
  missingRoles,
}: {
  userId: string
  missingRoles: Role[]
}) {
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
        className="border-2 border-[#121212] px-2 py-1 text-xs "
      >
        {missingRoles.map((r) => (
          <option key={r} value={r}>
            + {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-[#1040C0] px-2 py-1 text-xs font-medium text-white hover:bg-[#0830A0]"
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
        className="border-2 border-[#121212] px-2 py-1 text-xs "
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-[#D0D0D0] px-2 py-1 text-xs font-medium text-[#121212]/80 hover:bg-[#C0C0C0]"
      >
        Set primary
      </button>
    </form>
  )
}
