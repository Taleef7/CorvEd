// E3 T3.4: admin user role management screen
// Closes #19 #23

import { createAdminClient } from '@/lib/supabase/admin'
import { assignRole, removeRole, setPrimaryRole } from '../actions'

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

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const [{ data: profiles }, { data: roleRows }] = await Promise.all([
    admin
      .from('user_profiles')
      .select('user_id, display_name, whatsapp_number, timezone, primary_role, created_at')
      .order('created_at', { ascending: false }),
    admin.from('user_roles').select('user_id, role'),
  ])

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
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        User Management
      </h1>

      <p className="mb-4 text-sm text-zinc-500">
        {users.length} user{users.length !== 1 ? 's' : ''} total
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                Primary role
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                All roles
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                WhatsApp
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                Joined
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((user) => {
              const userRoles = rolesByUser.get(user.user_id) ?? []
              const missingRoles = ALL_ROLES.filter((r) => !userRoles.includes(r))

              return (
                <tr key={user.user_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
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
                          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        >
                          {r}
                          <RemoveRoleButton userId={user.user_id} role={r} />
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {user.whatsapp_number ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
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
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    student:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    parent:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    tutor:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    admin:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[role]}`}
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
        className="ml-0.5 text-zinc-400 hover:text-red-500"
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
        className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {missingRoles.map((r) => (
          <option key={r} value={r}>
            + {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
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
        defaultValue={currentPrimary}
        className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        Set primary
      </button>
    </form>
  )
}
