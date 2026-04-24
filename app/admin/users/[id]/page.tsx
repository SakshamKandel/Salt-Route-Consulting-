import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar, Shield, Activity } from "lucide-react"
import { UserActions } from "./UserActions"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { property: true }
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  })

  if (!user) return notFound()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/users"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{user.name || "Unnamed User"}</h2>
              <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "OWNER" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                {user.status}
              </Badge>
            </div>
            <p className="text-slate-500">Member since {user.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <UserActions userId={user.id} status={user.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Shield className="w-5 h-5" /> Profile Details
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>
            </p>
            {user.phone && (
              <p className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">{user.phone}</a>
              </p>
            )}
            <p className="flex items-center gap-2 text-slate-600">
              <Shield className="w-4 h-4" />
              Two-Factor Enabled: {user.twoFactorEnabled ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Calendar className="w-5 h-5" /> Recent Bookings
          </h3>
          {user.bookings.length === 0 ? (
            <p className="text-slate-500">No bookings history.</p>
          ) : (
            <div className="space-y-3">
              {user.bookings.map(b => (
                <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md border">
                  <div>
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-blue-600 hover:underline">
                      {b.bookingCode}
                    </Link>
                    <p className="text-xs text-slate-500">{b.property.title}</p>
                  </div>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : "outline"}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-3">
          <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Activity className="w-5 h-5" /> Recent Activity Log
          </h3>
          {user.auditLogs.length === 0 ? (
            <p className="text-slate-500">No recent activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {user.auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{log.createdAt.toLocaleString()}</td>
                      <td className="py-2 px-3 font-medium">{log.action}</td>
                      <td className="py-2 px-3 text-slate-600">
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
