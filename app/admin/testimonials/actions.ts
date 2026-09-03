"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const testimonialSchema = z.object({
  quote: z.string().trim().min(10, "Quote must be at least 10 characters").max(1200),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(160).optional(),
  source: z.string().trim().max(160).optional(),
  kind: z.enum(["DIPLOMATIC", "VERIFIED"]),
  rating: z.number().int().min(1).max(5),
  location: z.string().trim().max(160).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().min(0).max(999).default(0),
})

export type TestimonialInput = z.input<typeof testimonialSchema>

function assertAdmin() {
  return auth().then((session) => {
    if (!session?.user || session.user.role !== "ADMIN") return null
    return session
  })
}

export async function upsertTestimonialAction(
  data: TestimonialInput,
  id?: string,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const session = await assertAdmin()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    const validated = testimonialSchema.parse(data)
    const payload = {
      quote: validated.quote,
      name: validated.name,
      role: validated.role?.trim() || null,
      source: validated.source?.trim() || null,
      kind: validated.kind,
      rating: validated.rating,
      location: validated.location?.trim() || null,
      featured: validated.featured,
      published: validated.published,
      order: validated.order,
    }

    const saved = id
      ? await prisma.testimonial.update({ where: { id }, data: payload, select: { id: true } })
      : await prisma.testimonial.create({ data: payload, select: { id: true } })

    revalidatePath("/admin/testimonials")
    revalidatePath("/")
    revalidatePath("/for-owners")

    return { success: true, id: saved.id }
  } catch (error) {
    console.error("[TESTIMONIAL_UPSERT]", error)
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      return { success: false, error: `${first?.path?.join(".") || "Field"}: ${first?.message}` }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to save." }
  }
}

export async function deleteTestimonialAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await assertAdmin()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await prisma.testimonial.delete({ where: { id } })
    revalidatePath("/admin/testimonials")
    revalidatePath("/")
    revalidatePath("/for-owners")
    return { success: true }
  } catch (error) {
    console.error("[TESTIMONIAL_DELETE]", error)
    return { success: false, error: "Failed to delete." }
  }
}

/** Quick toggle used by the list rows (show/hide without opening the editor). */
export async function toggleTestimonialPublishedAction(
  id: string,
): Promise<{ success: true; published: boolean } | { success: false; error: string }> {
  const session = await assertAdmin()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    const current = await prisma.testimonial.findUnique({
      where: { id },
      select: { published: true },
    })
    if (!current) return { success: false, error: "Not found" }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { published: !current.published },
      select: { published: true },
    })

    revalidatePath("/admin/testimonials")
    revalidatePath("/")
    revalidatePath("/for-owners")

    return { success: true, published: updated.published }
  } catch (error) {
    console.error("[TESTIMONIAL_TOGGLE]", error)
    return { success: false, error: "Failed to update." }
  }
}
