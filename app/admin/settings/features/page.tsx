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
        <h2 className="text-3xl font-display text-navy">What to Expect Features</h2>
        <p className="text-slate-500">
          Manage the master list of features that admins can select for each property. These appear as icons in the &ldquo;What to Expect&rdquo; strip on public property pages.
        </p>
      </div>
      <FeaturesManager features={features} />
    </div>
  )
}
