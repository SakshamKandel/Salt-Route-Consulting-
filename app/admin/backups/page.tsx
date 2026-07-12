import { prisma } from "@/lib/db"
import { Database, Users, Home, Calendar, MessageSquare, Star, Shield } from "lucide-react"

async function getDatabaseStats() {
  const [users, properties, bookings, reviews, inquiries, auditLogs, wishlists] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.inquiry.count(),
    prisma.auditLog.count(),
    prisma.wishlist.count(),
  ])
  return { users, properties, bookings, reviews, inquiries, auditLogs, wishlists }
}

export default async function AdminBackupsPage() {
  const stats = await getDatabaseStats()

  const tables = [
    { icon: Users, label: "Users", count: stats.users },
    { icon: Home, label: "Properties", count: stats.properties },
    { icon: Calendar, label: "Bookings", count: stats.bookings },
    { icon: Star, label: "Reviews", count: stats.reviews },
    { icon: MessageSquare, label: "Inquiries", count: stats.inquiries },
    { icon: Shield, label: "Audit Logs", count: stats.auditLogs },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Operations</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Database Overview</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Current record counts across all tables. Backups are managed at the infrastructure level via pgAdmin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(({ icon: Icon, label, count }) => (
          <div key={label} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B3A5C]/5 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-[#C9A96E]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/40 font-medium">{label}</p>
              <p className="text-2xl font-semibold text-[#1B3A5C] tabular-nums">{count.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Database size={18} className="text-[#C9A96E]" />
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60">Backup Instructions</h3>
        </div>
        <div className="space-y-3 text-[13px] text-[#1B3A5C]/60">
          <BackupStep step={1} text="Open pgAdmin and connect to your PostgreSQL server." />
          <BackupStep step={2} text='Right-click your database → "Backup…" to export a .dump file.' />
          <BackupStep step={3} text="Store the backup file in a secure off-site location (e.g., Google Drive, S3)." />
          <BackupStep step={4} text="Schedule automated backups using pg_dump via cron or Windows Task Scheduler." />
          <BackupStep step={5} text="Test restores periodically to verify backup integrity." />
        </div>
        <div className="pt-4 border-t border-[#1B3A5C]/8 text-[11px] text-[#1B3A5C]/35">
          Recommended backup schedule: daily full backup, weekly off-site copy. Retain 30 days of history.
        </div>
      </div>
    </div>
  )
}

function BackupStep({ step, text }: { step: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-[#1B3A5C] text-[#C9A96E] text-xs flex items-center justify-center font-bold tabular-nums">{step}</span>
      <p>{text}</p>
    </div>
  )
}
