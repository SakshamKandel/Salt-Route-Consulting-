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
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Account</p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">My Profile</h1>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Account info and security settings.</p>
      </div>

      {/* Identity card */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="bg-[#1B3A5C] px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-[#C9A96E] text-lg font-bold">{user.name?.[0]?.toUpperCase() ?? "A"}</span>
          </div>
          <div>
            <p className="text-[#FFFAF3] font-semibold text-base">{user.name ?? "Admin"}</p>
            <p className="text-[#FFFAF3]/50 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-[#C9A96E]/20 text-[#C9A96E]">{user.role}</span>
              <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${
                user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}>{user.status}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1B3A5C]/5 border-t border-[#1B3A5C]/8">
          {[
            { label: "Member since", value: user.createdAt.toLocaleDateString() },
            { label: "Email verified", value: user.emailVerified ? "Yes" : "No" },
            { label: "Phone", value: user.phone ?? "—" },
            { label: "Audit entries", value: String(user._count.auditLogs) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3.5">
              <p className="text-[10px] font-medium text-[#1B3A5C]/40 uppercase tracking-[0.15em]">{label}</p>
              <p className="text-[13px] font-medium text-[#1B3A5C] mt-0.5 tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security links */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] px-1">Security</p>
        {[
          { icon: Key,     title: "Change Password",          desc: "Update your login password",                   href: "/admin/profile/change-password" },
          { icon: Shield,  title: "Two-Factor Authentication", desc: user.twoFactorEnabled ? "2FA is enabled" : "Add an extra layer of security", href: "/admin/profile/2fa",     badge: user.twoFactorEnabled ? "Enabled" : "Off" },
          { icon: Monitor, title: "Active Sessions",          desc: "View and revoke sessions on other devices",    href: "/admin/profile/sessions" },
        ].map(({ icon: Icon, title, desc, href, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-4 bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl px-5 py-4 hover:border-[#1B3A5C]/20 hover:bg-[#FBF9F4] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <Icon className="h-4 w-4 text-[#1B3A5C]/30 group-hover:text-[#C9A96E] transition-colors shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-[#1B3A5C]">{title}</p>
                  {badge && (
                    <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${
                      badge === "Enabled" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60" : "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"
                    }`}>{badge}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5">{desc}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B3A5C]/20 group-hover:text-[#C9A96E] transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Link to full settings */}
      <p className="text-[11px] text-[#1B3A5C]/40 text-center">
        To edit your profile details, go to{" "}
        <Link href="/admin/settings" className="text-[#C9A96E] font-medium hover:underline underline-offset-2">
          Settings
        </Link>
      </p>
    </div>
  )
}
