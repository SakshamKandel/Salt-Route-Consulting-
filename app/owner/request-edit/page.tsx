import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { CalendarDays, Camera, Edit3, Sparkles } from "lucide-react"
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

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60">Property Updates</p>
          </div>
          <h1 className="font-display text-4xl leading-[1.12] tracking-wide text-[#1B3A5C] md:text-5xl">
            Send property updates to Salt Route.
          </h1>
          <p className="max-w-2xl text-sm font-light leading-[1.85] text-[#1B3A5C]/40">
            Request calendar blocks, price changes, image refreshes, amenities, house notes, or guest-facing details for any property.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[#1B3A5C]/5">
          {[
            { icon: CalendarDays, label: "Calendar" },
            { icon: Camera, label: "Media" },
            { icon: Sparkles, label: "Features" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-[#FFFDF8] p-5 text-center">
              <Icon className="mx-auto mb-4 h-4 w-4 text-gold/45 stroke-[1.3]" />
              <p className="text-[8px] uppercase tracking-[0.22em] text-[#1B3A5C]/30">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div
          className="p-6 sm:p-8 lg:p-10"
          style={{
            border: "1px solid rgba(201,169,110,0.1)",
            background: "rgba(201,169,110,0.025)",
          }}
        >
          <form
            action={async (formData) => {
              "use server"
              const res = await submitOwnerRequestAction(formData)
              if (res.success) {
                redirect("/owner/dashboard?requestSubmitted=true")
              }
            }}
            className="space-y-8"
          >
            <div className="space-y-2.5">
              <label className="block text-[9px] uppercase tracking-[0.36em] text-[#1B3A5C]/40">
                Select Property
              </label>
              <select
                name="propertyId"
                defaultValue={defaultPropertyId ?? ""}
                required
                className="w-full appearance-none bg-transparent px-5 py-4 text-[12.5px] font-light text-[#1B3A5C]/70 outline-none transition-all duration-500 focus:border-gold/40"
                style={{ border: "1px solid rgba(201,169,110,0.18)" }}
              >
                <option value="" disabled className="bg-[#FFFDF8]">
                  Select a property...
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#FFFDF8]">
                    {p.title} - {p.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[9px] uppercase tracking-[0.36em] text-[#1B3A5C]/40">
                What Would You Like To Update?
              </label>
              <select
                name="requestType"
                required
                className="w-full appearance-none bg-transparent px-5 py-4 text-[12.5px] font-light text-[#1B3A5C]/70 outline-none transition-all duration-500 focus:border-gold/40"
                style={{ border: "1px solid rgba(201,169,110,0.18)" }}
              >
                {requestTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#FFFDF8]">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[9px] uppercase tracking-[0.36em] text-[#1B3A5C]/40">
                Details
              </label>
              <textarea
                name="message"
                required
                rows={7}
                placeholder="Add dates, new prices, feature details, amenity changes, photo notes, or guest-facing copy updates."
                className="w-full resize-y bg-transparent px-5 py-4 text-[12.5px] font-light leading-[1.8] text-[#1B3A5C]/50 outline-none transition-all duration-500 placeholder:text-[#1B3A5C]/30 focus:border-gold/40"
                style={{ border: "1px solid rgba(201,169,110,0.18)" }}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.36em] text-[#0C1F33] transition-colors duration-500 hover:bg-sand sm:w-auto"
            >
              Send Request
              <Edit3 className="h-3.5 w-3.5 stroke-[1.4]" />
            </button>
          </form>
        </div>

        <aside className="space-y-5">
          {[
            ["Share clear details", "For calendar blocks and price changes, include dates, amounts, and whether the change is temporary."],
            ["Think guest-first", "For guest details, write the benefit a traveller should notice, such as mountain-view balcony or chef on request."],
            ["Photo updates", "For photos, mention the space, priority order, and whether it should become the primary cover image."],
          ].map(([title, body]) => (
            <div key={title} className="border border-[#1B3A5C]/8 bg-[#FFFDF8] p-6">
              <p className="font-display text-xl tracking-wide text-[#1B3A5C]/70">{title}</p>
              <p className="mt-3 text-[11.5px] font-light leading-[1.85] text-[#1B3A5C]/40">{body}</p>
            </div>
          ))}
        </aside>
      </section>

      <div className="flex items-start gap-5 border border-[#1B3A5C]/8 px-7 py-6">
        <span className="mt-2 h-px w-4 shrink-0 bg-gold/40" />
        <p className="text-[11.5px] font-light leading-[1.8] text-[#1B3A5C]/30">
          The Salt Route team reviews owner requests within 24 hours. For urgent same-day changes, use the support messages section as well.
        </p>
      </div>
    </div>
  )
}

