import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Monitor, Shield } from "lucide-react"

export default async function AdminSessionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const rawSession = session as unknown as { iat?: number }
  const issuedAt = rawSession.iat ? new Date(rawSession.iat * 1000) : null

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/profile"
          className="w-8 h-8 rounded-lg border border-[#1B3A5C]/15 flex items-center justify-center hover:border-[#1B3A5C]/30 transition-colors text-[#1B3A5C]/50 hover:text-[#1B3A5C]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Security</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Active Sessions</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Manage your active login sessions.</p>
        </div>
      </div>

      {/* Current session card */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1B3A5C]/8 flex items-center gap-4">
          <Monitor className="h-4 w-4 text-[#C9A96E] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1B3A5C]">Current Session</p>
            <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5">
              {issuedAt
                ? `Started ${issuedAt.toLocaleString()}`
                : "Active session"}
              {" · "}{session.user.email}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 bg-emerald-50 text-emerald-600 border-emerald-200/60">Active</span>
        </div>
        <div className="px-5 py-4 bg-[#FBF9F4] flex items-start gap-3">
          <Shield className="h-4 w-4 text-[#1B3A5C]/30 mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#1B3A5C]/50 leading-relaxed">
            Salt Route uses secure JWT sessions. Each device has its own session stored in an httpOnly cookie.
            To end all active sessions across all devices, sign out and change your password.
          </p>
        </div>
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <button
          type="submit"
          className="w-full h-10 rounded-lg bg-[#B84040] text-white text-[12px] font-medium hover:bg-[#a13636] transition-colors"
        >
          Sign Out (End Current Session)
        </button>
      </form>
    </div>
  )
}
