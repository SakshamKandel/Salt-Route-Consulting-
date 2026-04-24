import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function OwnerProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-display text-navy">My Profile</h2>
        <p className="text-slate-500">Manage your personal information and security settings.</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input defaultValue={user?.name || ""} readOnly className="bg-slate-50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input defaultValue={user?.email || ""} readOnly className="bg-slate-50" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input defaultValue={user?.phone || ""} readOnly className="bg-slate-50" />
            </div>
          </div>
          <p className="text-xs text-slate-500">To change your primary email or phone, please contact the administrator.</p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold border-b pb-2">Security</h3>
          <Button asChild variant="outline">
            <Link href="/owner/profile/change-password">Change Password</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
