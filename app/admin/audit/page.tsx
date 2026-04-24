import { prisma } from "@/lib/db"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  LOGIN: "bg-slate-100 text-slate-800",
  LOGOUT: "bg-slate-100 text-slate-800",
  PASSWORD_CHANGE: "bg-amber-100 text-amber-800",
  ROLE_CHANGE: "bg-purple-100 text-purple-800",
  BOOKING_CREATE: "bg-emerald-100 text-emerald-800",
  BOOKING_CANCEL: "bg-orange-100 text-orange-800",
  BOOKING_CONFIRM: "bg-teal-100 text-teal-800",
  PROPERTY_PUBLISH: "bg-cyan-100 text-cyan-800",
  PROPERTY_ARCHIVE: "bg-zinc-100 text-zinc-800",
  INVITATION_SEND: "bg-indigo-100 text-indigo-800",
  INVITATION_ACCEPT: "bg-violet-100 text-violet-800",
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

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where: entity ? { entity } : undefined }),
  ])

  const totalPages = Math.ceil(total / take)

  const entities = await prisma.auditLog
    .groupBy({ by: ["entity"] })
    .then((r) => r.map((x) => x.entity).sort())

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-display text-navy">Audit Log</h2>
        <p className="text-slate-500">
          {total.toLocaleString()} total entries
        </p>
      </div>

      {/* Entity filter */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/audit"
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            !entity ? "bg-navy text-white border-navy" : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All
        </a>
        {entities.map((e) => (
          <a
            key={e}
            href={`/admin/audit?entity=${e}`}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              entity === e
                ? "bg-navy text-white border-navy"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {e}
          </a>
        ))}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">When</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">IP</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No audit log entries found.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-xs">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700">{log.entity}</span>
                    {log.entityId && (
                      <span className="ml-1 text-xs text-slate-400 font-mono">
                        {log.entityId.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.user ? (
                      <span title={log.user.email ?? undefined}>
                        {log.user.name ?? log.user.email ?? "—"}
                      </span>
                    ) : (
                      <span className="text-slate-400">System</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {log.ipAddress ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
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
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {pageNum} of {totalPages}
            </p>
            <div className="flex gap-2">
              {pageNum > 1 && (
                <a
                  href={`/admin/audit?page=${pageNum - 1}${entity ? `&entity=${entity}` : ""}`}
                  className="px-3 py-1 text-xs border rounded hover:bg-white"
                >
                  Previous
                </a>
              )}
              {pageNum < totalPages && (
                <a
                  href={`/admin/audit?page=${pageNum + 1}${entity ? `&entity=${entity}` : ""}`}
                  className="px-3 py-1 text-xs border rounded hover:bg-white"
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
