import { prisma } from '../lib/db'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      status: true
    }
  })
  
  console.log("Remaining Users:")
  console.table(users)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
