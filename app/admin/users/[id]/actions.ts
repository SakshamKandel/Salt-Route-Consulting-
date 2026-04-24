"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { UserStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function toggleUserStatusAction(userId: string, newStatus: UserStatus) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }
  if (userId === session.user.id) {
    return { error: "You cannot suspend your own account." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    })

    await createAuditLog({
      action: newStatus === "SUSPENDED" ? "UPDATE" : "UPDATE",
      entity: "USER",
      entityId: userId,
      userId: session.user.id,
      details: { action: newStatus === "SUSPENDED" ? "SUSPENDED" : "RESTORED", newStatus },
    })

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    console.error("[TOGGLE_USER_STATUS]", err)
    return { error: "Failed to update user status." }
  }
}
