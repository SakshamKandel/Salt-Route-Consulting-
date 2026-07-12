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
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Your Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Personal Profile
        </h1>
        <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
          Keep your details current so we can care for every stay properly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        {/* Profile form */}
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8 md:p-10">
          <h2 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-1.5">Your Details</h2>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium mb-8">Keep your contact details current</p>
          <ProfileForm initialData={{ name: user.name || "", phone: user.phone || "", image: user.image || "" }} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Account info */}
          <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium mb-5">Account Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium mb-1">Email</p>
                <p className="text-[13px] text-[#1B3A5C]/70">{user.email}</p>
              </div>
              <div className="w-full h-px bg-[#1B3A5C]/5" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium mb-1">Member Since</p>
                <p className="text-[13px] text-[#1B3A5C]/70">
                  {user.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium mb-5">Security</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[13px] text-[#1B3A5C] font-medium mb-1">Password</p>
                <p className="text-[13px] text-[#1B3A5C]/60 leading-relaxed mb-4">
                  {user.hashedPassword
                    ? "Keep your account secure with a strong password."
                    : "You signed in with Google. Set a password to enable email login."}
                </p>
                <Link
                  href="/account/profile/password"
                  className="inline-flex items-center min-h-[40px] text-[13px] uppercase tracking-[0.16em] font-medium text-[#C9A96E] hover:text-[#1B3A5C] transition-colors"
                >
                  {user.hashedPassword ? "Change Password" : "Set Password"}
                </Link>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-[#1B3A5C] rounded-xl p-6 sm:p-7">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-[#FFFAF3]/60 font-medium mb-3">Need Help?</h3>
            <p className="text-[13px] text-[#FFFAF3]/70 leading-relaxed mb-4">
              The Salt Route team is available to help with stay questions, profile updates, or guest care.
            </p>
            <a
              href="mailto:connect@saltroutecorp.com"
              className="inline-flex items-center min-h-[40px] text-[13px] uppercase tracking-[0.16em] font-medium text-[#C9A96E] hover:text-[#FFFAF3] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
