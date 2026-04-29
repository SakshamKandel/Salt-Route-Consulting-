import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileSection, SecuritySection } from "./SettingsForm"

async function getAdminUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true, phone: true, twoFactorEnabled: true },
  })
}

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login")

  const user = await getAdminUser(session.user.id)
  if (!user) redirect("/login")

  return (
    <div className="space-y-8 max-w-2xl">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile and password.</p>
      </div>

      <ProfileSection
        user={{ name: user.name ?? "", email: user.email, phone: user.phone }}
      />

      <SecuritySection />

    </div>
  )
}
