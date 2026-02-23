// E3 T3.4: admin server actions for user role management
// Closes #19 #23

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_ROLES = ['student', 'parent', 'tutor', 'admin'] as const
type Role = (typeof VALID_ROLES)[number]

function assertValidRole(role: string): asserts role is Role {
  if (!VALID_ROLES.includes(role as Role)) {
    throw new Error(`Invalid role: ${role}`)
  }
}

/** Verify the calling user is authenticated and has the admin role.
 *  Throws if the caller is not an admin — prevents direct action invocations
 *  from bypassing the layout-level redirect guard.
 */
async function requireAdmin(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized: not authenticated')

  const admin = createAdminClient()
  const { data: roles } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const isAdmin = roles?.some((r) => r.role === 'admin') ?? false
  if (!isAdmin) throw new Error('Unauthorized: admin role required')

  return user.id
}

/** Assign a role to a user. Creates the row if not present. */
export async function assignRole(userId: string, role: string) {
  await requireAdmin()
  assertValidRole(role)

  const admin = createAdminClient()
  const { error } = await admin
    .from('user_roles')
    .upsert({ user_id: userId, role })
  if (error) throw new Error(`Failed to assign role: ${error.message}`)
  revalidatePath('/admin/users')
}

/** Remove a role from a user.
 *  Guard: cannot remove the last admin role from the system.
 */
export async function removeRole(userId: string, role: string) {
  await requireAdmin()
  assertValidRole(role)

  // Guard: cannot remove last admin
  if (role === 'admin') {
    const admin = createAdminClient()
    const { count } = await admin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      throw new Error('Cannot remove the last admin role from the system.')
    }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)
  if (error) throw new Error(`Failed to remove role: ${error.message}`)
  revalidatePath('/admin/users')
}

/** Set the primary_role on a user's profile (controls dashboard routing).
 *  The chosen primary role must be among the user's assigned roles.
 */
export async function setPrimaryRole(userId: string, primaryRole: string) {
  await requireAdmin()
  assertValidRole(primaryRole)

  // Validate that the user actually has this role assigned
  const admin = createAdminClient()
  const { data: existingRoles } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', primaryRole)

  if (!existingRoles || existingRoles.length === 0) {
    throw new Error(
      `Cannot set primary role to '${primaryRole}': user does not have that role assigned.`
    )
  }

  const { error } = await admin
    .from('user_profiles')
    .update({ primary_role: primaryRole })
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to set primary role: ${error.message}`)
  revalidatePath('/admin/users')
}

/** Sign out the current user (used in nav sign-out forms). */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
