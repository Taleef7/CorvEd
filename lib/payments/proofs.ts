export const MAX_PAYMENT_PROOF_SIZE_BYTES = 5 * 1024 * 1024

export const PAYMENT_PROOF_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
] as const

export type PaymentProofMimeType = (typeof PAYMENT_PROOF_ALLOWED_TYPES)[number]

export function isAllowedPaymentProofType(type: string): type is PaymentProofMimeType {
  return PAYMENT_PROOF_ALLOWED_TYPES.includes(type as PaymentProofMimeType)
}

export function sanitizePaymentProofFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  const baseName = (lastDot > 0 ? fileName.slice(0, lastDot) : fileName)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60)
  const extension = lastDot > 0 ? fileName.slice(lastDot).replace(/[^a-zA-Z0-9.]/g, '') : ''
  const safeBaseName = baseName || 'proof'

  return `${safeBaseName}${extension}`
}

export function buildPaymentProofPath({
  userId,
  packageId,
  fileName,
  timestamp = Date.now(),
}: {
  userId: string
  packageId: string
  fileName: string
  timestamp?: number
}): string {
  return `${userId}/${packageId}/${timestamp}_${sanitizePaymentProofFileName(fileName)}`
}

export function isPaymentProofPathForPackage({
  proofPath,
  userId,
  packageId,
}: {
  proofPath: string | null
  userId: string
  packageId: string
}): boolean {
  if (!proofPath) return false

  const trimmedPath = proofPath.replace(/^\/+/, '')
  const [pathUserId, pathPackageId, ...fileParts] = trimmedPath.split('/')
  const fileName = fileParts.join('/')

  return pathUserId === userId
    && pathPackageId === packageId
    && fileName.length > 0
    && !fileParts.includes('..')
}
