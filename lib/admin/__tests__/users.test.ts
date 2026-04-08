import { describe, expect, test } from 'vitest'

import {
  buildAdminUpdateUserProfileAuditEntry,
  getHighestPriorityPaymentStatus,
} from '@/lib/admin/users'

describe('getHighestPriorityPaymentStatus', () => {
  test('prefers paid over pending and rejected statuses', () => {
    expect(getHighestPriorityPaymentStatus(['pending', 'rejected', 'paid'])).toBe('paid')
  })

  test('retains refunded when it is the only terminal status', () => {
    expect(getHighestPriorityPaymentStatus(['refunded'])).toBe('refunded')
  })
})

describe('buildAdminUpdateUserProfileAuditEntry', () => {
  test('records the admin as the actor and the edited profile as the entity', () => {
    expect(
      buildAdminUpdateUserProfileAuditEntry({
        actorUserId: 'admin-123',
        targetUserId: 'student-456',
        displayName: 'Updated Name',
      }),
    ).toEqual({
      actor_user_id: 'admin-123',
      action: 'admin_update_user_profile',
      entity_type: 'user_profiles',
      entity_id: 'student-456',
      details: { display_name: 'Updated Name' },
    })
  })
})
