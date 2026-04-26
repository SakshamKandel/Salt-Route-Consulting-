import { ArrowRight, Check } from "lucide-react"
import Link from "next/link"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const code = resolvedParams.code as string | undefined

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#E6E2DA] selection:bg-charcoal selection:text-white">
      <div className="max-w-3xl w-full bg-[#F7F5F0] border border-charcoal relative shadow-2xl shadow-charcoal/5">
        
        {/* Top thick black bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-charcoal" />

        <div className="p-8 sm:p-16">
          {/* Header */}
          <div className="flex justify-between items-start mb-16 border-b border-charcoal pb-8">
            <div className="flex flex-col">
              <span className="font-display text-2xl tracking-widest uppercase text-charcoal leading-none">Salt Route</span>
              <span className="font-sans text-[8px] tracking-[0.5em] text-gold uppercase mt-2">Consulting</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal">Status</span>
              <div className="flex items-center gap-2 mt-2 border border-charcoal px-3 py-1 bg-charcoal text-white">
                <Check className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Received</span>
              </div>
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-16">
            <h1 className="font-display text-5xl md:text-6xl text-charcoal tracking-tight leading-none mb-6">
              Request <br/> <span className="italic text-charcoal/70">Confirmed.</span>
            </h1>
            <p className="font-sans text-xs md:text-sm tracking-[0.1em] text-charcoal/60 leading-relaxed max-w-md uppercase">
              Your journey begins here. Our team is currently reviewing your exclusive request and will formalize your itinerary shortly.
            </p>
          </div>

          {/* Reference Folio */}
          <div className="border border-charcoal bg-white mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 border-b md:border-b-0 md:border-r border-charcoal flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal/40 mb-2">Folio Reference</p>
                  <p className="font-mono text-3xl text-charcoal tracking-widest">
                    {code || "SLT-PENDING"}
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] text-charcoal/50 font-sans uppercase tracking-wider leading-relaxed">
                    Please quote this reference number in all future correspondence regarding this specific arrangement.
                  </p>
                </div>
              </div>

              <div className="p-8 flex flex-col justify-center bg-[#F9F9F8]">
                <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-charcoal/40 mb-6">Next Steps Protocol</p>
                <ul className="space-y-4">
                  {[
                    "Executive review by curation team",
                    "Confirmation dossier sent within 24H",
                    "Dedicated concierge assigned"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs text-charcoal/80 font-sans tracking-wide uppercase">
                      <span className="text-[10px] text-gold font-bold mt-0.5">0{i+1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/account/bookings" 
              className="w-full sm:w-auto bg-charcoal text-white border border-charcoal text-[10px] uppercase tracking-[0.3em] px-10 py-5 hover:bg-white hover:text-charcoal transition-all duration-500 ease-out text-center font-bold"
            >
              View Itinerary
            </Link>
            
            {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <Link 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                className="w-full sm:w-auto border border-charcoal text-charcoal bg-transparent text-[10px] uppercase tracking-[0.3em] px-10 py-5 hover:bg-[#E6E2DA] transition-all duration-500 ease-out text-center font-bold"
              >
                Message Concierge
              </Link>
            )}
          </div>
        </div>
        
        {/* Footer Bar */}
        <div className="bg-charcoal text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/50">Salt Route Group © {new Date().getFullYear()}</span>
          <Link href="/contact" className="group flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/70 hover:text-gold transition-all">
            <span>Contact Support</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
