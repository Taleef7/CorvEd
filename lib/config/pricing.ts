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

export const PACKAGES: PackageConfig[] = [
  {
    tier: 8,
    sessionsPerMonth: 8,
    typicalFrequency: '~2x per week',
    pricePerMonthPkr: 8000,
    description: '8 sessions per month, 60 minutes each',
  },
  {
    tier: 12,
    sessionsPerMonth: 12,
    typicalFrequency: '~3x per week',
    pricePerMonthPkr: 11000,
    description: '12 sessions per month, 60 minutes each',
  },
  {
    tier: 20,
    sessionsPerMonth: 20,
    typicalFrequency: '~5x per week',
    pricePerMonthPkr: 16000,
    description: '20 sessions per month, 60 minutes each',
  },
]

export const PAYMENT_INSTRUCTIONS = {
  bankName: '',           // ← Fill in before launch
  accountTitle: '',       // ← Fill in before launch
  accountNumber: '',      // ← Fill in before launch
  referenceFormat: 'CorvEd | {StudentName} | {Subject} | {Level}',
  notes:
    'After transferring, send your screenshot or transaction reference to our WhatsApp for faster verification.',
}
