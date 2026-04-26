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
  const user = await prisma.user.findUnique({
    where: { email: "sakshamkandelpersonal@gmail.com" },
    include: { properties: true }
  })
  
  if (!user) {
    console.log("USER_NOT_FOUND")
    const allUsers = await prisma.user.findMany({ take: 5 })
    console.log("Sample users in DB:", allUsers.map(u => u.email))
    return
  }

  console.log("User Email:", user.email)
  console.log("User Role:", user.role)
  console.log("Property Count:", user.properties.length)
  
  if (user.properties.length > 0) {
    console.log("Properties:", user.properties.map(p => p.title))
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
