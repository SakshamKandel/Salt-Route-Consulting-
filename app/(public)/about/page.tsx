import { prisma } from "@/lib/db"
import AboutPageClient from "./AboutPageClient"

// Marketing page with rarely-changing DB data — cache via ISR (refresh hourly).
export const revalidate = 3600

export default async function AboutPage() {
  const propertyCount = await prisma.property.count({ where: { status: "ACTIVE" } })

  return <AboutPageClient propertyCount={propertyCount} />
}

