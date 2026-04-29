"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { PropertyStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function bulkUpdatePropertyStatusAction(
  ids: string[],
  status: PropertyStatus
) {
  const session = await requireAdmin()
  try {
    await prisma.property.updateMany({
      where: { id: { in: ids } },
      data: { status },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "PROPERTY",
      userId: session.user.id,
      details: { action: "BULK_STATUS_UPDATE", status, ids, count: ids.length },
    })
    revalidatePath("/admin/properties")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to update property statuses." }
  }
}
