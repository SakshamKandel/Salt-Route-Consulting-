import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Home, Shield } from "lucide-react"

export default async function AdminOwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const owner = await prisma.user.findUnique({
    where: { id },
    include: {
      properties: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, location: true, status: true },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  })

  if (!owner) return notFound()

  const chip = "inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1"
  const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg">
            <Link href="/admin/owners"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Owner Profile</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">{owner.name || "Unnamed Owner"}</h2>
              <span className={`${chip} bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10`}>{owner.role}</span>
            </div>
            <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Joined {owner.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${card} p-6 space-y-4`}>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/35 flex items-center gap-2 border-b border-[#1B3A5C]/8 pb-3">
            <Shield className="w-3.5 h-3.5 text-[#C9A96E]" /> Contact Info
          </h3>
          <div className="space-y-3 text-[13px]">
            <p className="flex items-center gap-2 text-[#1B3A5C]/60">
              <Mail className="w-4 h-4 text-[#1B3A5C]/25" />
              <a href={`mailto:${owner.email}`} className="text-[#1B3A5C] hover:text-[#C9A96E] transition-colors truncate">{owner.email}</a>
            </p>
            {owner.phone && (
              <p className="flex items-center gap-2 text-[#1B3A5C]/60">
                <Phone className="w-4 h-4 text-[#1B3A5C]/25" />
                <a href={`tel:${owner.phone}`} className="text-[#1B3A5C] hover:text-[#C9A96E] transition-colors">{owner.phone}</a>
              </p>
            )}
          </div>
        </div>

        <div className={`${card} p-6 space-y-4 md:col-span-2`}>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/35 flex items-center gap-2 border-b border-[#1B3A5C]/8 pb-3">
            <Home className="w-3.5 h-3.5 text-[#C9A96E]" /> Assigned Properties
          </h3>
          {owner.properties.length === 0 ? (
            <div className="py-8 text-center">
              <Home className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/40">No properties assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {owner.properties.map(p => (
                <div key={p.id} className="p-4 border border-[#1B3A5C]/8 rounded-xl bg-[#FBF9F4]">
                  <Link href={`/admin/properties/${p.id}`} className="text-[13px] font-semibold text-[#1B3A5C] hover:text-[#C9A96E] transition-colors block mb-1">
                    {p.title}
                  </Link>
                  <p className="text-[11px] text-[#1B3A5C]/40 mb-2.5">{p.location}</p>
                  <span className={`${chip} ${p.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60" : "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
