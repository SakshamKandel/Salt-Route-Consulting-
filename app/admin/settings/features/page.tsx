import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { FeaturesManager } from "./FeaturesManager"

export default async function FeaturesSettingsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login")

  const features = await prisma.propertyFeature.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Settings</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">What to Expect Features</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">
          Manage the master list of features that admins can select for each property. These appear as icons in the &ldquo;What to Expect&rdquo; strip on public property pages.
        </p>
      </div>
      <FeaturesManager features={features} />
    </div>
  )
}
