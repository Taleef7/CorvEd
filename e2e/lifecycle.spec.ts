import path from 'node:path'

import { test, expect, type Browser, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

import type { Database } from '@/lib/supabase/database.types'

const proofFixturePath = path.resolve(__dirname, 'fixtures', 'payment-proof.pdf')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Local Supabase service-role env is not configured for lifecycle tests.')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function signIn(page: Page, email: string, password: string, expectedUrl: RegExp) {
  await page.goto('/auth/sign-in')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(expectedUrl, { timeout: 15_000 })
}

async function createAuthenticatedPage(
  browser: Browser,
  email: string,
  password: string,
  expectedUrl: RegExp,
) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await signIn(page, email, password, expectedUrl)
  return { context, page }
}

async function createSeededUser(params: {
  email: string
  password: string
  displayName: string
  whatsapp: string
  role: 'student' | 'tutor'
}) {
  const admin = createServiceClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      name: params.displayName,
      role: params.role,
      timezone: 'Asia/Karachi',
    },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create ${params.role} test user: ${error?.message ?? 'unknown error'}`)
  }

  const userId = data.user.id
  await admin
    .from('user_profiles')
    .update({
      display_name: params.displayName,
      whatsapp_number: params.whatsapp,
      timezone: 'Asia/Karachi',
      primary_role: params.role,
    })
    .eq('user_id', userId)

  await admin.from('user_roles').upsert({ user_id: userId, role: params.role })

  return { id: userId, email: params.email, password: params.password, displayName: params.displayName }
}

async function createSeededAdmin(params: {
  email: string
  password: string
  displayName: string
  whatsapp: string
}) {
  const admin = createServiceClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      name: params.displayName,
      role: 'student',
      timezone: 'Asia/Karachi',
    },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create admin test user: ${error?.message ?? 'unknown error'}`)
  }

  const userId = data.user.id
  await admin
    .from('user_profiles')
    .update({
      display_name: params.displayName,
      whatsapp_number: params.whatsapp,
      timezone: 'Asia/Karachi',
      primary_role: 'admin',
    })
    .eq('user_id', userId)

  await admin.from('user_roles').upsert({ user_id: userId, role: 'admin' })

  return { id: userId, email: params.email, password: params.password, displayName: params.displayName }
}

async function ensureSubject() {
  const admin = createServiceClient()
  const { data, error } = await admin
    .from('subjects')
    .upsert(
      {
        code: 'math',
        name: 'Mathematics',
        active: true,
        sort_order: 1,
      },
      { onConflict: 'code' },
    )
    .select('id, name')
    .single()

  if (error || !data) {
    throw new Error(`Failed to ensure Mathematics subject: ${error?.message ?? 'unknown error'}`)
  }

  return data
}

async function seedApprovedTutor(tutorUserId: string, subjectId: number) {
  const admin = createServiceClient()

  await admin.from('tutor_profiles').upsert({
    tutor_user_id: tutorUserId,
    approved: true,
    bio: 'Lifecycle test tutor',
    timezone: 'Asia/Karachi',
    experience_years: 4,
    education: 'BS Mathematics',
    teaching_approach: 'Exam-focused',
  })

  await admin.from('tutor_subjects').upsert({
    tutor_user_id: tutorUserId,
    subject_id: subjectId,
    level: 'o_levels',
  })

  await admin.from('tutor_availability').upsert({
    tutor_user_id: tutorUserId,
    windows: [
      { day: 1, start: '16:00', end: '20:00' },
      { day: 3, start: '16:00', end: '20:00' },
      { day: 5, start: '16:00', end: '20:00' },
    ],
  })
}

test.describe('Authenticated Lifecycle', () => {
  test('student request, payment, matching, session generation, and tutor completion work end to end', async ({
    browser,
  }, testInfo) => {
    test.setTimeout(180_000)
    test.slow()
    test.skip(testInfo.project.name === 'mobile', 'Full lifecycle is covered on desktop only.')

    const unique = Date.now().toString()
    const password = 'Passw0rd!123'
    const studentName = `Lifecycle Student ${unique}`
    const adminName = `Lifecycle Admin ${unique}`
    const tutorName = `Lifecycle Tutor ${unique}`

    const subject = await ensureSubject()
    const student = await createSeededUser({
      email: `student.${unique}@corved.test`,
      password,
      displayName: studentName,
      whatsapp: '+923001110001',
      role: 'student',
    })
    const adminUser = await createSeededAdmin({
      email: `admin.${unique}@corved.test`,
      password,
      displayName: adminName,
      whatsapp: '+923001110002',
    })
    const tutor = await createSeededUser({
      email: `tutor.${unique}@corved.test`,
      password,
      displayName: tutorName,
      whatsapp: '+923001110003',
      role: 'tutor',
    })
    await seedApprovedTutor(tutor.id, subject.id)
    const admin = createServiceClient()

    const karachiDay = DateTime.now().setZone('Asia/Karachi').weekday % 7
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const scheduleDayLabel = dayLabels[karachiDay]

    const studentSession = await createAuthenticatedPage(browser, student.email, student.password, /\/dashboard/)
    const studentPage = studentSession.page

    await studentPage.goto('/dashboard/requests/new')
    await studentPage.locator('section').filter({ hasText: 'Step 2' }).locator('select').nth(0).selectOption('o_levels')
    await studentPage.locator('section').filter({ hasText: 'Step 2' }).locator('select').nth(1).selectOption(String(subject.id))
    await studentPage.getByRole('button', { name: /8\s+sessions\/month/i }).click()
    await studentPage.getByRole('button', { name: /Mon Evening|Tue Evening|Wed Evening|Thu Evening|Fri Evening|Sat Evening|Sun Evening/i }).first().click()
    await studentPage.getByRole('button', { name: /submit request/i }).click()

    let requestId: string | null = null
    await expect
      .poll(async () => {
        const { data } = await admin
          .from('requests')
          .select('id, status')
          .eq('created_by_user_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        requestId = data?.id ?? null
        return data?.status ?? null
      }, { timeout: 15_000 })
      .toBe('new')

    expect(requestId).toBeTruthy()
    await studentPage.goto(`/dashboard/requests/${requestId}`)
    await studentPage.getByRole('link', { name: /Continue to Payment/i }).click()
    await expect(studentPage).toHaveURL(/\/dashboard\/packages\/new/)

    await studentPage.getByRole('button', { name: /Continue to payment/i }).click()
    await expect(studentPage).toHaveURL(/\/dashboard\/packages\/.+/)
    await studentPage.getByLabel(/Transaction reference/i).fill(`TRX-${unique}`)
    await studentPage.setInputFiles('#payment-proof', proofFixturePath)
    await studentPage.getByRole('button', { name: /I have made the transfer/i }).click()

    let requestStatus: string | null = null
    await expect
      .poll(async () => {
        const { data } = await admin
          .from('requests')
          .select('status')
          .eq('id', requestId)
          .single()

        requestStatus = data?.status ?? null
        return requestStatus
      }, { timeout: 15_000 })
      .toBe('payment_pending')

    const { data: request } = await admin.from('requests').select('id, status').eq('id', requestId).single()
    expect(request?.status).toBe('payment_pending')

    let paymentId: string | null = null
    await expect
      .poll(async () => {
        const { data } = await admin
          .from('payments')
          .select('id, package_id, status')
          .eq('payer_user_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        paymentId = data?.id ?? null
        return data?.status ?? null
      }, { timeout: 15_000 })
      .toBe('pending')

    const { data: payment } = await admin
      .from('payments')
      .select('id, package_id, status')
      .eq('id', paymentId)
      .single()
    expect(payment?.status).toBe('pending')

    const adminSession = await createAuthenticatedPage(browser, adminUser.email, adminUser.password, /\/admin/)
    const adminPage = adminSession.page

    await adminPage.goto('/admin/payments?filter=pending')
    const paymentCard = adminPage.locator('div').filter({ hasText: studentName }).filter({ hasText: 'PKR' }).first()
    await expect(paymentCard).toBeVisible()
    await paymentCard.getByRole('button', { name: /Mark Paid/i }).first().click()
    await expect.poll(async () => {
      const { data } = await admin
        .from('payments')
        .select('status')
        .eq('id', payment!.id)
        .single()
      return data?.status ?? null
    }).toBe('paid')
    await expect.poll(async () => {
      const { data } = await admin
        .from('requests')
        .select('status')
        .eq('id', request!.id)
        .single()
      return data?.status ?? null
    }).toBe('ready_to_match')

    await adminPage.goto('/admin/requests?status=ready_to_match')
    const requestRow = adminPage.getByRole('row').filter({ hasText: studentName })
    await expect(requestRow).toBeVisible()
    await requestRow.getByRole('link', { name: /Match/i }).click()

    const tutorCard = adminPage.locator('div').filter({ hasText: tutorName }).first()
    await expect(tutorCard).toBeVisible()
    await tutorCard.locator('input[type="radio"]').first().check()
    await expect(adminPage.getByText('Assignment Details')).toBeVisible()
    await adminPage.getByLabel(/Google Meet Link/i).fill('https://meet.google.com/lifecycle-test')
    await adminPage.getByLabel(/Schedule Timezone/i).fill('Asia/Karachi')
    await adminPage.getByLabel(scheduleDayLabel).check()
    await adminPage.getByLabel(/Start Time/i).fill('10:00')
    await adminPage.getByRole('button', { name: /Assign Tutor/i }).click()
    await expect(adminPage).toHaveURL(/\/admin\/matches\/.+assigned=1/)
    await expect(adminPage.getByText(/Tutor assigned successfully/i)).toBeVisible()

    await adminPage.getByRole('button', { name: /Generate Sessions/i }).click()
    await expect(adminPage.getByText(/generated successfully/i)).toBeVisible()

    const { data: match } = await admin
      .from('matches')
      .select('id, request_id')
      .eq('request_id', request!.id)
      .single()
    expect(match?.id).toBeTruthy()

    const { data: sessions } = await admin
      .from('sessions')
      .select('id, scheduled_start_utc')
      .eq('match_id', match!.id)
      .order('scheduled_start_utc', { ascending: true })
    expect((sessions ?? []).length).toBeGreaterThan(0)

    const firstSession = sessions![0]
    const pastStart = DateTime.now().minus({ hours: 2 }).toUTC().toISO()
    const pastEnd = DateTime.now().minus({ hours: 1 }).toUTC().toISO()
    await admin
      .from('sessions')
      .update({
        scheduled_start_utc: pastStart!,
        scheduled_end_utc: pastEnd!,
        status: 'scheduled',
      })
      .eq('id', firstSession.id)

    const tutorSession = await createAuthenticatedPage(browser, tutor.email, tutor.password, /\/tutor/)
    const tutorPage = tutorSession.page
    await tutorPage.goto('/tutor/sessions?view=past')
    const tutorCardForStudent = tutorPage.locator('div').filter({ hasText: studentName }).first()
    await expect(tutorCardForStudent).toBeVisible()
    await tutorCardForStudent.getByRole('button', { name: /Mark Session/i }).click()
    await tutorCardForStudent.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(tutorPage.getByText('Session updated successfully')).toBeVisible()

    const { data: activePackage } = await admin
      .from('packages')
      .select('id, sessions_used, status')
      .eq('id', payment!.package_id)
      .single()
    expect(activePackage?.status).toBe('active')
    expect(activePackage?.sessions_used).toBe(1)

    await studentPage.goto('/dashboard')
    await studentPage.reload()
    await expect(studentPage.getByText('1 of 8 sessions used')).toBeVisible()
    await expect(studentPage.getByText('7 of 8')).toBeVisible()

    await tutorSession.context.close()
    await adminSession.context.close()
    await studentSession.context.close()
  })
})
