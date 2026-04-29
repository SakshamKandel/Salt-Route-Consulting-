import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Key, Shield, Monitor, ArrowRight } from "lucide-react"

export default async function AdminProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      status: true, emailVerified: true, twoFactorEnabled: true,
      createdAt: true, _count: { select: { auditLogs: true } },
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Account info and security settings.</p>
      </div>

      {/* Identity card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-[#1B3A5C] px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-[#C9A96E] text-lg font-bold">{user.name?.[0]?.toUpperCase() ?? "A"}</span>
          </div>
          <div>
            <p className="text-white font-semibold text-base">{user.name ?? "Admin"}</p>
            <p className="text-white/50 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E]">{user.role}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              }`}>{user.status}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100">
          {[
            { label: "Member since", value: user.createdAt.toLocaleDateString() },
            { label: "Email verified", value: user.emailVerified ? "Yes" : "No" },
            { label: "Phone", value: user.phone ?? "—" },
            { label: "Audit entries", value: String(user._count.auditLogs) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security links */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Security</p>
        {[
          { icon: Key,     title: "Change Password",          desc: "Update your login password",                   href: "/admin/profile/change-password" },
          { icon: Shield,  title: "Two-Factor Authentication", desc: user.twoFactorEnabled ? "2FA is enabled" : "Add an extra layer of security", href: "/admin/profile/2fa",     badge: user.twoFactorEnabled ? "Enabled" : "Off" },
          { icon: Monitor, title: "Active Sessions",          desc: "View and revoke sessions on other devices",    href: "/admin/profile/sessions" },
        ].map(({ icon: Icon, title, desc, href, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <Icon className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">{title}</p>
                  {badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      badge === "Enabled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>{badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Link to full settings */}
      <p className="text-xs text-slate-400 text-center">
        To edit your profile details, go to{" "}
        <Link href="/admin/settings" className="text-[#1B3A5C] font-medium underline underline-offset-2">
          Settings
        </Link>
      </p>
    </div>
  )
}
