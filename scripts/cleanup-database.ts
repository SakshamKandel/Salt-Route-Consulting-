import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

dotenv.config({ path: '.env.local' })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function main() {
  const adminEmail = "admin@saltroutegroup.com"
  
  console.log(`Starting database cleanup. Keeping only: ${adminEmail}`)

  // 1. Find all users to delete
  const usersToDelete = await prisma.user.findMany({
    where: {
      NOT: { email: adminEmail }
    },
    include: {
      properties: {
        include: {
          images: true,
          reviews: { include: { images: true } }
        }
      },
      reviews: {
        include: { images: true }
      }
    }
  })

  console.log(`Found ${usersToDelete.length} users to remove.`)

  for (const user of usersToDelete) {
    console.log(`Processing user: ${user.email} (${user.role})`)

    // A. Cleanup property media if owner
    for (const property of user.properties) {
      console.log(`  Cleaning up property: ${property.title}`)
      
      // Property images/videos
      for (const media of property.images) {
        try {
          const resourceType = media.url.includes('/video/') ? 'video' : 'image'
          await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType })
          console.log(`    Deleted media: ${media.publicId}`)
        } catch (err) {
          console.error(`    Failed to delete media ${media.publicId}:`, err)
        }
      }

      // Review images on these properties
      for (const review of property.reviews) {
        for (const img of review.images) {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId)
              console.log(`    Deleted review image: ${img.publicId}`)
            } catch (err) {
              console.error(`    Failed to delete review image ${img.publicId}:`, err)
            }
          }
        }
      }
    }

    // B. Cleanup user's own reviews (if they were a guest)
    for (const review of user.reviews) {
      for (const img of review.images) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId)
            console.log(`  Deleted guest review image: ${img.publicId}`)
          } catch (err) {
            console.error(`  Failed to delete guest review image ${img.publicId}:`, err)
          }
        }
      }
    }

    // C. Delete the user
    try {
      await prisma.user.delete({ where: { id: user.id } })
      console.log(`  Successfully deleted user: ${user.email}`)
    } catch (err) {
      console.error(`  Failed to delete user ${user.email} from DB:`, err)
    }
  }

  console.log("Cleanup completed.")
}

main()
  .catch(e => console.error(e))
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
