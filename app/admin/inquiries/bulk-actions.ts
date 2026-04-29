"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { InquiryStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function bulkUpdateInquiryStatusAction(ids: string[], status: InquiryStatus) {
  const session = await requireAdmin()
  try {
    await prisma.inquiry.updateMany({
      where: { id: { in: ids } },
      data: { status },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "INQUIRY",
      userId: session.user.id,
      details: { action: "BULK_STATUS_UPDATE", status, ids, count: ids.length },
    })
    revalidatePath("/admin/inquiries")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to update inquiry statuses." }
  }
}
