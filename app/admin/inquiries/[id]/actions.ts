"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email/transporter"
import { InquiryStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

export async function updateInquiryStatusAction(id: string, status: InquiryStatus) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.inquiry.update({
      where: { id },
      data: { status }
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "INQUIRY",
      entityId: id,
      details: { status },
      userId: session.user.id,
    })
    
    revalidatePath(`/admin/inquiries/${id}`)
    revalidatePath(`/admin/inquiries`)
    return { success: true }
  } catch (err: unknown) {
    console.error("[INQUIRY_STATUS]", err)
    return { error: "Failed to update inquiry." }
  }
}

export async function replyToInquiryAction(id: string, replyMessage: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id } })
    if (!inquiry) return { error: "Inquiry not found" }

    // Send the reply email
    await sendEmail({
      to: inquiry.email,
      subject: `Re: Your Inquiry to Salt Route Consulting`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a;">Response from Salt Route Consulting</h2>
          <p>Hi ${inquiry.name},</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #d4af37; padding: 16px; margin: 20px 0; white-space: pre-wrap;">
            ${replyMessage}
          </div>
          <p>Best regards,<br>The Salt Route Team</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px;">Original message:<br><em>${inquiry.message}</em></p>
        </div>
      `
    })

    // Automatically mark as responded after replying
    await prisma.inquiry.update({
      where: { id },
      data: {
        status: "RESPONDED",
        reply: replyMessage
      }
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "INQUIRY",
      entityId: id,
      details: { action: "replied", replyLength: replyMessage.length },
      userId: session.user.id,
    })

    revalidatePath(`/admin/inquiries/${id}`)
    revalidatePath(`/admin/inquiries`)
    return { success: true }
  } catch (err: unknown) {
    console.error("[INQUIRY_REPLY]", err)
    return { error: "Failed to send reply." }
  }
}
