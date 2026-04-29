"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { UserStatus, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function bulkSuspendUsersAction(ids: string[]) {
  const session = await requireAdmin()
  if (ids.includes(session.user.id)) {
    return { error: "Cannot suspend your own account." }
  }
  try {
    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { status: UserStatus.SUSPENDED },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "USER",
      userId: session.user.id,
      details: { action: "BULK_SUSPEND", ids, count: ids.length },
    })
    revalidatePath("/admin/users")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to suspend users." }
  }
}

export async function bulkRestoreUsersAction(ids: string[]) {
  const session = await requireAdmin()
  try {
    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { status: UserStatus.ACTIVE },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "USER",
      userId: session.user.id,
      details: { action: "BULK_RESTORE", ids, count: ids.length },
    })
    revalidatePath("/admin/users")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to restore users." }
  }
}

export async function bulkDeleteUsersAction(ids: string[]) {
  const session = await requireAdmin()
  if (session.user.email !== "admin@saltroutegroup.com") {
    return { error: "Permission Denied: Only the master administrator can bulk-delete users." }
  }
  if (ids.includes(session.user.id)) {
    return { error: "Cannot delete your own account." }
  }
  try {
    const emails = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true, role: true },
    })
    await prisma.user.deleteMany({ where: { id: { in: ids } } })
    await createAuditLog({
      action: "BULK_DELETE",
      entity: "USER",
      userId: session.user.id,
      details: { users: emails, count: ids.length },
    })
    revalidatePath("/admin/users")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to delete users." }
  }
}
