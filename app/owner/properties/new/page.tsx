import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import OwnerPropertyForm from "./OwnerPropertyForm"

export const metadata = { title: "Add a property | Salt Route Owner" }

export default async function OwnerNewPropertyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const firstName = session.user.name?.split(" ")[0] ?? "Partner"

  return (
    <div className="space-y-8 pb-12">
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium">
        <Link href="/owner/properties" className="text-[#1B3A5C]/40 transition-colors hover:text-[#1B3A5C]">
          Properties
        </Link>
        <ChevronRight className="h-3 w-3 text-[#1B3A5C]/25" />
        <span className="text-[#1B3A5C]/70">Add a property</span>
      </div>

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.3em] text-[#1B3A5C]/35">
            Portfolio
          </p>
          <h1 className="font-display text-2xl tracking-wide text-[#1B3A5C] md:text-3xl">
            Add a property
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-[#1B3A5C]/45">
            {firstName}, tell us about the residence you&rsquo;d like represented. Everything you
            enter is saved as a draft and previewed live on the right — our team reviews, refines the
            photography, and publishes it to the collection.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#C9A96E]/25 bg-[#C9A96E]/6 px-4 py-3">
          <Plus className="h-4 w-4 text-[#A8863F]" />
          <span className="text-[11.5px] text-[#1B3A5C]/60">
            Submitted as <strong className="text-[#1B3A5C]">draft</strong>
          </span>
        </div>
      </div>

      <OwnerPropertyForm />
    </div>
  )
}
