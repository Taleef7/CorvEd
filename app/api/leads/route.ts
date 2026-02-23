import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { leadSchema, LeadFormData } from '@/lib/validators/lead'

// The raw request body may include the honeypot field alongside form data
type RequestBody = LeadFormData & { _hp?: string }

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot spam check: bots commonly fill all fields including hidden ones.
  // The `_hp` field is rendered hidden in the UI; humans leave it empty.
  const rawBody = body as RequestBody
  if (rawBody?._hp) {
    // Silently accept to avoid leaking honeypot logic to bots
    return NextResponse.json({ id: 'ok' }, { status: 201 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .insert([parsed.data])
    .select('id')
    .single()

  if (error) {
    // Avoid logging full error details (schema/internals) in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('[leads POST] Supabase error:', error)
    } else {
      console.error('[leads POST] Failed to insert lead')
    }
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  // Phase 0 notification: admin monitors Supabase Dashboard directly.
  // Upgrade to email notification (Resend / Nodemailer) in a later sprint.

  return NextResponse.json({ id: data.id }, { status: 201 })
}
