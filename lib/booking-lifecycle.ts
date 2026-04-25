import type { BookingStatus, Role } from "@prisma/client"

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "CHECKED_IN"]
export const REVIEWABLE_BOOKING_STATUSES: BookingStatus[] = ["COMPLETED"]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  COMPLETED: "Checked out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
}

const ADMIN_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

const OWNER_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [],
  CONFIRMED: ["CHECKED_IN", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function getAllowedBookingTransitions(status: BookingStatus, role: Role) {
  if (role === "ADMIN") return ADMIN_TRANSITIONS[status] ?? []
  if (role === "OWNER") return OWNER_TRANSITIONS[status] ?? []
  return []
}

export function assertBookingTransition(current: BookingStatus, next: BookingStatus, role: Role) {
  const allowed = getAllowedBookingTransitions(current, role)
  if (!allowed.includes(next)) {
    throw new Error(`Cannot move booking from ${BOOKING_STATUS_LABELS[current]} to ${BOOKING_STATUS_LABELS[next]}.`)
  }
}

export function getBookingStatusTimestampUpdate(status: BookingStatus, now = new Date()) {
  if (status === "CONFIRMED") return { confirmedAt: now }
  if (status === "CHECKED_IN") return { checkedInAt: now }
  if (status === "COMPLETED") return { checkedOutAt: now }
  if (status === "CANCELLED") return { cancelledAt: now }
  if (status === "NO_SHOW") return { noShowAt: now }
  return {}
}

export function canReviewBooking(booking: { status: BookingStatus; checkedOutAt?: Date | string | null }) {
  return booking.status === "COMPLETED" && Boolean(booking.checkedOutAt)
}
