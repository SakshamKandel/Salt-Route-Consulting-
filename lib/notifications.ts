import { prisma } from "@/lib/db"
import type { NotificationType, Prisma, Role } from "@prisma/client"

type NotificationInput = {
  type: NotificationType
  title: string
  body: string
  href?: string | null
  metadata?: Prisma.InputJsonValue
}

export async function notifyUser(userId: string | null | undefined, input: NotificationInput) {
  if (!userId) return

  await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadata: input.metadata ?? undefined,
    },
  })
}

export async function notifyUsers(userIds: string[], input: NotificationInput) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)))
  if (uniqueUserIds.length === 0) return

  await prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadata: input.metadata ?? undefined,
    })),
  })
}

export async function notifyRole(role: Role, input: NotificationInput) {
  const users = await prisma.user.findMany({
    where: { role, status: "ACTIVE" },
    select: { id: true },
  })

  await notifyUsers(users.map((user) => user.id), input)
}

export async function notifyAdmins(input: NotificationInput) {
  await notifyRole("ADMIN", input)
}

export async function getAdminEmails() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { email: true },
  })
  return admins.map((a) => a.email)
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  })
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  })
}
