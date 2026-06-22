import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileSection, SecuritySection } from "./SettingsForm"
import { DataManagementSection } from "./DataManagement"

async function getAdminUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true, phone: true, twoFactorEnabled: true },
  })
}

async function getDataCounts() {
  const [properties, bookings, sections, revenue] = await Promise.all([
    prisma.property.count(),
    prisma.booking.count(),
    prisma.propertySection.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true } }),
  ])
  return {
    properties,
    bookings,
    sections,
    revenue: Number(revenue._sum.totalPrice ?? 0),
  }
}

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login")

  const [user, counts] = await Promise.all([
    getAdminUser(session.user.id),
    getDataCounts(),
  ])
  if (!user) redirect("/login")

  return (
    <div className="space-y-8 max-w-2xl">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, password, and data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/admin/settings/amenities" className="bg-white border rounded-lg p-4 hover:border-navy/30 transition-colors">
          <p className="font-semibold text-navy">Amenities</p>
          <p className="text-xs text-slate-500">Manage shared amenities across properties.</p>
        </a>
        <a href="/admin/settings/features" className="bg-white border rounded-lg p-4 hover:border-navy/30 transition-colors">
          <p className="font-semibold text-navy">What to Expect Features</p>
          <p className="text-xs text-slate-500">Manage icon-strip features for property pages.</p>
        </a>
        <a href="/admin/settings/homepage" className="bg-white border rounded-lg p-4 hover:border-navy/30 transition-colors">
          <p className="font-semibold text-navy">Homepage</p>
          <p className="text-xs text-slate-500">Featured properties and homepage content.</p>
        </a>
        <a href="/admin/settings/email-templates" className="bg-white border rounded-lg p-4 hover:border-navy/30 transition-colors">
          <p className="font-semibold text-navy">Email Templates</p>
          <p className="text-xs text-slate-500">Customize email content and branding.</p>
        </a>
      </div>

      <ProfileSection
        user={{ name: user.name ?? "", email: user.email, phone: user.phone }}
      />

      <SecuritySection />

      <DataManagementSection counts={counts} />

    </div>
  )
}
