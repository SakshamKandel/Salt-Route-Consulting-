"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  current: z.string().min(1, "Current password is required"),
  next: z.string().min(8, "New password must be at least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.next === d.confirm, { message: "Passwords do not match", path: ["confirm"] })

export async function changeOwnerPasswordAction(data: { current: string; next: string; confirm: string }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "OWNER") return { error: "Unauthorized" }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { hashedPassword: true } })
  if (!user?.hashedPassword) return { error: "No password is set for this account." }

  const match = await bcrypt.compare(parsed.data.current, user.hashedPassword)
  if (!match) return { error: "Current password is incorrect." }

  const hashed = await bcrypt.hash(parsed.data.next, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { hashedPassword: hashed } })

  await createAuditLog({
    action: "PASSWORD_CHANGE",
    entity: "USER",
    entityId: session.user.id,
    userId: session.user.id,
  })

  return { success: "Password updated successfully." }
}
