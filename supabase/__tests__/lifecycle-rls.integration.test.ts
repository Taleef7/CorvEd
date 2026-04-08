import { beforeAll, describe, expect, test } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const hasLocalSupabaseEnv = Boolean(supabaseUrl && anonKey && serviceRoleKey)
const describeLocal = hasLocalSupabaseEnv ? describe : describe.skip

describeLocal('lifecycle RLS and checkout RPC', () => {
  const password = 'LocalRlsTest!12345'
  const unique = Date.now()
  const email = `rls-${unique}@example.com`

  let admin: ReturnType<typeof createClient<Database>>
  let student: ReturnType<typeof createClient<Database>>
  let studentUserId: string
  let subjectId: number

  beforeAll(async () => {
    admin = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    student = createClient<Database>(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError || !created.user) throw createError ?? new Error('Failed to create user')
    studentUserId = created.user.id

    await admin.from('user_profiles').upsert({
      user_id: studentUserId,
      display_name: 'RLS Student',
      whatsapp_number: '+923001234567',
      timezone: 'Asia/Karachi',
      primary_role: 'student',
    })
    await admin.from('user_roles').upsert({ user_id: studentUserId, role: 'student' })

    const { data: subject, error: subjectError } = await admin
      .from('subjects')
      .select('id')
      .eq('active', true)
      .limit(1)
      .single()
    if (subjectError || !subject) throw subjectError ?? new Error('No active subject found')
    subjectId = subject.id

    const { error: signInError } = await student.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
  })

  test('blocks advanced request states and creates checkout atomically', async () => {
    const baseRequest = {
      created_by_user_id: studentUserId,
      requester_role: 'student' as const,
      level: 'o_levels' as const,
      subject_id: subjectId,
      exam_board: 'unspecified' as const,
      timezone: 'Asia/Karachi',
      availability_windows: [],
    }

    const { error: advancedRequestError } = await student
      .from('requests')
      .insert({ ...baseRequest, status: 'active' })
    expect(advancedRequestError).toBeTruthy()

    const { data: request, error: requestError } = await student
      .from('requests')
      .insert(baseRequest)
      .select('id')
      .single()
    expect(requestError).toBeNull()
    expect(request).toBeTruthy()

    const { error: advancedPackageError } = await student.from('packages').insert({
      request_id: request!.id,
      tier_sessions: 8,
      start_date: '2026-04-08',
      end_date: '2026-05-08',
      sessions_total: 8,
      sessions_used: 0,
      status: 'active',
    })
    expect(advancedPackageError).toBeTruthy()

    const { data: packageId, error: checkoutError } = await student.rpc('checkout_package', {
      p_request_id: request!.id,
      p_tier_sessions: 8,
    })
    expect(checkoutError).toBeNull()
    expect(packageId).toEqual(expect.any(String))

    const [{ data: pkg }, { data: payment }, { data: updatedRequest }] = await Promise.all([
      admin.from('packages').select('status, sessions_total, sessions_used').eq('id', packageId!).single(),
      admin.from('payments').select('status, amount_pkr, verified_by_user_id').eq('package_id', packageId!).single(),
      admin.from('requests').select('status').eq('id', request!.id).single(),
    ])

    expect(pkg).toMatchObject({ status: 'pending', sessions_total: 8, sessions_used: 0 })
    expect(payment).toMatchObject({ status: 'pending', amount_pkr: 8000, verified_by_user_id: null })
    expect(updatedRequest).toMatchObject({ status: 'payment_pending' })

    const { data: repeatedPackageId, error: repeatedCheckoutError } = await student.rpc(
      'checkout_package',
      {
        p_request_id: request!.id,
        p_tier_sessions: 8,
      },
    )
    expect(repeatedCheckoutError).toBeNull()
    expect(repeatedPackageId).toBe(packageId)

    const { error: paidPaymentError } = await student.from('payments').insert({
      package_id: packageId!,
      payer_user_id: studentUserId,
      amount_pkr: 8000,
      method: 'bank_transfer',
      status: 'paid',
    })
    expect(paidPaymentError).toBeTruthy()
  })
})
