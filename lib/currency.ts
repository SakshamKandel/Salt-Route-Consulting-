type MoneyLike = number | string | { toString(): string } | null | undefined

export function formatNpr(value: MoneyLike, options: { decimals?: number } = {}) {
  const amount = typeof value === "number" ? value : Number(value?.toString() ?? 0)
  const decimals = options.decimals ?? (Number.isInteger(amount) ? 0 : 2)

  return `NPR ${new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)}`
}
