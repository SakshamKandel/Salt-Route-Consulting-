import { prisma } from "@/lib/db"
import { AuditAction } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ACTION_COLORS: Partial<Record<AuditAction, string>> = {
  CREATE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  UPDATE: "bg-sky-50 text-sky-600 border-sky-200/60",
  DELETE: "bg-rose-50 text-rose-500 border-rose-200/60",
  LOGIN: "bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10",
  LOGOUT: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
  BOOKING_CREATE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  BOOKING_CANCEL: "bg-amber-50 text-amber-700 border-amber-200/60",
  BOOKING_CONFIRM: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  ROLE_CHANGE: "bg-amber-50 text-amber-700 border-amber-200/60",
  PASSWORD_CHANGE: "bg-sky-50 text-sky-600 border-sky-200/60",
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

  const [logs, total, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: {
        id: true, action: true, entity: true, entityId: true,
        ipAddress: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      select: { entity: true },
      distinct: ["entity"],
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Operations</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Activity Logs</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Full audit trail of all admin and system actions.</p>
      </div>

      {/* Entity filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          asChild
          variant={!entity ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-[12px] font-medium ${!entity ? "bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A]" : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30"}`}
        >
          <Link href="/admin/logs">All</Link>
        </Button>
        {entities.map((e) => (
          <Button
            key={e.entity}
            asChild
            variant={entity === e.entity ? "default" : "outline"}
            size="sm"
            className={`rounded-lg text-[12px] font-medium ${entity === e.entity ? "bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A]" : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30"}`}
          >
            <Link href={`/admin/logs?entity=${e.entity}`}>{e.entity}</Link>
          </Button>
        ))}
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1B3A5C]/8 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/40 tabular-nums">{total} total entries</p>
          <p className="text-[11px] text-[#1B3A5C]/40 tabular-nums">Page {page} of {totalPages}</p>
        </div>
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[13px] text-[#1B3A5C]/40">No audit logs found.</p>
            <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Actions will be recorded here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5 text-sm">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#FBF9F4] transition-colors">
                <div className="shrink-0 pt-0.5">
                  <span className={`inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${ACTION_COLORS[log.action] ?? "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"}`}>
                    {log.action}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1B3A5C] text-[13px] font-medium">{log.entity} {log.entityId ? <span className="font-mono text-[#1B3A5C]/50 text-[11px]">· {log.entityId.slice(0, 8)}…</span> : ""}</p>
                  <p className="text-[#1B3A5C]/40 text-[11px] mt-0.5">
                    {log.user ? `${log.user.name ?? log.user.email}` : "System"}
                    {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-[#1B3A5C]/35 tabular-nums">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#1B3A5C]/8 flex gap-2 justify-end">
            {page > 1 && (
              <Button asChild variant="outline" size="sm" className="border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 rounded-lg text-[12px] font-medium">
                <Link href={`/admin/logs?${entity ? `entity=${entity}&` : ""}page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild size="sm" className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium">
                <Link href={`/admin/logs?${entity ? `entity=${entity}&` : ""}page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
