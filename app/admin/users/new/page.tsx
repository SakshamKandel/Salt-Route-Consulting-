import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateUserForm } from "./CreateUserForm"

const ROLES = ["GUEST", "OWNER", "ADMIN"] as const
type RoleParam = (typeof ROLES)[number]

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const roleParam = typeof params.role === "string" ? params.role.toUpperCase() : ""
  const defaultRole: RoleParam = (ROLES as readonly string[]).includes(roleParam) ? (roleParam as RoleParam) : "GUEST"

  const backHref = defaultRole === "OWNER" ? "/admin/owners" : "/admin/users"

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={backHref}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">
            Create {defaultRole === "OWNER" ? "Owner" : defaultRole === "ADMIN" ? "Admin" : "User"}
          </h2>
          <p className="text-slate-500">Set up the account directly. The user can sign in with the email and password you choose.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <CreateUserForm defaultRole={defaultRole} />
      </div>
    </div>
  )
}
