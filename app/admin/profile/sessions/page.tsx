import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Monitor, Shield } from "lucide-react"

export default async function AdminSessionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const rawSession = session as unknown as { iat?: number }
  const issuedAt = rawSession.iat ? new Date(rawSession.iat * 1000) : null

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/profile"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Active Sessions</h2>
          <p className="text-slate-500">Manage your active login sessions.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
            <Monitor size={18} className="text-navy" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-navy">Current Session</p>
            <p className="text-sm text-slate-500">
              {issuedAt
                ? `Session started: ${issuedAt.toLocaleString()}`
                : "Active session"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{session.user.email}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
        </div>
        <div className="p-5 bg-slate-50 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-navy mt-0.5 shrink-0" />
            <p>
              Salt Route uses secure JWT sessions. Each device has its own session stored in an httpOnly cookie.
              To end all active sessions across all devices, sign out and change your password.
            </p>
          </div>
        </div>
      </div>

      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <Button type="submit" variant="destructive" className="w-full">
          Sign Out (End Current Session)
        </Button>
      </form>
    </div>
  )
}
