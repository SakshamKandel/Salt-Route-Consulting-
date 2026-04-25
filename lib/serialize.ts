import { Prisma } from "@prisma/client"

type Serialized<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
  ? Date
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T

/**
 * Recursively converts Prisma Decimal values to plain numbers so the result is safe
 * to pass from a Server Component to a Client Component. Dates are left as-is —
 * Next.js Flight serialization handles them.
 */
export function serializeForClient<T>(value: T): Serialized<T> {
  if (value === null || value === undefined) return value as Serialized<T>
  if (value instanceof Prisma.Decimal) return Number(value) as Serialized<T>
  if (value instanceof Date) return value as Serialized<T>
  if (Array.isArray(value)) {
    return value.map((item) => serializeForClient(item)) as Serialized<T>
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serializeForClient(val)
    }
    return out as Serialized<T>
  }
  return value as Serialized<T>
}
