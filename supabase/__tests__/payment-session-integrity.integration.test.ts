import { beforeAll, describe, expect, test } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const hasLocalSupabaseEnv = Boolean(supabaseUrl && anonKey && serviceRoleKey)
const describeLocal = hasLocalSupabaseEnv ? describe : describe.skip

type SupabaseClient = ReturnType<typeof createClient<Database>>
type TestUser = {
  client: SupabaseClient
  email: string
  userId: string
}

describeLocal('payment proof storage, checkout idempotency, and session RPCs', () => {
  const password = 'LocalIntegrityTest!12345'
  const unique = Date.now()

  let admin: SupabaseClient
  let adminUser: TestUser
  let student: TestUser
  let otherStudent: TestUser
  let tutor: TestUser
  let subjectId: number

  beforeAll(async () => {
    admin = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: subject, error: subjectError } = await admin
      .from('subjects')
      .select('id')
      .eq('active', true)
      .limit(1)
      .single()
    if (subjectError || !subject) throw subjectError ?? new Error('No active subject found')
    subjectId = subject.id

    adminUser = await createTestUser('admin', 'Admin Operator')
    student = await createTestUser('student', 'Integrity Student')
    otherStudent = await createTestUser('student', 'Other Student')
    tutor = await createTestUser('tutor', 'Integrity Tutor')
  })

  async function createTestUser(
    role: Database['public']['Enums']['role_enum'],
    displayName: string,
  ): Promise<TestUser> {
    const email = `${role}-${unique}-${crypto.randomUUID()}@example.com`
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: displayName, timezone: 'Asia/Karachi' },
    })
    if (createError || !created.user) {
      throw createError ?? new Error(`Failed to create ${role} user`)
    }

    const userId = created.user.id

    const { error: profileError } = await admin.from('user_profiles').upsert({
      user_id: userId,
      display_name: displayName,
      whatsapp_number: '+923001234567',
      timezone: 'Asia/Karachi',
      primary_role: role,
    })
    if (profileError) throw profileError

    const { error: roleError } = await admin
      .from('user_roles')
      .upsert({ user_id: userId, role })
    if (roleError) throw roleError

    if (role === 'tutor') {
      const { error: tutorError } = await admin.from('tutor_profiles').upsert({
        tutor_user_id: userId,
        approved: true,
        bio: 'Integration test tutor',
        timezone: 'Asia/Karachi',
      })
      if (tutorError) throw tutorError
    }

    const client = createClient<Database>(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: signInError } = await client.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError

    return { client, email, userId }
  }

  async function createStudentRequest(client = student.client, userId = student.userId) {
    const { data: request, error: requestError } = await client
      .from('requests')
      .insert({
        created_by_user_id: userId,
        requester_role: 'student',
        level: 'o_levels',
        subject_id: subjectId,
        exam_board: 'unspecified',
        timezone: 'Asia/Karachi',
        availability_windows: [],
      })
      .select('id')
      .single()
    if (requestError || !request) throw requestError ?? new Error('Failed to create request')

    return request.id
  }

  async function checkoutRequest(requestId: string) {
    const { data: packageId, error: checkoutError } = await student.client.rpc('checkout_package', {
      p_request_id: requestId,
      p_tier_sessions: 8,
    })
    if (checkoutError || !packageId) {
      throw checkoutError ?? new Error('Failed to checkout package')
    }

    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .select('id')
      .eq('package_id', packageId)
      .single()
    if (paymentError || !payment) throw paymentError ?? new Error('Failed to load payment')

    return { packageId, paymentId: payment.id }
  }

  async function createActiveSessionFixture() {
    const requestId = await createStudentRequest()
    const { data: pkg, error: packageError } = await admin
      .from('packages')
      .insert({
        request_id: requestId,
        tier_sessions: 8,
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        sessions_total: 8,
        sessions_used: 0,
        status: 'active',
      })
      .select('id')
      .single()
    if (packageError || !pkg) throw packageError ?? new Error('Failed to create package')

    await admin.from('requests').update({ status: 'active' }).eq('id', requestId)

    const { data: match, error: matchError } = await admin
      .from('matches')
      .insert({
        request_id: requestId,
        tutor_user_id: tutor.userId,
        assigned_by_user_id: adminUser.userId,
        status: 'active',
        meet_link: 'https://meet.google.com/abc-defg-hij',
        schedule_pattern: {
          timezone: 'Asia/Karachi',
          days: [1],
          time: '19:00',
          duration_mins: 60,
        },
      })
      .select('id')
      .single()
    if (matchError || !match) throw matchError ?? new Error('Failed to create match')

    const { data: session, error: sessionError } = await admin
      .from('sessions')
      .insert({
        match_id: match.id,
        scheduled_start_utc: '2026-04-01T12:00:00.000Z',
        scheduled_end_utc: '2026-04-01T13:00:00.000Z',
        status: 'scheduled',
      })
      .select('id')
      .single()
    if (sessionError || !session) throw sessionError ?? new Error('Failed to create session')

    return { requestId, packageId: pkg.id, sessionId: session.id }
  }

  async function getPackageUsage(packageId: string) {
    const { data, error } = await admin
      .from('packages')
      .select('sessions_used')
      .eq('id', packageId)
      .single()
    if (error || !data) throw error ?? new Error('Failed to load package usage')

    return data.sessions_used
  }

  test('keeps payment proof bucket private and grants proof access only to owner/admin', async () => {
    const { data: bucket, error: bucketError } = await admin.storage.getBucket('payment-proofs')
    expect(bucketError).toBeNull()
    expect(bucket?.public).toBe(false)

    const requestId = await createStudentRequest()
    const { packageId, paymentId } = await checkoutRequest(requestId)
    const proofPath = `${student.userId}/${packageId}/proof.txt`

    const { error: uploadError } = await student.client.storage
      .from('payment-proofs')
      .upload(proofPath, new Blob(['proof']))
    expect(uploadError).toBeNull()

    const { error: crossPrefixUploadError } = await otherStudent.client.storage
      .from('payment-proofs')
      .upload(`${student.userId}/${packageId}/intrusion.txt`, new Blob(['intrusion']))
    expect(crossPrefixUploadError).toBeTruthy()

    const { error: paymentUpdateError } = await student.client
      .from('payments')
      .update({ proof_path: proofPath, reference: 'proof-owner' })
      .eq('id', paymentId)
    expect(paymentUpdateError).toBeNull()

    const { data: ownerSignedUrl, error: ownerSignedUrlError } = await student.client.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 300)
    expect(ownerSignedUrlError).toBeNull()
    expect(ownerSignedUrl?.signedUrl).toContain('/storage/v1/object/sign/payment-proofs/')

    const { error: otherDownloadError } = await otherStudent.client.storage
      .from('payment-proofs')
      .download(proofPath)
    expect(otherDownloadError).toBeTruthy()

    const { error: otherSignedUrlError } = await otherStudent.client.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 300)
    expect(otherSignedUrlError).toBeTruthy()

    const { data: adminSignedUrl, error: adminSignedUrlError } = await admin.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 300)
    expect(adminSignedUrlError).toBeNull()
    expect(adminSignedUrl?.signedUrl).toContain('/storage/v1/object/sign/payment-proofs/')

    const { error: deleteError } = await student.client.storage
      .from('payment-proofs')
      .remove([proofPath])
    expect(deleteError).toBeNull()

    const { data: deletedProof, error: deletedProofError } = await student.client.storage
      .from('payment-proofs')
      .download(proofPath)
    expect(deletedProofError).toBeTruthy()
    expect(deletedProof).toBeNull()
  })

  test('keeps checkout and rejected-payment resubmission idempotent', async () => {
    const requestId = await createStudentRequest()
    const { packageId, paymentId } = await checkoutRequest(requestId)

    const { data: repeatedPackageId, error: repeatedCheckoutError } = await student.client.rpc(
      'checkout_package',
      {
        p_request_id: requestId,
        p_tier_sessions: 8,
      },
    )
    expect(repeatedCheckoutError).toBeNull()
    expect(repeatedPackageId).toBe(packageId)

    const { count: paymentCount, error: paymentCountError } = await admin
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('package_id', packageId)
    expect(paymentCountError).toBeNull()
    expect(paymentCount).toBe(1)

    const secondRequestId = await createStudentRequest()
    const { packageId: secondPackageId, paymentId: secondPaymentId } = await checkoutRequest(
      secondRequestId,
    )

    const oldProofPath = `${student.userId}/${packageId}/old-proof.txt`
    const newProofPath = `${student.userId}/${packageId}/new-proof.txt`
    const untouchedProofPath = `${student.userId}/${secondPackageId}/untouched-proof.txt`

    const { error: rejectError } = await admin
      .from('payments')
      .update({
        status: 'rejected',
        proof_path: oldProofPath,
        reference: 'old-reference',
        rejection_note: 'Unreadable proof',
        verified_by_user_id: adminUser.userId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
    expect(rejectError).toBeNull()

    const { error: untouchedUpdateError } = await admin
      .from('payments')
      .update({ proof_path: untouchedProofPath, reference: 'untouched' })
      .eq('id', secondPaymentId)
    expect(untouchedUpdateError).toBeNull()

    const { data: wronglyScopedUpdate, error: wronglyScopedUpdateError } = await admin
      .from('payments')
      .update({ proof_path: newProofPath })
      .eq('id', secondPaymentId)
      .eq('payer_user_id', otherStudent.userId)
      .eq('status', 'rejected')
      .select('id')
    expect(wronglyScopedUpdateError).toBeNull()
    expect(wronglyScopedUpdate).toEqual([])

    const { data: resubmitted, error: resubmitError } = await admin
      .from('payments')
      .update({
        status: 'pending',
        proof_path: newProofPath,
        reference: 'new-reference',
        rejection_note: null,
        verified_by_user_id: null,
        verified_at: null,
      })
      .eq('id', paymentId)
      .eq('payer_user_id', student.userId)
      .eq('status', 'rejected')
      .select('id, proof_path, status')
    expect(resubmitError).toBeNull()
    expect(resubmitted).toEqual([{ id: paymentId, proof_path: newProofPath, status: 'pending' }])

    const { data: secondPayment, error: secondPaymentError } = await admin
      .from('payments')
      .select('proof_path, reference, status')
      .eq('id', secondPaymentId)
      .single()
    expect(secondPaymentError).toBeNull()
    expect(secondPayment).toMatchObject({
      proof_path: untouchedProofPath,
      reference: 'untouched',
      status: 'pending',
    })
  })

  test('keeps session usage accounting stable across RPC transitions', async () => {
    const { packageId, sessionId } = await createActiveSessionFixture()

    const { error: doneError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'done',
      p_notes: 'Completed first pass',
    })
    expect(doneError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(1)

    const { error: repeatDoneError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'done',
      p_notes: 'Duplicate submit',
    })
    expect(repeatDoneError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(1)

    const { error: studentNoShowError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'no_show_student',
      p_notes: 'Student missed class',
    })
    expect(studentNoShowError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(1)

    const { error: tutorNoShowError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'no_show_tutor',
      p_notes: 'Tutor missed class',
    })
    expect(tutorNoShowError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(0)

    const { error: rescheduledByTutorError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'rescheduled',
      p_notes: 'Tutor attempted reschedule',
    })
    expect(rescheduledByTutorError).toBeTruthy()

    const { error: consumingAgainError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'no_show_student',
      p_notes: 'Consume before admin reschedule',
    })
    expect(consumingAgainError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(1)

    const { error: adminRescheduleError } = await adminUser.client.rpc('tutor_update_session', {
      p_session_id: sessionId,
      p_status: 'rescheduled',
      p_notes: 'Admin exception reschedule',
    })
    expect(adminRescheduleError).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(0)
  })

  test('protects session usage RPC permissions and future-session completion', async () => {
    const { requestId, packageId } = await createActiveSessionFixture()

    const { error: directStudentIncrementError } = await student.client.rpc(
      'increment_sessions_used',
      { p_request_id: requestId },
    )
    expect(directStudentIncrementError).toBeTruthy()
    expect(await getPackageUsage(packageId)).toBe(0)

    await admin.from('packages').update({ sessions_total: 2 }).eq('id', packageId)

    const firstAdminIncrement = await admin.rpc('increment_sessions_used', {
      p_request_id: requestId,
    })
    const secondAdminIncrement = await admin.rpc('increment_sessions_used', {
      p_request_id: requestId,
    })
    const cappedAdminIncrement = await admin.rpc('increment_sessions_used', {
      p_request_id: requestId,
    })
    expect(firstAdminIncrement.error).toBeNull()
    expect(secondAdminIncrement.error).toBeNull()
    expect(cappedAdminIncrement.error).toBeNull()
    expect(await getPackageUsage(packageId)).toBe(2)

    const futureFixture = await createActiveSessionFixture()
    await admin
      .from('sessions')
      .update({
        scheduled_start_utc: '2999-04-01T12:00:00.000Z',
        scheduled_end_utc: '2999-04-01T13:00:00.000Z',
      })
      .eq('id', futureFixture.sessionId)

    const { error: futureCompletionError } = await tutor.client.rpc('tutor_update_session', {
      p_session_id: futureFixture.sessionId,
      p_status: 'done',
      p_notes: 'Too early',
    })
    expect(futureCompletionError?.message).toContain('session has not started yet')
    expect(await getPackageUsage(futureFixture.packageId)).toBe(0)
  })
})
