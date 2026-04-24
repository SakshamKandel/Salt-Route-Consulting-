import { prisma } from "@/lib/db"
import { UsersTable } from "../users/UsersTable"

export default async function AdminOwnersPage() {
  const owners = await prisma.user.findMany({
    where: { role: "OWNER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { properties: true } }
    }
  })

  // Add the property count to the data
  const ownersWithCount = owners.map(owner => ({
    ...owner,
    propertiesCount: owner._count.properties
  }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Owners</h2>
        <p className="text-slate-500">Manage property owners and their assigned properties.</p>
      </div>

      <UsersTable users={ownersWithCount} />
    </div>
  )
}
