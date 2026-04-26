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
  const properties = await prisma.property.findMany({
    include: { owner: true }
  })
  
  console.log("Total Properties:", properties.length)
  properties.forEach(p => {
    console.log(`- ${p.title} (ID: ${p.id})`)
    console.log(`  Owner: ${p.owner?.email || 'NONE'}`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
