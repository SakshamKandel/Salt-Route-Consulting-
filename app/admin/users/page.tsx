import { prisma } from "@/lib/db"
import { UsersTable } from "./UsersTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Role } from "@prisma/client"
import { Plus } from "lucide-react"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const roleParam = typeof resolvedParams.role === "string" ? resolvedParams.role : "ALL"
  const roleFilter = Object.values(Role).includes(roleParam as Role) ? (roleParam as Role) : "ALL"

  const users = await prisma.user.findMany({
    where: {
      role: roleFilter !== "ALL" ? roleFilter : undefined
    },
    orderBy: { createdAt: "desc" }
  })

  const tabs = [
    { label: "All Users", value: "ALL" },
    { label: "Guests", value: "GUEST" },
    { label: "Owners", value: "OWNER" },
    { label: "Admins", value: "ADMIN" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-display text-navy">Users</h2>
          <p className="text-slate-500">Manage all accounts registered on the platform.</p>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href={`/admin/users/new${roleFilter !== "ALL" ? `?role=${roleFilter}` : ""}`}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            asChild
            variant={roleFilter === tab.value ? "default" : "outline"}
            className={roleFilter === tab.value ? "bg-navy" : "text-navy"}
          >
            <Link href={`/admin/users?role=${tab.value}`}>{tab.label}</Link>
          </Button>
        ))}
      </div>

      <UsersTable users={users} />
    </div>
  )
}
