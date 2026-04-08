import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/lib/services/payments', () => ({
  expirePackages: vi.fn(async () => 0),
}))

import { expirePackages } from '@/lib/services/payments'
import { GET } from './route'

const mockedExpirePackages = vi.mocked(expirePackages)

describe('GET /api/cron/expire-packages', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    mockedExpirePackages.mockClear()
  })

  test('fails closed when CRON_SECRET is missing', async () => {
    vi.stubEnv('CRON_SECRET', undefined)

    const response = await GET(
      new Request('http://localhost/api/cron/expire-packages', {
        headers: { authorization: 'Bearer undefined' },
      }),
    )

    expect(response.status).toBe(401)
    expect(mockedExpirePackages).not.toHaveBeenCalled()
  })

  test('runs expiration when the configured bearer token matches', async () => {
    vi.stubEnv('CRON_SECRET', 'local-cron-secret')

    const response = await GET(
      new Request('http://localhost/api/cron/expire-packages', {
        headers: { authorization: 'Bearer local-cron-secret' },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true, expired: 0 })
    expect(mockedExpirePackages).toHaveBeenCalledTimes(1)
  })
})
