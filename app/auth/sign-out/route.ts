// E3 S3.1: sign-out route handler
// Handles POST and GET /auth/sign-out — clears session and redirects to sign-in
// Closes #18

import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

async function handleSignOut(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = request.nextUrl.clone();
  url.pathname = "/auth/sign-in";
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}
