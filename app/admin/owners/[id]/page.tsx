import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        orderBy: { createdAt: "desc" }
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  })

  if (!owner) return notFound()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/owners"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{owner.name || "Unnamed Owner"}</h2>
              <Badge variant="default">{owner.role}</Badge>
            </div>
            <p className="text-slate-500">Joined {owner.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Shield className="w-5 h-5" /> Contact Info
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${owner.email}`} className="text-blue-600 hover:underline">{owner.email}</a>
            </p>
            {owner.phone && (
              <p className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${owner.phone}`} className="text-blue-600 hover:underline">{owner.phone}</a>
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Home className="w-5 h-5" /> Assigned Properties
          </h3>
          {owner.properties.length === 0 ? (
            <p className="text-slate-500">No properties assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {owner.properties.map(p => (
                <div key={p.id} className="p-4 border rounded-md bg-slate-50">
                  <Link href={`/admin/properties/${p.id}`} className="font-semibold text-blue-600 hover:underline block mb-1">
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-500 mb-2">{p.location}</p>
                  <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
