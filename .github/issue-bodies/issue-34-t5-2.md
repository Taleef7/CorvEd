## Parent epic

Epic E5: packages and payments (P0) — #30

## Objective

Create a `lib/config/pricing.ts` constants file with PKR prices for the three package tiers (8, 12, 20 sessions) and bank transfer instructions — so that pricing can be updated from a single location without touching component code.

---

## Background

From `docs/MVP.md` section 6.3 (pricing model):
> "prices are tiered in PKR. pricing should be set slightly above average market rate to incentivize tutors. MVP implementation requirement: pricing is configurable (via config file or admin setting) without code changes — but can ship initially with hardcoded defaults until an admin pricing UI exists."

For MVP, hardcoded config is the right approach. No database or admin UI is needed for pricing yet — that comes in a later sprint.

---

## Config file: `lib/config/pricing.ts`

```ts
export type PackageTier = 8 | 12 | 20

export interface PackageConfig {
  tier: PackageTier
  sessionsPerMonth: number
  typicalFrequency: string  // display string
  pricePerMonthPkr: number  // in PKR
  description: string
}

export const PACKAGES: PackageConfig[] = [
  {
    tier: 8,
    sessionsPerMonth: 8,
    typicalFrequency: '~2x per week',
    pricePerMonthPkr: 8000,     // ← UPDATE THIS to real price before launch
    description: '8 sessions per month, 60 minutes each',
  },
  {
    tier: 12,
    sessionsPerMonth: 12,
    typicalFrequency: '~3x per week',
    pricePerMonthPkr: 11000,    // ← UPDATE THIS to real price before launch
    description: '12 sessions per month, 60 minutes each',
  },
  {
    tier: 20,
    sessionsPerMonth: 20,
    typicalFrequency: '~5x per week',
    pricePerMonthPkr: 16000,    // ← UPDATE THIS to real price before launch
    description: '20 sessions per month, 60 minutes each',
  },
]

export const PAYMENT_INSTRUCTIONS = {
  bankName: '',           // ← Fill in before launch
  accountTitle: '',       // ← Fill in before launch
  accountNumber: '',      // ← Fill in before launch
  referenceFormat: 'CorvEd | {StudentName} | {Subject} | {Level}',
  notes: 'After transferring, send your screenshot or transaction reference to our WhatsApp.',
}
```

---

## Usage in package selection component

```tsx
import { PACKAGES } from '@/lib/config/pricing'

export function PackageCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PACKAGES.map(pkg => (
        <div key={pkg.tier} className="border rounded-lg p-4">
          <h3>{pkg.sessionsPerMonth} Sessions/Month</h3>
          <p>{pkg.typicalFrequency}</p>
          <p className="text-2xl font-bold">PKR {pkg.pricePerMonthPkr.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{pkg.description}</p>
          <button>Select</button>
        </div>
      ))}
    </div>
  )
}
```

---

## Bank transfer instructions display

After package selection, show payment instructions:

```tsx
import { PAYMENT_INSTRUCTIONS } from '@/lib/config/pricing'

export function PaymentInstructions({ studentName, subject, level }: ...) {
  const reference = PAYMENT_INSTRUCTIONS.referenceFormat
    .replace('{StudentName}', studentName)
    .replace('{Subject}', subject)
    .replace('{Level}', level)

  return (
    <div>
      <h3>Bank Transfer Instructions</h3>
      <p>Bank: {PAYMENT_INSTRUCTIONS.bankName}</p>
      <p>Account: {PAYMENT_INSTRUCTIONS.accountTitle}</p>
      <p>IBAN/Account: {PAYMENT_INSTRUCTIONS.accountNumber}</p>
      <p><strong>Reference: {reference}</strong></p>
      <p>{PAYMENT_INSTRUCTIONS.notes}</p>
    </div>
  )
}
```

---

## Acceptance criteria

- [ ] `lib/config/pricing.ts` exists with the `PACKAGES` array and `PAYMENT_INSTRUCTIONS` object
- [ ] Pricing values are real (confirmed before launch) or clearly marked as placeholders
- [ ] Package selection page (S5.1) imports from this config (not hardcoded inline)
- [ ] Payment instructions (T5.3) imports from this config
- [ ] Adding a 4th package tier in future requires only a config change (not component change)

---

## Definition of done

- [ ] `lib/config/pricing.ts` created with `PACKAGES` array and `PAYMENT_INSTRUCTIONS`
- [ ] No inline price literals in component files — all imported from config
- [ ] Bank transfer fields are populated (even with placeholders until launch)

---

## References

- `docs/MVP.md` — section 6 (packages and pricing model — configurable from config file)
- `docs/OPS.md` — section 6.4 (/paybank quick reply template — bank transfer instruction format)
- `docs/PRODUCT.md` — section 8.2 (pricing principles)
