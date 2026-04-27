const pkrNumberFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function formatPkr(amount: number | null | undefined): string {
  const value = Number.isFinite(amount) ? Math.max(0, Math.round(amount ?? 0)) : 0
  const formatted = pkrNumberFormatter.format(value)

  return `PKR ${formatted}`
}
