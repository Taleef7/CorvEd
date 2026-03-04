import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { leadSchema, LeadFormData } from '@/lib/validators/lead'
import { checkRateLimit } from '@/lib/rate-limit'

// The raw request body may include the honeypot field alongside form data
type RequestBody = LeadFormData & { _hp?: string }

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIp =
    req.headers.get('x-real-ip') ??
    (forwardedFor ? forwardedFor.split(',')[0]?.trim() || null : null)

  if (clientIp) {
    const { success: withinLimit } = checkRateLimit(`leads:${clientIp}`, 10, 60_000)
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

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
