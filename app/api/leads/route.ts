import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { leadSchema } from '@/lib/validators/lead'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
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
    console.error('[leads POST] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  // Phase 0 notification: admin monitors Supabase Dashboard directly.
  // Upgrade to email notification (Resend / Nodemailer) in a later sprint.

  return NextResponse.json({ id: data.id }, { status: 201 })
}
