import { describe, expect, test } from 'vitest'

import { leadStatusUpdateSchema } from '@/lib/validators/lead-admin'

describe('leadStatusUpdateSchema', () => {
  test('allows admin lead status and notes updates', () => {
    const result = leadStatusUpdateSchema.safeParse({
      leadId: '11111111-1111-4111-8111-111111111111',
      status: 'contacted',
      admin_notes: 'Follow up after parent confirms schedule.',
    })

    expect(result.success).toBe(true)
  })

  test('rejects invalid lead statuses', () => {
    const result = leadStatusUpdateSchema.safeParse({
      leadId: '11111111-1111-4111-8111-111111111111',
      status: 'archived',
      admin_notes: '',
    })

    expect(result.success).toBe(false)
  })
})
