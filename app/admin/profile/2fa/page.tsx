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
          className="w-8 h-8 rounded-lg border border-[#1B3A5C]/15 flex items-center justify-center hover:border-[#1B3A5C]/30 transition-colors text-[#1B3A5C]/50 hover:text-[#1B3A5C]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Security</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Two-Factor Authentication</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Secure your account with an authenticator app.</p>
        </div>
      </div>

      <TwoFactorSetup enabled={user.twoFactorEnabled} />
    </div>
  )
}
