import { describe, expect, test } from 'vitest'

import {
  buildPaymentProofPath,
  isAllowedPaymentProofType,
  isPaymentProofPathForPackage,
  sanitizePaymentProofFileName,
} from '@/lib/payments/proofs'

describe('payment proof path helpers', () => {
  test('builds private proof paths under the payer and package prefix', () => {
    expect(
      buildPaymentProofPath({
        userId: 'user-123',
        packageId: 'pkg-456',
        fileName: 'Transfer receipt #42.pdf',
        timestamp: 12345,
      }),
    ).toBe('user-123/pkg-456/12345_Transfer_receipt__42.pdf')
  })

  test('sanitizes file names without dropping the final extension', () => {
    expect(sanitizePaymentProofFileName(' bank / receipt (final).png')).toBe(
      '_bank___receipt__final_.png',
    )
    expect(sanitizePaymentProofFileName('')).toBe('proof')
  })

  test('accepts only expected upload mime types', () => {
    expect(isAllowedPaymentProofType('image/jpeg')).toBe(true)
    expect(isAllowedPaymentProofType('application/pdf')).toBe(true)
    expect(isAllowedPaymentProofType('image/svg+xml')).toBe(false)
  })

  test('requires proof paths to match the payment owner and package', () => {
    expect(
      isPaymentProofPathForPackage({
        proofPath: 'user-123/pkg-456/12345_receipt.pdf',
        userId: 'user-123',
        packageId: 'pkg-456',
      }),
    ).toBe(true)

    expect(
      isPaymentProofPathForPackage({
        proofPath: 'user-123/other-package/12345_receipt.pdf',
        userId: 'user-123',
        packageId: 'pkg-456',
      }),
    ).toBe(false)

    expect(
      isPaymentProofPathForPackage({
        proofPath: 'other-user/pkg-456/12345_receipt.pdf',
        userId: 'user-123',
        packageId: 'pkg-456',
      }),
    ).toBe(false)
  })
})
