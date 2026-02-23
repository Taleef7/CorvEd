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

/** Assign a role to a user. Creates the row if not present. */
export async function assignRole(userId: string, role: string) {
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

/** Set the primary_role on a user's profile (controls dashboard routing). */
export async function setPrimaryRole(userId: string, primaryRole: string) {
  assertValidRole(primaryRole)

  const admin = createAdminClient()
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
