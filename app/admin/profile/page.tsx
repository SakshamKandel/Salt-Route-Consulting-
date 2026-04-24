import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Monitor, Key } from "lucide-react"

export default async function AdminProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      _count: { select: { auditLogs: true } },
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-display text-navy">My Profile</h2>
        <p className="text-slate-500">Manage your account settings and security preferences.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-navy p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-cream text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div>
            <p className="text-cream font-display text-xl">{user.name ?? "Admin"}</p>
            <p className="text-cream/60 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">{user.role}</Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">{user.status}</Badge>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Member Since</p>
            <p className="text-navy">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Email Verified</p>
            <p className="text-navy">{user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : "Not verified"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Phone</p>
            <p className="text-navy">{user.phone ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">Activity Log Entries</p>
            <p className="text-navy">{user._count.auditLogs}</p>
          </div>
        </div>
      </div>

      {/* Security section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-navy text-lg">Security</h3>

        <SecurityCard
          icon={Key}
          title="Password"
          desc="Change your account password. Use a strong, unique password."
          action="Change Password"
          href="/admin/profile/change-password"
        />
        <SecurityCard
          icon={Shield}
          title="Two-Factor Authentication"
          desc={user.twoFactorEnabled ? "2FA is enabled on your account." : "Add an extra layer of security with 2FA."}
          badge={user.twoFactorEnabled ? "Enabled" : "Disabled"}
          badgeColor={user.twoFactorEnabled ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"}
          action="Manage 2FA"
          href="/admin/profile/2fa"
        />
        <SecurityCard
          icon={Monitor}
          title="Active Sessions"
          desc="View and revoke all active sessions on other devices."
          action="View Sessions"
          href="/admin/profile/sessions"
        />
      </div>
    </div>
  )
}

function SecurityCard({
  icon: Icon,
  title,
  desc,
  action,
  href,
  badge,
  badgeColor,
}: {
  icon: React.ElementType
  title: string
  desc: string
  action: string
  href: string
  badge?: string
  badgeColor?: string
}) {
  return (
    <div className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-navy" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-navy">{title}</p>
            {badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 border-navy/20 text-navy">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  )
}
