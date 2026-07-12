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
        <Button asChild variant="ghost" size="icon" className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg">
          <Link href={backHref}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">New Account</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            Create {defaultRole === "OWNER" ? "Owner" : defaultRole === "ADMIN" ? "Admin" : "User"}
          </h2>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Set up the account directly. The user can sign in with the email and password you choose.</p>
        </div>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
        <CreateUserForm defaultRole={defaultRole} />
      </div>
    </div>
  )
}
