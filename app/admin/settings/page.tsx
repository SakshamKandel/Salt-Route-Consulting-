import { prisma } from "@/lib/db"
import { Settings, Building, Mail, Phone, Globe } from "lucide-react"

async function getStats() {
  const [totalProperties, totalUsers, totalBookings] = await Promise.all([
    prisma.property.count(),
    prisma.user.count(),
    prisma.booking.count(),
  ])
  return { totalProperties, totalUsers, totalBookings }
}

export default async function AdminSettingsPage() {
  const stats = await getStats()

  const settings = [
    { label: "Company Name", value: "Salt Route Consulting", icon: Building },
    { label: "Admin Email", value: process.env.ADMIN_EMAIL ?? "admin@saltroutegroup.com", icon: Mail },
    { label: "Enquiries Email", value: process.env.ENQUIRIES_EMAIL ?? "enquiries@saltroutegroup.com", icon: Mail },
    { label: "WhatsApp Number", value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "Not configured", icon: Phone },
    { label: "App URL", value: process.env.NEXTAUTH_URL ?? "http://localhost:3000", icon: Globe },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Site Settings</h2>
        <p className="text-slate-500">Platform configuration and environment overview.</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <Settings size={18} className="text-navy" />
          <h3 className="font-semibold text-navy">Configuration</h3>
        </div>
        <div className="divide-y">
          {settings.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
                <p className="text-navy text-sm font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-slate-50 text-xs text-slate-500 border-t">
          These values are set via environment variables in <code className="font-mono bg-slate-100 px-1 rounded">.env.local</code>.
          Edit the file and restart the server to update them.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Properties", value: stats.totalProperties },
          { label: "Total Users", value: stats.totalUsers },
          { label: "Total Bookings", value: stats.totalBookings },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-navy">{value}</p>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
        <p className="font-medium mb-1">Sub-settings sections:</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>Amenities — manage the global amenities list</li>
          <li>Cities / Locations — manage property location tags</li>
          <li>Email Templates — view and preview email templates</li>
          <li>Homepage — configure featured properties and hero content</li>
        </ul>
      </div>
    </div>
  )
}
