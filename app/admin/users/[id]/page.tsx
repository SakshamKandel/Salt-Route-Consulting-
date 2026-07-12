import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Shield, Activity } from "lucide-react"
import { UserActions } from "./UserActions"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [session, user] = await Promise.all([auth(), prisma.user.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, bookingCode: true, status: true, createdAt: true, property: { select: { title: true } } }
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  })])

  if (!user) return notFound()

  const chip = "inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1"
  const roleChip =
    user.role === "ADMIN" ? "bg-amber-50 text-amber-700 border-amber-200/60"
    : user.role === "OWNER" ? "bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10"
    : "bg-sky-50 text-sky-600 border-sky-200/60"
  const statusChip = user.status === "ACTIVE"
    ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
    : "bg-rose-50 text-rose-500 border-rose-200/60"
  const bookingChip = (s: string) =>
    s === "CONFIRMED" || s === "COMPLETED" || s === "CHECKED_IN" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
    : s === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200/60"
    : s === "CANCELLED" ? "bg-rose-50 text-rose-500 border-rose-200/60"
    : "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"
  const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg">
            <Link href="/admin/users"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">User Profile</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">{user.name || "Unnamed User"}</h2>
              <span className={`${chip} ${roleChip}`}>{user.role}</span>
              <span className={`${chip} ${statusChip}`}>{user.status}</span>
            </div>
            <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Member since {user.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <UserActions userId={user.id} status={user.status} currentUser={session?.user} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className={`${card} p-6 space-y-4`}>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/35 flex items-center gap-2 border-b border-[#1B3A5C]/8 pb-3">
            <Shield className="w-3.5 h-3.5 text-[#C9A96E]" /> Profile Details
          </h3>
          <div className="space-y-3 text-[13px]">
            <p className="flex items-center gap-2 text-[#1B3A5C]/60">
              <Mail className="w-4 h-4 text-[#1B3A5C]/25" />
              <a href={`mailto:${user.email}`} className="text-[#1B3A5C] hover:text-[#C9A96E] transition-colors truncate">{user.email}</a>
            </p>
            {user.phone && (
              <p className="flex items-center gap-2 text-[#1B3A5C]/60">
                <Phone className="w-4 h-4 text-[#1B3A5C]/25" />
                <a href={`tel:${user.phone}`} className="text-[#1B3A5C] hover:text-[#C9A96E] transition-colors">{user.phone}</a>
              </p>
            )}
            <p className="flex items-center gap-2 text-[#1B3A5C]/60">
              <Shield className="w-4 h-4 text-[#1B3A5C]/25" />
              Two-Factor Enabled: {user.twoFactorEnabled ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={`${card} p-6 space-y-4 md:col-span-2`}>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/35 flex items-center gap-2 border-b border-[#1B3A5C]/8 pb-3">
            <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" /> Recent Bookings
          </h3>
          {user.bookings.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/40">No bookings history.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1B3A5C]/5">
              {user.bookings.map(b => (
                <div key={b.id} className="flex justify-between items-center py-3 px-1 hover:bg-[#FBF9F4] rounded-lg transition-colors">
                  <div className="min-w-0">
                    <Link href={`/admin/bookings/${b.id}`} className="font-mono text-[12px] font-medium text-[#1B3A5C] hover:text-[#C9A96E] transition-colors">
                      {b.bookingCode}
                    </Link>
                    <p className="text-[11px] text-[#1B3A5C]/40 truncate">{b.property.title}</p>
                  </div>
                  <span className={`${chip} ${bookingChip(b.status)}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className={`${card} p-6 space-y-4 md:col-span-3`}>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/35 flex items-center gap-2 border-b border-[#1B3A5C]/8 pb-3">
            <Activity className="w-3.5 h-3.5 text-[#C9A96E]" /> Recent Activity Log
          </h3>
          {user.auditLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/40">No recent activity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left">
                <thead>
                  <tr className="border-b border-[#1B3A5C]/8">
                    <th className="py-2 px-3 text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Date</th>
                    <th className="py-2 px-3 text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Action</th>
                    <th className="py-2 px-3 text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B3A5C]/5">
                  {user.auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="py-2.5 px-3 text-[#1B3A5C]/40 whitespace-nowrap tabular-nums">{log.createdAt.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1B3A5C]">{log.action}</td>
                      <td className="py-2.5 px-3 text-[#1B3A5C]/50 font-mono text-[11px]">
                        {log.details != null
                          ? typeof log.details === "object"
                            ? JSON.stringify(log.details)
                            : String(log.details)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
