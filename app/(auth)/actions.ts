"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { AuthError } from "next-auth"
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from "@/lib/validations"
import { createAuditLog } from "@/lib/audit"
import { transporter, mailOptions } from "@/lib/email/transporter"
import { render } from "@react-email/render"
import { VerifyEmail } from "@/emails/VerifyEmail"
import { ResetPassword } from "@/emails/ResetPassword"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered } from "@/lib/security/honeypot"
import { isPasswordPwned } from "@/lib/security/pwned"
import crypto from "crypto"
import { headers } from "next/headers"

// ─── Helper to get IP for server actions ────────────────────
async function getIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown"
}

// ─── LOGIN ──────────────────────────────────────────────────
export async function loginAction(data: LoginInput) {
  try {
    const validated = loginSchema.parse(data)
    const ip = await getIp()

    // 10.3 — Rate limit: 15 login attempts / 15 min / IP
    const rl = await rateLimit({ identifier: `login:${ip}`, limit: 15, window: 900 })
    if (!rl.success) {
      return { error: "Too many login attempts. Please wait 15 minutes." }
    }

    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          // 10.9 — Generic error, don't reveal whether email exists
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    return { error: "An unexpected error occurred." }
  }
}

// ─── SIGNUP ─────────────────────────────────────────────────
export async function signupAction(data: SignupInput & { website?: string }) {
  try {
    // 10.4 — Honeypot
    if (isHoneypotTriggered(data as unknown as Record<string, unknown>)) {
      // Fake success so the bot thinks it worked
      return { success: "Account created! Please check your email to verify." }
    }

    const validated = signupSchema.parse(data)
    const ip = await getIp()

    // 10.3 — Rate limit: 15 signups / hr / IP
    const rl = await rateLimit({ identifier: `signup:${ip}`, limit: 15, window: 3600 })
    if (!rl.success) {
      return { error: "Too many signup attempts. Please try again later." }
    }

    // 10.7 — Pwned password check
    const pwned = await isPasswordPwned(validated.password)
    if (pwned) {
      return { error: "This password has appeared in a data breach. Please choose a different password." }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    })

    if (existingUser) {
      // 10.9 — Don't reveal whether the email exists
      return { error: "Unable to create account. Please try a different email." }
    }

    const hashedPassword = await hash(validated.password, 12)

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        hashedPassword,
      },
    })

    const token = crypto.randomBytes(32).toString("hex")

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`

    // Fire and forget
    transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: "Verify your email - Salt Route",
      html: await render(VerifyEmail({ name: user.name || "User", url: verifyUrl })),
    }).catch(console.error)

    // 10.8 — Audit log
    await createAuditLog({
      action: "CREATE",
      entity: "USER",
      entityId: user.id,
      ipAddress: ip,
    })

    return { success: "Account created! Please check your email to verify." }
  } catch (error) {
    // 10.9 — Generic error
    console.error("[SIGNUP]", error)
    return { error: "Failed to create account." }
  }
}

// ─── FORGOT PASSWORD ────────────────────────────────────────
export async function forgotPasswordAction(data: ForgotPasswordInput) {
  try {
    const validated = forgotPasswordSchema.parse(data)
    const ip = await getIp()

    // 10.3 — Rate limit: 3 forgot-pw / hr / IP
    const rl = await rateLimit({ identifier: `forgot-pw:${ip}`, limit: 3, window: 3600 })
    if (!rl.success) {
      return { error: "Too many requests. Please try again later." }
    }

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    })

    if (user) {
      const token = crypto.randomBytes(32).toString("hex")

      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token,
          expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        },
      })

      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

      transporter.sendMail({
        ...mailOptions,
        to: user.email,
        subject: "Reset your password - Salt Route",
        html: await render(ResetPassword({ name: user.name || "User", url: resetUrl })),
      }).catch(console.error)
    }

    // Always return the same message to prevent email enumeration
    return { success: "If an account exists, a reset link has been sent." }
  } catch (error) {
    console.error("[FORGOT-PW]", error)
    return { error: "Failed to process request." }
  }
}

// ─── RESET PASSWORD ─────────────────────────────────────────
export async function resetPasswordAction(data: ResetPasswordInput, email: string) {
  try {
    const validated = resetPasswordSchema.parse(data)

    // 10.7 — Pwned password check on reset too
    const pwned = await isPasswordPwned(validated.password)
    if (pwned) {
      return { error: "This password has appeared in a data breach. Please choose a different password." }
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: validated.token,
        expires: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      return { error: "Invalid or expired token." }
    }

    const hashedPassword = await hash(validated.password, 12)

    const user = await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    })

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: validated.token,
        },
      },
    })

    await createAuditLog({
      action: "PASSWORD_CHANGE",
      entity: "USER",
      entityId: user.id,
    })

    return { success: "Password successfully reset. You can now login." }
  } catch (error) {
    console.error("[RESET-PW]", error)
    return { error: "Failed to reset password." }
  }
}
