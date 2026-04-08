import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationSql = readFileSync(
  join(
    process.cwd(),
    'supabase/migrations/20260408000001_harden_lifecycle_rls_and_checkout.sql',
  ),
  'utf8',
)

describe('lifecycle RLS hardening migration', () => {
  test('constrains client-controlled initial request, package, and payment states', () => {
    expect(migrationSql).toContain('requests_insert_self')
    expect(migrationSql).toContain("requests.status = 'new'")
    expect(migrationSql).toContain("packages.status = 'pending'")
    expect(migrationSql).toContain('packages.sessions_total = packages.tier_sessions')
    expect(migrationSql).toContain("payments.status = 'pending'")
    expect(migrationSql).toContain('payments.verified_by_user_id is null')
  })

  test('adds a transactional checkout RPC and duplicate package guard', () => {
    expect(migrationSql).toContain('create or replace function public.checkout_package')
    expect(migrationSql).toContain('packages_one_open_package_per_request')
    expect(migrationSql).toContain("status in ('pending', 'active')")
  })

  test('blocks tutor completion of future sessions in the RPC', () => {
    expect(migrationSql).toContain('v_scheduled_start_utc')
    expect(migrationSql).toContain("raise exception 'session has not started yet'")
  })
})
