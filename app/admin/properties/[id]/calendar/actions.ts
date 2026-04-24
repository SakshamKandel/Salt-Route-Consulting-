"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function addBlockedDatesAction(propertyId: string, from: string, to: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    z.string().date().parse(from)
    z.string().date().parse(to)

    const start = new Date(from)
    const end = new Date(to)
    if (start > end) return { error: "Start date must be before end date." }

    const dates: Date[] = []
    const cur = new Date(start)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }

    await prisma.blockedDate.createMany({
      data: dates.map((date) => ({ propertyId, date })),
      skipDuplicates: true,
    })

    revalidatePath(`/admin/properties/${propertyId}/calendar`)
    revalidatePath(`/api/properties/${propertyId}/availability`)
    return { success: `${dates.length} date(s) blocked.` }
  } catch (err) {
    console.error("[BLOCK_DATES]", err)
    return { error: "Failed to block dates." }
  }
}

export async function removeBlockedDateAction(blockedDateId: string, propertyId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.blockedDate.delete({ where: { id: blockedDateId } })
    revalidatePath(`/admin/properties/${propertyId}/calendar`)
    revalidatePath(`/api/properties/${propertyId}/availability`)
    return { success: true }
  } catch (err) {
    console.error("[REMOVE_BLOCKED_DATE]", err)
    return { error: "Failed to remove blocked date." }
  }
}
