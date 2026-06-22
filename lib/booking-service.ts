import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { assertStayAvailable } from "@/lib/room-availability"
import { toUtcDay, nightsBetween } from "@/lib/booking-dates"
import { generateBookingCode } from "@/lib/booking-code"
import { Prisma as PrismaNS } from "@prisma/client"
import { expireStalePendingBookings } from "@/lib/booking-hold-expiry"

type Tx = Prisma.TransactionClient

export type CreateBookingInput = {
  guestId: string
  propertyId: string
  roomTypeId?: string | null
  checkIn: Date
  checkOut: Date
  guests: number
  units?: number
  notes?: string
  status?: "PENDING" | "CONFIRMED"
  holdExpiresAt?: Date | null
}

export type CreateBookingResult = {
  booking: PrismaNS.BookingGetPayload<{
    include: {
      property: { include: { owner: true } }
      guest: true
    }
  }>
  nights: number
  totalPrice: Prisma.Decimal
}

/**
 * Acquire a Postgres advisory lock scoped to (propertyId, roomTypeId) so that
 * two concurrent transactions targeting the same inventory bucket serialize.
 * The lock is automatically released when the transaction commits or rolls back.
 */
async function acquireInventoryLock(
  tx: Tx,
  propertyId: string,
  roomTypeId?: string | null
) {
  const key = `${propertyId}:${roomTypeId ?? "whole"}`
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

/**
 * Unified, transactional, lock-protected booking creation.
 *
 * Both the public API route and the admin manual-booking path should call this
 * helper to ensure:
 * 1. Availability check + insert happen atomically inside one transaction.
 * 2. A Postgres advisory lock prevents two concurrent requests from both
 *    passing the capacity check and double-booking the last unit.
 * 3. Pricing is computed server-side using Prisma.Decimal (no floating point).
 * 4. A single nights formula (`nightsBetween`) is used everywhere.
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  return prisma.$transaction(
    async (tx) => {
      // 1. Acquire advisory lock on the inventory bucket.
      await acquireInventoryLock(tx, input.propertyId, input.roomTypeId)
      await expireStalePendingBookings(new Date(), tx)

      // 2. Load authoritative price + capacity from DB.
      const property = await tx.property.findUnique({
        where: { id: input.propertyId },
        select: {
          pricePerNight: true,
          maxGuests: true,
          status: true,
          ownerId: true,
          totalUnits: true,
          roomTypes: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              pricePerNight: true,
              maxGuests: true,
              totalUnits: true,
            },
          },
        },
      })

      if (!property || property.status !== "ACTIVE") {
        throw new Error("Property not found")
      }

      // 3. Resolve room type.
      const roomType = input.roomTypeId
        ? property.roomTypes.find((rt) => rt.id === input.roomTypeId)
        : undefined

      if (input.roomTypeId && !roomType) {
        throw new Error("Selected room class is no longer available")
      }

      if (!input.roomTypeId && property.roomTypes.length > 0) {
        throw new Error("Please select a room class for this property")
      }

      // 4. Clamp units to capacity.
      const capacity = roomType ? roomType.totalUnits : property.totalUnits
      const units = Math.min(
        Math.max(1, input.units ?? 1),
        Math.max(1, capacity)
      )

      // 5. Enforce maxGuests.
      const maxGuests =
        (roomType ? roomType.maxGuests : property.maxGuests) * units
      if (input.guests > maxGuests) {
        throw new Error(
          `${roomType ? roomType.name : "This property"} allows up to ${maxGuests} guests for ${units} unit(s)`
        )
      }

      // 6. Normalize dates to UTC midnight.
      const checkInDay = toUtcDay(input.checkIn)
      const checkOutDay = toUtcDay(input.checkOut)

      // 7. Check availability inside the locked transaction.
      await assertStayAvailable(tx, {
        propertyId: input.propertyId,
        roomTypeId: input.roomTypeId,
        checkIn: checkInDay,
        checkOut: checkOutDay,
        units,
      })

      // 8. Compute price using Prisma.Decimal end-to-end (no JS float).
      const nights = Math.max(1, nightsBetween(checkInDay, checkOutDay))
      const pricePerNight = roomType
        ? roomType.pricePerNight
        : property.pricePerNight
      const totalPrice = new Prisma.Decimal(pricePerNight)
        .mul(nights)
        .mul(units)

      // 9. Generate booking code.
      const bookingCode = await generateBookingCode()

      // 10. Create the booking.
      const status = input.status ?? "PENDING"
      const now = new Date()

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          checkIn: checkInDay,
          checkOut: checkOutDay,
          guests: input.guests,
          units,
          notes: input.notes,
          totalPrice,
          guestId: input.guestId,
          propertyId: input.propertyId,
          roomTypeId: input.roomTypeId || null,
          status,
          ...(status === "CONFIRMED" && { confirmedAt: now }),
          ...(status === "PENDING" && {
            holdExpiresAt: input.holdExpiresAt ?? new Date(now.getTime() + 30 * 60 * 1000),
          }),
        },
        include: {
          property: { include: { owner: true } },
          guest: true,
        },
      })

      return { booking, nights, totalPrice }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15000,
    }
  )
}
