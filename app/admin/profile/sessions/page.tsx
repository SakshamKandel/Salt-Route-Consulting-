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
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Active Sessions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your active login sessions.</p>
        </div>
      </div>

      {/* Current session card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-4">
          <Monitor className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Current Session</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {issuedAt
                ? `Started ${issuedAt.toLocaleString()}`
                : "Active session"}
              {" · "}{session.user.email}
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Active</span>
        </div>
        <div className="px-5 py-4 bg-slate-50 flex items-start gap-3">
          <Shield className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
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
          className="w-full h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Sign Out (End Current Session)
        </button>
      </form>
    </div>
  )
}
