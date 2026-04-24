"use server"

import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

const acceptInviteSchema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function acceptInviteAction(data: z.infer<typeof acceptInviteSchema>) {
  try {
    const parsed = acceptInviteSchema.safeParse(data)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input." }
    }
    const validated = parsed.data
    
    const invitation = await prisma.invitation.findUnique({
      where: { token: validated.token }
    })

    if (!invitation || invitation.status !== "PENDING" || new Date() > invitation.expiresAt) {
      return { error: "Invalid or expired invitation." }
    }

    const hashedPassword = await hash(validated.password, 12)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email.toLowerCase() }
    })

    if (existingUser) {
      // Update role
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: invitation.role, emailVerified: new Date() }
      })
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          name: validated.name,
          email: invitation.email.toLowerCase(),
          hashedPassword,
          role: invitation.role,
          emailVerified: new Date(),
        }
      })
    }

    // Mark invitation used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" }
    })

    await createAuditLog({
      action: "INVITATION_ACCEPT",
      entity: "USER",
      details: { email: invitation.email, role: invitation.role }
    })

    return { success: "Account created successfully. You can now log in." }
  } catch {
    return { error: "Failed to accept invitation." }
  }
}
