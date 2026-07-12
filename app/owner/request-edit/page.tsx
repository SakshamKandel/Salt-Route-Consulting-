import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Edit3, Info, Send } from "lucide-react"
import { submitOwnerRequestAction } from "./actions"

export default async function OwnerRequestEditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const resolvedParams = await searchParams
  const defaultPropertyId = resolvedParams.propertyId as string | undefined

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true, location: true },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
  })

  const requestTypes = [
    "Calendar Block",
    "Price Change",
    "Update Images",
    "Description Update",
    "Amenities Update",
    "Guest Details",
    "House Notes",
    "Other",
  ]

  const inputClass =
    "w-full bg-[#FBF9F4] text-[#1B3A5C] text-[13px] px-4 py-2.5 border border-[#1B3A5C]/10 rounded-lg outline-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E] focus:ring-3 focus:ring-[#C9A96E]/20"

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
          Property Updates
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
          Request an update
        </h1>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5 max-w-xl">
          Request calendar blocks, price changes, image refreshes, amenities, house notes, or guest-facing details for any property.
        </p>
      </div>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1fr)_300px] items-start">

        {/* ── FORM CARD ── */}
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
            <Edit3 className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
              Update Request
            </h2>
          </div>

          <form
            action={async (formData) => {
              "use server"
              const res = await submitOwnerRequestAction(formData)
              if (res.success) {
                redirect("/owner/dashboard?requestSubmitted=true")
              }
            }}
            className="p-5 space-y-5"
          >
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium">
                Select Property
              </label>
              <select
                name="propertyId"
                defaultValue={defaultPropertyId ?? ""}
                required
                className={`${inputClass} appearance-none`}
              >
                <option value="" disabled className="bg-[#FFFAF3]">
                  Select a property...
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#FFFAF3]">
                    {p.title} - {p.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium">
                What Would You Like To Update?
              </label>
              <select
                name="requestType"
                required
                className={`${inputClass} appearance-none`}
              >
                {requestTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#FFFAF3]">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium">
                Details
              </label>
              <textarea
                name="message"
                required
                rows={7}
                placeholder="Add dates, new prices, feature details, amenity changes, photo notes, or guest-facing copy updates."
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Send request
            </button>
          </form>
        </div>

        {/* ── TIPS ── */}
        <aside className="space-y-3">
          {[
            ["Share clear details", "For calendar blocks and price changes, include dates, amounts, and whether the change is temporary."],
            ["Think guest-first", "For guest details, write the benefit a traveller should notice, such as mountain-view balcony or chef on request."],
            ["Photo updates", "For photos, mention the space, priority order, and whether it should become the primary cover image."],
          ].map(([title, body]) => (
            <div key={title} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4">
              <p className="text-[13px] font-semibold text-[#1B3A5C]">{title}</p>
              <p className="mt-1 text-[11px] text-[#1B3A5C]/45 leading-relaxed">{body}</p>
            </div>
          ))}
        </aside>
      </div>

      {/* ── NOTE ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl flex items-start gap-3 px-4 py-3.5">
        <Info className="h-3.5 w-3.5 text-[#1B3A5C]/30 mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#1B3A5C]/45 leading-relaxed">
          The Salt Route team reviews owner requests within 24 hours. For urgent same-day changes, use the support messages section as well.
        </p>
      </div>
    </div>
  )
}
