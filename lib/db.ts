import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: pg.Pool }

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
