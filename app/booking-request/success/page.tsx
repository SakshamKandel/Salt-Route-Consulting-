import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const code = resolvedParams.code as string | undefined

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-xl border-t-4 border-t-gold">
        <CardContent className="pt-10 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-display text-navy">Request Received!</h1>
            <p className="text-gray-500">
              We&apos;ve received your booking request and our team is reviewing it.
            </p>
          </div>

          <div className="bg-navy/5 p-4 rounded-lg border border-navy/10">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1 font-bold">Booking Reference</p>
            <p className="text-2xl font-mono font-bold text-navy">{code || "SLT-PENDING"}</p>
          </div>

          <div className="text-sm text-left bg-gold/5 p-4 rounded-lg space-y-2 border border-gold/20">
            <p className="font-semibold text-navy">What happens next?</p>
            <ul className="space-y-2 text-gray-600 list-disc pl-4">
              <li>A consultant will review your request.</li>
              <li>We&apos;ll contact you within 24 hours to confirm.</li>
              <li>You can track the status in your account.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="bg-navy text-cream">
              <Link href="/account/bookings">
                <Calendar className="mr-2 h-4 w-4" /> View My Bookings
              </Link>
            </Button>

            {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <Button asChild variant="outline" className="border-navy text-navy">
                <Link
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Message us on WhatsApp
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="border-navy text-navy">
              <Link href="/contact">
                <ArrowRight className="mr-2 h-4 w-4" /> Contact our team
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
