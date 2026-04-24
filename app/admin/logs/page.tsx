import { prisma } from "@/lib/db"
import { AuditAction } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ACTION_COLORS: Partial<Record<AuditAction, string>> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  BOOKING_CREATE: "bg-emerald-100 text-emerald-700",
  BOOKING_CANCEL: "bg-orange-100 text-orange-700",
  BOOKING_CONFIRM: "bg-teal-100 text-teal-700",
  ROLE_CHANGE: "bg-amber-100 text-amber-700",
  PASSWORD_CHANGE: "bg-pink-100 text-pink-700",
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = 30
  const skip = (page - 1) * pageSize
  const entity = params.entity as string | undefined

  const where = entity ? { entity } : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const entities = await prisma.auditLog.findMany({
    select: { entity: true },
    distinct: ["entity"],
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Activity Logs</h2>
        <p className="text-slate-500">Full audit trail of all admin and system actions.</p>
      </div>

      {/* Entity filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          asChild
          variant={!entity ? "default" : "outline"}
          size="sm"
          className={!entity ? "bg-navy text-cream" : "border-navy/20 text-navy"}
        >
          <Link href="/admin/logs">All</Link>
        </Button>
        {entities.map((e) => (
          <Button
            key={e.entity}
            asChild
            variant={entity === e.entity ? "default" : "outline"}
            size="sm"
            className={entity === e.entity ? "bg-navy text-cream" : "border-navy/20 text-navy"}
          >
            <Link href={`/admin/logs?entity=${e.entity}`}>{e.entity}</Link>
          </Button>
        ))}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <p className="text-sm text-slate-500">{total} total entries</p>
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
        </div>
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit logs found.</div>
        ) : (
          <div className="divide-y text-sm">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                <div className="shrink-0 pt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-medium">{log.entity} {log.entityId ? `· ${log.entityId.slice(0, 8)}…` : ""}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {log.user ? `${log.user.name ?? log.user.email}` : "System"}
                    {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex gap-2 justify-end">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/logs?${entity ? `entity=${entity}&` : ""}page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild size="sm" className="bg-navy text-cream">
                <Link href={`/admin/logs?${entity ? `entity=${entity}&` : ""}page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
