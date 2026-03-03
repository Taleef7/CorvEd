// E5 T5.2: PKR pricing config for package tiers
// Closes #34

export type PackageTier = 8 | 12 | 20

export interface PackageConfig {
  tier: PackageTier
  sessionsPerMonth: number
  typicalFrequency: string
  pricePerMonthPkr: number
  description: string
}

function createPackageConfig(
  tier: PackageTier,
  typicalFrequency: string,
  pricePerMonthPkr: number,
  description: string,
): PackageConfig {
  return { tier, sessionsPerMonth: tier, typicalFrequency, pricePerMonthPkr, description }
}

export const PACKAGES: PackageConfig[] = [
  createPackageConfig(8,  '~2x per week', 8000,  '8 sessions per month, 60 minutes each'),
  createPackageConfig(12, '~3x per week', 11000, '12 sessions per month, 60 minutes each'),
  createPackageConfig(20, '~5x per week', 16000, '20 sessions per month, 60 minutes each'),
]

export const PAYMENT_INSTRUCTIONS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Not configured',
  accountTitle: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'Not configured',
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || 'Not configured',
  referenceFormat: 'CorvEd | {StudentName} | {Subject} | {Level}',
  notes:
    'After transferring, send your screenshot or transaction reference to our WhatsApp for faster verification.',
}
