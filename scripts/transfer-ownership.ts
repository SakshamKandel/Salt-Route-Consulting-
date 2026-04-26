import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  const targetEmail = "sakshamkandelpersonal@gmail.com"
  const currentOwnerEmail = "officialsakshamkandel@gmail.com"

  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail }
  })

  if (!targetUser) {
    console.log(`ERROR: Target user ${targetEmail} not found.`)
    return
  }

  // Find properties currently assigned to the official email
  const properties = await prisma.property.findMany({
    where: { owner: { email: currentOwnerEmail } }
  })

  if (properties.length === 0) {
    console.log(`No properties found for ${currentOwnerEmail}.`)
    return
  }

  console.log(`Found ${properties.length} properties for ${currentOwnerEmail}. Transferring to ${targetEmail}...`)

  for (const p of properties) {
    await prisma.property.update({
      where: { id: p.id },
      data: { ownerId: targetUser.id }
    })
    console.log(`- Transferred: ${p.title}`)
  }

  console.log("Ownership transfer complete.")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
