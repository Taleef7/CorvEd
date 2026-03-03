"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Find active packages past their end_date and expire them.
 * Also ends associated requests and matches.
 */
export async function expirePackages() {
  const admin = createAdminClient();
  const now = new Date().toISOString().slice(0, 10);

  const { data: expired } = await admin
    .from("packages")
    .select("id, request_id")
    .eq("status", "active")
    .lt("end_date", now);

  if (!expired || expired.length === 0) return 0;

  for (const pkg of expired) {
    await admin.from("packages").update({ status: "expired" }).eq("id", pkg.id);
    await admin
      .from("requests")
      .update({ status: "ended" })
      .eq("id", pkg.request_id);
    await admin
      .from("matches")
      .update({ status: "ended" })
      .eq("request_id", pkg.request_id);
    await admin.from("audit_logs").insert([
      {
        actor_user_id: null,
        action: "package_expired",
        entity_type: "package",
        entity_id: pkg.id,
        details: { request_id: pkg.request_id },
      },
    ]);
  }

  revalidatePath("/admin/payments");
  return expired.length;
}

/**
 * Find packages ending within N days (for renewal reminders).
 */
export async function getExpiringPackages(withinDays = 5) {
  const admin = createAdminClient();
  const now = new Date();
  const future = new Date(now.getTime() + withinDays * 86400000)
    .toISOString()
    .slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const { data } = await admin
    .from("packages")
    .select("id, request_id, tier_sessions, sessions_used, end_date")
    .eq("status", "active")
    .gte("end_date", today)
    .lte("end_date", future);

  return data ?? [];
}
