import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/profile"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Two-Factor Authentication</h2>
          <p className="text-slate-500">Secure your account with an authenticator app.</p>
        </div>
      </div>

      <TwoFactorSetup enabled={user.twoFactorEnabled} />
    </div>
  )
}
