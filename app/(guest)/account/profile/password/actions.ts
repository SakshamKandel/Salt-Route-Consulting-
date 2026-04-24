"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hash, compare } from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function changePasswordAction(data: z.infer<typeof changePasswordSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const validated = changePasswordSchema.parse(data)
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.hashedPassword) {
      return { error: "No password set for this account." }
    }

    const isValid = await compare(validated.currentPassword, user.hashedPassword)
    
    if (!isValid) {
      return { error: "Incorrect current password." }
    }

    const newHashedPassword = await hash(validated.newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: newHashedPassword }
    })

    return { success: "Password successfully updated." }
  } catch {
    return { error: "Failed to update password." }
  }
}
