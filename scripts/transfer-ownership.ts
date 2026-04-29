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
  const [fromEmail, toEmail] = process.argv.slice(2)

  if (!fromEmail || !toEmail) {
    console.error("Usage: bun scripts/transfer-ownership.ts <from-email> <to-email>")
    process.exit(1)
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: toEmail }
  })

  if (!targetUser) {
    console.log(`ERROR: Target user ${toEmail} not found.`)
    return
  }

  const properties = await prisma.property.findMany({
    where: { owner: { email: fromEmail } }
  })

  if (properties.length === 0) {
    console.log(`No properties found for ${fromEmail}.`)
    return
  }

  console.log(`Found ${properties.length} properties for ${fromEmail}. Transferring to ${toEmail}...`)

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
