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
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Platform</p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Settings</h1>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Manage your profile, password, and data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/admin/settings/amenities" className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 hover:border-[#1B3A5C]/20 transition-colors group">
          <p className="text-[13px] font-semibold text-[#1B3A5C] group-hover:text-[#C9A96E] transition-colors">Amenities</p>
          <p className="text-[11px] text-[#1B3A5C]/45 mt-0.5">Manage shared amenities across properties.</p>
        </a>
        <a href="/admin/settings/features" className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 hover:border-[#1B3A5C]/20 transition-colors group">
          <p className="text-[13px] font-semibold text-[#1B3A5C] group-hover:text-[#C9A96E] transition-colors">What to Expect Features</p>
          <p className="text-[11px] text-[#1B3A5C]/45 mt-0.5">Manage icon-strip features for property pages.</p>
        </a>
        <a href="/admin/settings/homepage" className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 hover:border-[#1B3A5C]/20 transition-colors group">
          <p className="text-[13px] font-semibold text-[#1B3A5C] group-hover:text-[#C9A96E] transition-colors">Homepage</p>
          <p className="text-[11px] text-[#1B3A5C]/45 mt-0.5">Featured properties and homepage content.</p>
        </a>
        <a href="/admin/settings/email-templates" className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 hover:border-[#1B3A5C]/20 transition-colors group">
          <p className="text-[13px] font-semibold text-[#1B3A5C] group-hover:text-[#C9A96E] transition-colors">Email Templates</p>
          <p className="text-[11px] text-[#1B3A5C]/45 mt-0.5">Customize email content and branding.</p>
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
