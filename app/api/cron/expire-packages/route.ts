import { NextResponse } from "next/server";
import { expirePackages } from "@/lib/services/payments";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await expirePackages();
    return NextResponse.json({ ok: true, expired: count });
  } catch (err) {
    console.error("Cron expire-packages failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
