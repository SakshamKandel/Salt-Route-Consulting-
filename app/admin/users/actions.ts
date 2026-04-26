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
      action: "UPDATE",
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

export async function deleteUserAction(userId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  // CRITICAL: Only the master admin can delete users
  if (session.user.email !== "admin@saltroutegroup.com") {
    return { error: "Permission Denied: Only the master administrator can permanently delete user records." }
  }

  if (userId === session.user.id) {
    return { error: "You cannot delete your own account." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        properties: {
          include: {
            images: true,
            reviews: { include: { images: true } }
          }
        }
      }
    })

    if (!user) return { error: "User not found" }

    // 1. If owner, cleanup all their properties' media from Cloudinary
    for (const property of user.properties) {
      // Cleanup property images
      if (property.images.length > 0) {
        await Promise.all(
          property.images.map(async (media) => {
            try {
              const { cloudinary } = await import("@/lib/cloudinary")
              const { getCloudinaryResourceType } = await import("@/lib/property-media")
              await cloudinary.uploader.destroy(media.publicId, {
                resource_type: getCloudinaryResourceType(media.url),
              })
            } catch (error) {
              console.error("[USER_DELETE_PROPERTY_MEDIA_CLEANUP]", error)
            }
          })
        )
      }

      // Cleanup review images associated with these properties
      const reviewImagePublicIds = property.reviews
        .flatMap(r => r.images)
        .map(img => img.publicId)
        .filter((pid): pid is string => !!pid)

      if (reviewImagePublicIds.length > 0) {
        await Promise.all(
          reviewImagePublicIds.map(async (pid) => {
            try {
              const { cloudinary } = await import("@/lib/cloudinary")
              await cloudinary.uploader.destroy(pid)
            } catch (err) {
              console.error("[USER_DELETE_REVIEW_IMAGE_CLEANUP]", err)
            }
          })
        )
      }
    }

    // 2. Delete the user
    await prisma.user.delete({ where: { id: userId } })

    await createAuditLog({
      action: "DELETE",
      entity: "USER",
      entityId: userId,
      userId: session.user.id,
      details: { email: user.email, name: user.name, role: user.role },
    })

    revalidatePath("/admin/users")
    return { success: true, redirect: "/admin/users" }
  } catch (err) {
    console.error("[DELETE_USER]", err)
    return { error: "Failed to delete user. Ensure they have no active dependencies." }
  }
}
