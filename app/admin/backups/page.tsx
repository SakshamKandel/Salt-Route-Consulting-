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
        <h2 className="text-3xl font-display text-navy">Database Overview</h2>
        <p className="text-slate-500">Current record counts across all tables. Backups are managed at the infrastructure level via pgAdmin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(({ icon: Icon, label, count }) => (
          <div key={label} className="bg-white border rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-navy" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
              <p className="text-2xl font-bold text-navy">{count.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Database size={20} className="text-navy" />
          <h3 className="font-semibold text-navy">Backup Instructions</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <BackupStep step={1} text="Open pgAdmin and connect to your PostgreSQL server." />
          <BackupStep step={2} text='Right-click your database → "Backup…" to export a .dump file.' />
          <BackupStep step={3} text="Store the backup file in a secure off-site location (e.g., Google Drive, S3)." />
          <BackupStep step={4} text="Schedule automated backups using pg_dump via cron or Windows Task Scheduler." />
          <BackupStep step={5} text="Test restores periodically to verify backup integrity." />
        </div>
        <div className="pt-4 border-t text-xs text-slate-400">
          Recommended backup schedule: daily full backup, weekly off-site copy. Retain 30 days of history.
        </div>
      </div>
    </div>
  )
}

function BackupStep({ step, text }: { step: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-cream text-xs flex items-center justify-center font-bold">{step}</span>
      <p>{text}</p>
    </div>
  )
}
