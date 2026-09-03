"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

const listItem = z.string().trim().min(1).max(160)

const mediaItem = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().max(240).optional().nullable(),
})

const ownerPropertySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and dashes")
    .optional(),
  propertyType: z.string().trim().min(2).max(60).default("Hotel"),
  description: z.string().trim().min(20, "Please write at least 20 characters").max(4000),
  tagline: z.string().trim().max(200).optional(),
  location: z.string().trim().min(3, "Location is required").max(160),
  address: z.string().trim().max(240).optional(),
  bedrooms: z.number().int().min(0).max(100),
  bathrooms: z.number().int().min(0).max(100),
  maxGuests: z.number().int().min(1).max(200),
  pricePerNight: z.number().min(0),
  hidePrice: z.boolean().optional().default(false),
  checkInTime: z.string().trim().max(40).optional(),
  checkOutTime: z.string().trim().max(40).optional(),
  highlights: z.array(listItem).max(40).default([]),
  amenities: z.array(listItem).max(80).default([]),
  media: z.array(mediaItem).max(30).default([]),
})

export type OwnerPropertyInput = z.input<typeof ownerPropertySchema>

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function uniqueList(items: string[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Generates a slug that is guaranteed not to collide with an existing property. */
async function buildUniqueSlug(base: string) {
  const root = base || "property"
  let candidate = root
  let suffix = 2

  // Bounded: after 200 attempts something is very wrong, so give up gracefully.
  while (suffix < 200) {
    const exists = await prisma.property.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!exists) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
  return `${root}-${Date.now()}`
}

/**
 * Lets an OWNER submit a new property for review.
 *
 * Owners always create a DRAFT — they cannot publish directly. Admins keep full
 * control of `status` in the admin console. This is the flow that was missing:
 * previously the only path to a new property was the admin-only
 * `upsertPropertyAction`, so the owner portal had no way to add anything.
 */
export async function createOwnerPropertyAction(
  data: OwnerPropertyInput,
): Promise<{ success: true; id: string; slug: string } | { success: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "You must be signed in." }

  if (!["OWNER", "ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Only property owners can submit a property." }
  }

  try {
    const validated = ownerPropertySchema.parse(data)
    const { media, highlights, amenities, slug, ...rest } = validated

    const finalSlug = await buildUniqueSlug(slug?.trim() || slugify(validated.title))

    const firstImageIndex = media.findIndex((item) => !item.url.includes("/video/upload/"))

    const property = await prisma.property.create({
      data: {
        ...rest,
        slug: finalSlug,
        status: "DRAFT",
        ownerId: session.user.id,
        tagline: rest.tagline?.trim() || null,
        address: rest.address?.trim() || null,
        checkInTime: rest.checkInTime?.trim() || null,
        checkOutTime: rest.checkOutTime?.trim() || null,
        highlights: uniqueList(highlights),
        amenities: uniqueList(amenities),
        ...(media.length > 0
          ? {
              images: {
                create: media.map((item, index) => ({
                  url: item.url,
                  publicId: item.publicId,
                  alt: item.alt ?? null,
                  order: index,
                  isPrimary: !item.url.includes("/video/upload/") && index === firstImageIndex,
                })),
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    })

    await createAuditLog({
      action: "CREATE",
      entity: "PROPERTY",
      entityId: property.id,
      details: { title: validated.title, status: "DRAFT", source: "OWNER_PORTAL" },
      userId: session.user.id,
    })

    revalidatePath("/owner/properties")
    revalidatePath("/owner/dashboard")

    return { success: true, id: property.id, slug: property.slug }
  } catch (error) {
    console.error("[OWNER_PROPERTY_CREATE]", error)
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      return { success: false, error: `${first?.path?.join(".") || "Field"}: ${first?.message}` }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A property with that slug already exists. Try another title." }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit property." }
  }
}
