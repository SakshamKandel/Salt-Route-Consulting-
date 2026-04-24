import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * 10.1 — Per-resource ownership checks.
 * Centralised helpers every API route / server action can call
 * before touching a resource.
 */

export type ResourceCheck =
  | { ok: true }
  | { ok: false; response: NextResponse }

/**
 * Verify that a booking belongs to the given user OR the caller is an ADMIN.
 */
export async function assertBookingAccess(
  bookingId: string,
  userId: string,
  userRole: string
): Promise<ResourceCheck> {
  if (userRole === "ADMIN") return { ok: true }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { guestId: true, property: { select: { ownerId: true } } },
  })

  if (!booking) {
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  // Guest who made the booking OR the property owner
  if (booking.guestId === userId || booking.property.ownerId === userId) {
    return { ok: true }
  }

  return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

/**
 * Verify that a property belongs to the given user OR the caller is an ADMIN.
 */
export async function assertPropertyAccess(
  propertyId: string,
  userId: string,
  userRole: string
): Promise<ResourceCheck> {
  if (userRole === "ADMIN") return { ok: true }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  })

  if (!property) {
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  if (property.ownerId === userId) {
    return { ok: true }
  }

  return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

/**
 * Verify that a review belongs to the given user OR the caller is an ADMIN.
 */
export async function assertReviewAccess(
  reviewId: string,
  userId: string,
  userRole: string
): Promise<ResourceCheck> {
  if (userRole === "ADMIN") return { ok: true }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { guestId: true },
  })

  if (!review) {
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  }

  if (review.guestId === userId) {
    return { ok: true }
  }

  return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}

/**
 * Verify the caller is an ADMIN.
 */
export function assertAdmin(role: string): ResourceCheck {
  if (role === "ADMIN") return { ok: true }
  return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
}
