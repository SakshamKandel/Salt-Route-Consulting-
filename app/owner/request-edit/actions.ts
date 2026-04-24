"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function submitOwnerRequestAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const propertyId = formData.get("propertyId") as string
  const requestType = formData.get("requestType") as string
  const message = formData.get("message") as string

  if (!propertyId || !requestType || !message) {
    return { error: "All fields are required" }
  }

  // Verify ownership
  const property = await prisma.property.findUnique({
    where: { id: propertyId, ownerId: session.user.id }
  })

  if (!property) return { error: "Property not found or unauthorized" }

  try {
    // Create an inquiry clearly marked as an OWNER edit request
    await prisma.inquiry.create({
      data: {
        name: `${session.user.name || "Owner"} (OWNER REQUEST: ${requestType})`,
        email: session.user.email!,
        phone: null,
        subject: `Owner Edit Request: ${requestType} for ${property.title}`,
        message: `Property: ${property.title} (ID: ${property.id})\n\nRequest Type: ${requestType}\n\n${message}`,
        status: "NEW"
      }
    })

    return { success: true }
  } catch (err: unknown) {
    console.error("[OWNER_REQUEST]", err)
    return { error: "Failed to submit request." }
  }
}
