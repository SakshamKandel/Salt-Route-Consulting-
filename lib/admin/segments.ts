import { Prisma, Role, UserStatus, BookingStatus } from "@prisma/client"

export interface SegmentSpec {
  roles?: Role[]
  userStatus?: UserStatus
  hasBooking?: boolean
  bookingStatus?: BookingStatus
  lastBookingAfter?: string
  lastBookingBefore?: string
  specificUserIds?: string[]
}

export function segmentToWhere(spec: SegmentSpec): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (spec.specificUserIds?.length) {
    where.id = { in: spec.specificUserIds }
    return where
  }

  if (spec.roles?.length) {
    where.role = { in: spec.roles }
  }

  if (spec.userStatus) {
    where.status = spec.userStatus
  }

  if (spec.hasBooking !== undefined || spec.bookingStatus || spec.lastBookingAfter || spec.lastBookingBefore) {
    const bookingFilter: Prisma.BookingWhereInput = {}
    if (spec.bookingStatus) bookingFilter.status = spec.bookingStatus
    if (spec.lastBookingAfter || spec.lastBookingBefore) {
      bookingFilter.createdAt = {
        ...(spec.lastBookingAfter ? { gte: new Date(spec.lastBookingAfter) } : {}),
        ...(spec.lastBookingBefore ? { lte: new Date(spec.lastBookingBefore) } : {}),
      }
    }
    if (spec.hasBooking === false) {
      where.bookings = { none: bookingFilter }
    } else {
      where.bookings = { some: bookingFilter }
    }
  }

  return where
}

export function segmentLabel(spec: SegmentSpec): string {
  if (spec.specificUserIds?.length) {
    return `${spec.specificUserIds.length} specific user(s)`
  }
  const parts: string[] = []
  if (spec.roles?.length) parts.push(`Roles: ${spec.roles.join(", ")}`)
  if (spec.userStatus) parts.push(`Status: ${spec.userStatus}`)
  if (spec.bookingStatus) parts.push(`Booking: ${spec.bookingStatus}`)
  return parts.length ? parts.join(" · ") : "All users"
}
