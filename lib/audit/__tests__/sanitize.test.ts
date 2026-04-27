import { describe, expect, test } from 'vitest'

import { sanitizeAuditDetails } from '@/lib/audit/sanitize'

describe('sanitizeAuditDetails', () => {
  test('redacts configured sensitive fields while preserving investigation context', () => {
    expect(
      sanitizeAuditDetails({
        status: 'rejected',
        rejection_note: 'Parent sent bank reference ABC-123 on WhatsApp +92 300 1234567.',
        meet_link: 'https://meet.google.com/abc-defg-hij',
        request_id: '22222222-2222-4222-8222-222222222222',
      }),
    ).toEqual({
      status: 'rejected',
      rejection_note_redacted: true,
      meet_link_redacted: true,
      request_id: '22222222-2222-4222-8222-222222222222',
    })
  })

  test('redacts nested free-text fields and phone-like strings', () => {
    expect(
      sanitizeAuditDetails({
        schedule_pattern: {
          timezone: 'Asia/Karachi',
          time: '19:00',
        },
        contact: '+92 300 1234567',
        notes: ['first note', 'second note'],
      }),
    ).toEqual({
      schedule_pattern: {
        timezone: 'Asia/Karachi',
        time: '19:00',
      },
      contact_redacted: true,
      notes_redacted: true,
    })
  })
})
