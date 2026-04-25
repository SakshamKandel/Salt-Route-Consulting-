"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email/transporter"
import { InquiryStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { notifyAdmins, notifyUser } from "@/lib/notifications"

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
    return { error: "Failed to update inquiry status." }
  }
}

export async function replyToInquiryAction(id: string, replyMessage: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id } })
    if (!inquiry) return { error: "Inquiry not found" }

    const now = new Date()
    await prisma.inquiry.update({
      where: { id },
      data: {
        status: "RESPONDED",
        reply: replyMessage,
        lastMessageAt: now,
        lastMessageBy: "ADMIN",
        adminLastReadAt: now,
        messages: {
          create: {
            sender: "ADMIN",
            body: replyMessage,
            authorId: session.user.id,
          },
        },
      }
    })

    const recipient = await prisma.user.findUnique({
      where: { email: inquiry.email },
      select: { id: true },
    })

    if (inquiry.ownerId) {
      await notifyUser(inquiry.ownerId, {
        type: "INQUIRY",
        title: "Admin replied to your request",
        body: inquiry.subject,
        href: `/owner/messages?inquiry=${inquiry.id}`,
        metadata: { inquiryId: inquiry.id },
      })
    } else if (recipient) {
      await notifyUser(recipient.id, {
        type: "INQUIRY",
        title: "Salt Route replied",
        body: inquiry.subject,
        href: `/account/messages?inquiry=${inquiry.id}`,
        metadata: { inquiryId: inquiry.id },
      })
    }

    // 2. Send Email (Fire and forget)
    sendEmail({
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
    }).catch(e => console.error("[EMAIL_FAIL] Admin reply email failed:", e))

    await createAuditLog({
      action: "UPDATE",
      entity: "INQUIRY",
      entityId: id,
      details: { action: "admin_replied" },
      userId: session.user.id,
    })

    revalidatePath(`/admin/inquiries/${id}`)
    revalidatePath(`/admin/inquiries`)
    revalidatePath(`/account/messages`)
    revalidatePath(`/owner/messages`)
    return { success: true }
  } catch (err: unknown) {
    console.error("[INQUIRY_REPLY_ERROR]", err)
    // Return specific error message if possible
    if (err instanceof Error) {
       return { error: `Database Error: ${err.message}` }
    }
    return { error: "Failed to save reply to database." }
  }
}

export async function guestReplyAction(id: string, message: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const inquiry = await prisma.inquiry.findUnique({ 
      where: { id },
      select: { email: true, ownerId: true, subject: true }
    })
    
    if (!inquiry || (inquiry.email !== session.user.email && inquiry.ownerId !== session.user.id)) {
      return { error: "Message not found or unauthorized." }
    }

    const sender = inquiry.ownerId === session.user.id ? "OWNER" : "GUEST"
    const now = new Date()

    await prisma.inquiry.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        lastMessageAt: now,
        lastMessageBy: sender,
        ...(sender === "OWNER" ? { ownerLastReadAt: now } : { guestLastReadAt: now }),
        messages: {
          create: {
            sender,
            body: message,
            authorId: session.user.id,
          },
        },
      }
    })

    await notifyAdmins({
      type: "INQUIRY",
      title: sender === "OWNER" ? "Owner replied" : "Guest replied",
      body: inquiry.subject,
      href: `/admin/inquiries/${id}`,
      metadata: { inquiryId: id },
    })

    revalidatePath(`/account/messages`)
    revalidatePath(`/owner/messages`)
    revalidatePath(`/admin/inquiries/${id}`)
    return { success: true }
  } catch (err) {
    console.error("[GUEST_REPLY_ERROR]", err)
    if (err instanceof Error) {
      return { error: `Database Error: ${err.message}` }
    }
    return { error: "Failed to send reply." }
  }
}

export async function markInquiryReadAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const now = new Date()
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { email: true, ownerId: true },
  })
  if (!inquiry) return { error: "Inquiry not found." }

  if (session.user.role === "ADMIN") {
    await prisma.inquiry.update({ where: { id }, data: { adminLastReadAt: now } })
    revalidatePath(`/admin/inquiries/${id}`)
    revalidatePath(`/admin/inquiries`)
    return { success: true }
  }

  if (inquiry.ownerId === session.user.id) {
    await prisma.inquiry.update({ where: { id }, data: { ownerLastReadAt: now } })
    revalidatePath(`/owner/messages`)
    return { success: true }
  }

  if (inquiry.email === session.user.email) {
    await prisma.inquiry.update({ where: { id }, data: { guestLastReadAt: now } })
    revalidatePath(`/account/messages`)
    return { success: true }
  }

  return { error: "Unauthorized" }
}
