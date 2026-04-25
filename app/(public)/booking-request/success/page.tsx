import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LuxuryButton } from "@/components/ui/luxury-button"
import Image from "next/image"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const code = resolvedParams.code as string | undefined

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 bg-[#FDFBF7]">
      <div className="max-w-2xl w-full">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative w-24 h-12 mb-12">
            <Image 
              src="/logo.png" 
              alt="Salt Route Group" 
              fill 
              className="object-contain grayscale opacity-60" 
            />
          </div>
          
          <div className="h-20 w-20 flex items-center justify-center border border-charcoal/10 rounded-full mb-8">
            <CheckCircle2 className="w-8 h-8 text-charcoal/40" strokeWidth={1} />
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl text-charcoal tracking-tight mb-4 text-center">
            Request Received
          </h1>
          <p className="text-charcoal/50 font-sans text-sm tracking-[0.2em] uppercase text-center max-w-md mx-auto leading-relaxed">
            Your journey with Salt Route begins. Our concierge team is now reviewing your request.
          </p>
        </div>

        {/* Reference & Next Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-t border-b border-charcoal/10 py-16">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal/40">Booking Reference</p>
            <p className="font-display text-4xl text-charcoal tracking-wider">
              {code || "SLT-PENDING"}
            </p>
            <div className="w-12 h-[1px] bg-charcoal/20" />
            <p className="text-xs text-charcoal/50 font-sans leading-relaxed">
              Please quote this reference number in any communication regarding your stay.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal/40">Concierge Protocol</p>
            <ul className="space-y-4">
              {[
                "Personal advisor verification",
                "Confirmation within 24 hours",
                "Digital itinerary generation"
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4 text-xs text-charcoal/70 font-sans">
                  <span className="text-[10px] text-gold/60 font-bold mt-0.5">0{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl mx-auto">
            <Link href="/account/bookings" className="w-full">
              <LuxuryButton className="w-full">
                View My Itinerary
              </LuxuryButton>
            </Link>
            
            {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <Link 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                className="w-full py-5 border border-charcoal/10 text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal hover:bg-charcoal hover:text-white transition-all text-center"
              >
                Immediate Inquiry
              </Link>
            )}
          </div>
          
          <Link href="/contact" className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-charcoal/40 hover:text-charcoal transition-all">
            <span>Contact Support Team</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
          </Link>
        </div>
      </div>
    </div>
  )
}
