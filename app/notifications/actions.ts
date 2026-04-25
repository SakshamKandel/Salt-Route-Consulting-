"use server"

import { auth } from "@/auth"
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications"
import { revalidatePath } from "next/cache"

export async function markAllCurrentUserNotificationsReadAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await markAllNotificationsRead(session.user.id)
  revalidatePath("/admin/notifications")
  revalidatePath("/owner/notifications")
  revalidatePath("/account/notifications")
  revalidatePath("/admin")
  revalidatePath("/owner")
  revalidatePath("/account")
  return { success: true }
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await markNotificationRead(session.user.id, notificationId)
  revalidatePath("/admin/notifications")
  revalidatePath("/owner/notifications")
  revalidatePath("/account/notifications")
  return { success: true }
}
