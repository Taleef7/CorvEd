"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Shared admin guard — verifies the caller is authenticated AND has the admin role.
 * Returns the admin's user ID on success, throws on failure.
 * Use in every admin server action.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized: not authenticated");

  const admin = createAdminClient();
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
  if (!isAdmin) throw new Error("Unauthorized: admin role required");

  return user.id;
}
