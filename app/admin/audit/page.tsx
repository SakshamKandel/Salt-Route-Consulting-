import { prisma } from "@/lib/db"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  UPDATE: "bg-sky-50 text-sky-600 border-sky-200/60",
  DELETE: "bg-rose-50 text-rose-500 border-rose-200/60",
  LOGIN: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
  LOGOUT: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
  PASSWORD_CHANGE: "bg-amber-50 text-amber-700 border-amber-200/60",
  ROLE_CHANGE: "bg-amber-50 text-amber-700 border-amber-200/60",
  BOOKING_CREATE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  BOOKING_CANCEL: "bg-amber-50 text-amber-700 border-amber-200/60",
  BOOKING_CONFIRM: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  PROPERTY_PUBLISH: "bg-sky-50 text-sky-600 border-sky-200/60",
  PROPERTY_ARCHIVE: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
  INVITATION_SEND: "bg-sky-50 text-sky-600 border-sky-200/60",
  INVITATION_ACCEPT: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string }>
}) {
  const { page = "1", entity } = await searchParams
  const pageNum = Math.max(1, parseInt(page, 10))
  const take = 50
  const skip = (pageNum - 1) * take

  const [logs, total, entities] = await Promise.all([
    prisma.auditLog.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where: entity ? { entity } : undefined }),
    prisma.auditLog
      .groupBy({ by: ["entity"] })
      .then((r) => r.map((x) => x.entity).sort()),
  ])

  const totalPages = Math.ceil(total / take)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Operations</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Audit Log</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1 tabular-nums">
          {total.toLocaleString()} total entries
        </p>
      </div>

      {/* Entity filter */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/audit"
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !entity ? "bg-[#1B3A5C] text-[#FFFAF3] border-[#1B3A5C]" : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30"
          }`}
        >
          All
        </a>
        {entities.map((e) => (
          <a
            key={e}
            href={`/admin/audit?entity=${e}`}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              entity === e
                ? "bg-[#1B3A5C] text-[#FFFAF3] border-[#1B3A5C]"
                : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30"
            }`}
          >
            {e}
          </a>
        ))}
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-[#1B3A5C]/8">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">When</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Action</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Entity</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Actor</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">IP</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B3A5C]/5">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="text-[13px] text-[#1B3A5C]/40">No audit log entries found.</p>
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FBF9F4] transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-[#1B3A5C]/40 text-xs tabular-nums">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${
                        ACTION_COLORS[log.action] ?? "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[13px] font-medium text-[#1B3A5C]">{log.entity}</span>
                    {log.entityId && (
                      <span className="ml-1 text-xs text-[#1B3A5C]/35 font-mono">
                        {log.entityId.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-[#1B3A5C]/60">
                    {log.user ? (
                      <span title={log.user.email ?? undefined}>
                        {log.user.name ?? log.user.email ?? "—"}
                      </span>
                    ) : (
                      <span className="text-[#1B3A5C]/35">System</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#1B3A5C]/35 font-mono text-xs">
                    {log.ipAddress ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-[#1B3A5C]/45 text-xs max-w-xs truncate font-mono">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1B3A5C]/8 bg-[#FBF9F4]">
            <p className="text-xs text-[#1B3A5C]/45 tabular-nums">
              Page {pageNum} of {totalPages}
            </p>
            <div className="flex gap-2">
              {pageNum > 1 && (
                <a
                  href={`/admin/audit?page=${pageNum - 1}${entity ? `&entity=${entity}` : ""}`}
                  className="px-3 py-1 text-xs border border-[#1B3A5C]/15 rounded-lg text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
                >
                  Previous
                </a>
              )}
              {pageNum < totalPages && (
                <a
                  href={`/admin/audit?page=${pageNum + 1}${entity ? `&entity=${entity}` : ""}`}
                  className="px-3 py-1 text-xs border border-[#1B3A5C]/15 rounded-lg text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
