import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TwoFactorSetup } from "./TwoFactorSetup"

export default async function Admin2FAPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/profile"
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Two-Factor Authentication</h1>
          <p className="text-sm text-slate-500 mt-0.5">Secure your account with an authenticator app.</p>
        </div>
      </div>

      <TwoFactorSetup enabled={user.twoFactorEnabled} />
    </div>
  )
}
