"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { generateTOTPSecret, keyuri, verifyTOTP } from "@/lib/totp"
import QRCode from "qrcode"
import { createAuditLog } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function setup2FAAction() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const secret = generateTOTPSecret()
    const uri = keyuri(session.user.email!, "Salt Route", secret)
    const qrDataUrl = await QRCode.toDataURL(uri)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    })

    return { secret, qrDataUrl }
  } catch (err) {
    console.error("[2FA_SETUP]", err)
    return { error: "Failed to generate 2FA secret." }
  }
}

export async function verify2FAAction(code: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    })

    if (!user?.twoFactorSecret) {
      return { error: "No 2FA secret found. Please start setup again." }
    }

    const isValid = verifyTOTP(code.trim(), user.twoFactorSecret)

    if (!isValid) {
      return { error: "Invalid code. Please check your authenticator app and try again." }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "USER",
      entityId: session.user.id,
      userId: session.user.id,
      details: { action: "2FA_ENABLED" },
    })

    revalidatePath("/admin/profile/2fa")
    revalidatePath("/admin/profile")
    return { success: "Two-factor authentication is now enabled." }
  } catch (err) {
    console.error("[2FA_VERIFY]", err)
    return { error: "Failed to verify code." }
  }
}

export async function disable2FAAction() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "USER",
      entityId: session.user.id,
      userId: session.user.id,
      details: { action: "2FA_DISABLED" },
    })

    revalidatePath("/admin/profile/2fa")
    revalidatePath("/admin/profile")
    return { success: "Two-factor authentication has been disabled." }
  } catch (err) {
    console.error("[2FA_DISABLE]", err)
    return { error: "Failed to disable 2FA." }
  }
}
