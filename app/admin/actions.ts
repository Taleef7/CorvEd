// E3 T3.4: admin server actions for user role management
// Closes #19 #23

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizeAuditDetails } from "@/lib/audit/sanitize";

const VALID_ROLES = ["student", "parent", "tutor", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

function assertValidRole(role: string): asserts role is Role {
  if (!VALID_ROLES.includes(role as Role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

/** Assign a role to a user. Creates the row if not present. */
export async function assignRole(userId: string, role: string) {
  await requireAdmin();
  assertValidRole(role);

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role });
  if (error) throw new Error(`Failed to assign role: ${error.message}`);
  revalidatePath("/admin/users");
}

/** Remove a role from a user.
 *  Guard: cannot remove the last admin role from the system.
 */
export async function removeRole(userId: string, role: string) {
  await requireAdmin();
  assertValidRole(role);

  // Guard: cannot remove last admin
  if (role === "admin") {
    const admin = createAdminClient();
    const { count } = await admin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      throw new Error("Cannot remove the last admin role from the system.");
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw new Error(`Failed to remove role: ${error.message}`);
  revalidatePath("/admin/users");
}

/** Set the primary_role on a user's profile (controls dashboard routing).
 *  The chosen primary role must be among the user's assigned roles.
 */
export async function setPrimaryRole(userId: string, primaryRole: string) {
  await requireAdmin();
  assertValidRole(primaryRole);

  // Validate that the user actually has this role assigned
  const admin = createAdminClient();
  const { data: existingRoles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", primaryRole);

  if (!existingRoles || existingRoles.length === 0) {
    throw new Error(
      `Cannot set primary role to '${primaryRole}': user does not have that role assigned.`,
    );
  }

  const { error } = await admin
    .from("user_profiles")
    .update({ primary_role: primaryRole })
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to set primary role: ${error.message}`);
  revalidatePath("/admin/users");
}

// ── User profile edit ────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Name is required").max(120),
  whatsapp_number: z.string().max(30).nullable().optional(),
});

/** Update a user's display name and WhatsApp number. */
export async function updateUserProfile(userId: string, formData: FormData) {
  const adminUserId = await requireAdmin();

  const raw = {
    display_name: formData.get("display_name") as string,
    whatsapp_number: (formData.get("whatsapp_number") as string) || null,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({
      display_name: parsed.data.display_name,
      whatsapp_number: parsed.data.whatsapp_number ?? null,
    })
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to update profile: ${error.message}`);

  await admin.from("audit_logs").insert([
    {
      actor_user_id: adminUserId,
      action: "admin_update_user_profile",
      entity_type: "user_profiles",
      entity_id: userId,
      details: sanitizeAuditDetails({ display_name: parsed.data.display_name }),
    },
  ]);

  revalidatePath("/admin/users");
}

// ── Delete user ──────────────────────────────────────────────────────────────

/** Permanently delete a user from auth + cascade to all profile data. */
export async function deleteUser(userId: string) {
  await requireAdmin();

  const admin = createAdminClient();

  // Guard: cannot delete the last admin
  const { count: adminCount } = await admin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  const { data: targetRoles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const isAdmin = targetRoles?.some((r) => r.role === "admin");
  if (isAdmin && (adminCount ?? 0) <= 1) {
    throw new Error("Cannot delete the last admin account.");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Failed to delete user: ${error.message}`);

  revalidatePath("/admin/users");
}
