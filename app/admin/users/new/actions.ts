"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { z } from "zod"
import { Role } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { revalidatePath } from "next/cache"

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["GUEST", "OWNER", "ADMIN"]),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export async function createUserAction(data: CreateUserInput) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const validated = createUserSchema.parse(data)
    const email = validated.email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "A user with that email already exists." }
    }

    const hashedPassword = await hash(validated.password, 12)

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email,
        phone: validated.phone || null,
        hashedPassword,
        role: validated.role as Role,
        emailVerified: new Date(),
      },
    })

    await createAuditLog({
      action: "CREATE",
      entity: "USER",
      entityId: user.id,
      details: { email: user.email, role: user.role, createdByAdmin: true },
      userId: session.user.id,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/owners")
    return { success: true, id: user.id, role: user.role }
  } catch (error) {
    console.error("[CREATE_USER]", error)
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      return { error: `${first?.path?.join(".") || "Field"}: ${first?.message || "invalid"}` }
    }
    return { error: error instanceof Error ? error.message : "Failed to create user." }
  }
}
