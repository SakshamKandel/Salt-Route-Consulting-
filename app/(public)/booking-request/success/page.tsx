import Link from "next/link"
import Image from "next/image"
import { CompactContainer } from "@/components/public/Compact"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const code = typeof params.code === "string" ? params.code : "SLT-PENDING"

  return (
    <div className="editorial-plain min-h-[72vh] bg-background pb-20 text-navy">
      <CompactContainer>
        <div className="mx-auto max-w-3xl py-20 text-center">
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-gold-dark">Request received</p>
            <Image
              src="/brand/logo.png"
              alt="Salt Route"
              width={960}
              height={399}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-navy">Your stay request is with our team.</h1>
          <p className="mt-4 max-w-2xl font-sans text-base font-light leading-7 text-navy/70">
            We are reviewing the property, room, and dates. You will receive the next steps by email after availability is confirmed.
          </p>

          <div className="mt-7 bg-white p-5 sm:p-6">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Booking reference</p>
            <p className="mt-2 break-all font-display text-3xl tracking-[0.08em] text-navy">{code}</p>
            <p className="mt-3 font-sans text-sm font-light leading-6 text-navy/62">Keep this reference for future messages about the request.</p>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-2xl text-navy">What happens next</h2>
            <ol className="mt-3 space-y-2 font-sans text-sm font-light leading-6 text-navy/68">
              <li>1. The request is reviewed by the Salt Route team.</li>
              <li>2. Availability is confirmed with the property.</li>
              <li>3. A concierge contacts you with confirmation and next steps.</li>
            </ol>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/account/bookings" className="inline-flex min-h-11 items-center justify-center bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark">View bookings</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center bg-camel px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-white hover:bg-camel-dark">Contact concierge</Link>
          </div>
        </div>
      </CompactContainer>
    </div>
  )
}
