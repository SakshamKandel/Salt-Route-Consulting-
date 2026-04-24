import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone } from "lucide-react"
import { InquiryReplyForm } from "./InquiryReplyForm"

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const inquiry = await prisma.inquiry.findUnique({
    where: { id }
  })

  if (!inquiry) return notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/inquiries"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">Inquiry Detail</h2>
              <Badge variant={inquiry.status === "NEW" ? "destructive" : inquiry.status === "CLOSED" ? "default" : "secondary"}>
                {inquiry.status}
              </Badge>
            </div>
            <p className="text-slate-500">Received on {inquiry.createdAt.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-navy border-b pb-2">Message</h3>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {inquiry.message}
          </p>

          <div className="mt-8 pt-6 border-t">
            <InquiryReplyForm inquiry={inquiry} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <User className="w-5 h-5" /> Sender Info
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-800">{inquiry.name}</p>
              <p><a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a></p>
              {inquiry.phone && (
                <p className="flex items-center gap-2 text-slate-600 mt-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">{inquiry.phone}</a>
                </p>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
