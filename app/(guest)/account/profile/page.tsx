import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, image: true }
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-display text-navy">Profile Settings</h1>
      <ProfileForm initialData={{ name: user.name || "", phone: user.phone || "", image: user.image || "" }} />
    </div>
  )
}
