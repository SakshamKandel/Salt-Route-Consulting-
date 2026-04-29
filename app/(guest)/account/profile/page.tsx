import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, image: true, email: true, createdAt: true, hashedPassword: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-12">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-[1px] bg-charcoal/20" />
        <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">
          Personal Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
        {/* Profile form */}
        <div className="bg-white border border-charcoal/5 p-8 md:p-12">
          <h2 className="font-display text-xl text-charcoal tracking-wide mb-2">Your Details</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 mb-10">Keep your contact details current</p>
          <ProfileForm initialData={{ name: user.name || "", phone: user.phone || "", image: user.image || "" }} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account info */}
          <div className="bg-white border border-charcoal/5 p-8">
            <h3 className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 font-medium mb-6">Account Details</h3>
            <div className="space-y-5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Email</p>
                <p className="text-sm text-charcoal/70 font-sans">{user.email}</p>
              </div>
              <div className="w-full h-[1px] bg-charcoal/5" />
              <div>
                <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Member Since</p>
                <p className="text-sm text-charcoal/70 font-sans">
                  {user.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-charcoal/5 p-8">
            <h3 className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 font-medium mb-6">Security</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-charcoal/70 font-medium mb-1">Password</p>
                <p className="text-[11px] text-charcoal/35 leading-relaxed mb-4">
                  {user.hashedPassword
                    ? "Keep your account secure with a strong password."
                    : "You signed in with Google. Set a password to enable email login."}
                </p>
                <Link
                  href="/account/profile/password"
                  className="inline-flex items-center text-[9px] uppercase tracking-[0.25em] text-charcoal/50 hover:text-charcoal transition-colors underline underline-offset-4 decoration-charcoal/15"
                >
                  {user.hashedPassword ? "Change Password" : "Set Password"}
                </Link>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-charcoal/[0.02] border border-charcoal/5 p-8">
            <h3 className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 font-medium mb-4">Need Help?</h3>
            <p className="text-xs text-charcoal/40 leading-relaxed font-sans mb-4">
              The Salt Route team is available to help with stay questions, profile updates, or guest care.
            </p>
            <a
              href="mailto:support@saltroutegroup.com"
              className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 hover:text-charcoal transition-colors underline underline-offset-4 decoration-charcoal/15"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
