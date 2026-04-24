"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email/transporter"
import { InvitationEmail } from "@/emails/InvitationEmail"
import { render } from "@react-email/render"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"
import { Role } from "@prisma/client"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["OWNER", "ADMIN"]),
})

export async function sendInvitationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const validated = inviteSchema.parse({
      email: formData.get("email"),
      role: formData.get("role"),
    })

    const existing = await prisma.invitation.findFirst({
      where: { email: validated.email, status: "PENDING" },
    })
    if (existing && new Date() < new Date(existing.expiresAt)) {
      return { error: "An active invitation already exists for this email." }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitation.create({
      data: {
        email: validated.email,
        role: validated.role as Role,
        token,
        expiresAt,
        invitedById: session.user.id,
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const acceptUrl = `${appUrl}/invite/accept?token=${token}`

    await sendEmail({
      to: validated.email,
      subject: `You're invited to join Salt Route as ${validated.role}`,
      html: await render(
        InvitationEmail({
          role: validated.role,
          url: acceptUrl,
          invitedBy: session.user.name || "The Salt Route team",
        })
      ),
    })

    await createAuditLog({
      action: "INVITATION_SEND",
      entity: "INVITATION",
      entityId: invitation.id,
      userId: session.user.id,
      details: { email: validated.email, role: validated.role },
    })

    revalidatePath("/admin/invitations")
    return { success: `Invitation sent to ${validated.email}` }
  } catch (err) {
    console.error("[SEND_INVITATION]", err)
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message ?? "Invalid input." }
    }
    return { error: "Failed to send invitation." }
  }
}
