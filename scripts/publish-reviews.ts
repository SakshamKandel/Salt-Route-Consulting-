import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Publishing all pending reviews...')
  const result = await prisma.review.updateMany({
    where: { status: 'PENDING' },
    data: { 
      status: 'PUBLISHED',
      isApproved: true
    }
  })
  console.log(`Success: Updated ${result.count} reviews.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
