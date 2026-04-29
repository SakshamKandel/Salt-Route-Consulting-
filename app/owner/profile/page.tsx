import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { EditProfileForm } from "./EditProfileForm"

export default async function OwnerProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/login")

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PP"

  return (
    <div className="space-y-14 max-w-2xl">

      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/40" />
          <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
            Owner Details
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Partner Profile
        </h1>
      </div>

      {/* Avatar + identity */}
      <div className="flex items-center gap-7">
        <div
          className="w-16 h-16 flex items-center justify-center shrink-0"
          style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.06)" }}
        >
          <span className="font-display text-2xl tracking-wider text-gold/80">{initials}</span>
        </div>
        <div className="space-y-1">
          <p className="font-display text-xl text-[#1B3A5C] tracking-wide">{user.name}</p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/50 font-medium">Salt Route Property Partner</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="w-4 h-px bg-gold/30" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold/50 font-medium">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#1B3A5C]/50 font-medium">Edit Details</h2>
        </div>

        {/* Read-only email */}
        <div
          className="overflow-hidden"
          style={{ border: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center px-8 py-5 gap-3"
            style={{ borderBottom: "1px solid rgba(201,169,110,0.05)" }}
          >
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#1B3A5C]/40 font-medium w-36 shrink-0">Email Address</p>
            <p className="text-[13px] text-[#1B3A5C]/70 font-light">{user.email}</p>
          </div>
          <div className="px-8 py-5">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#1B3A5C]/40 font-medium mb-5">Name &amp; Phone</p>
            <EditProfileForm
              initialName={user.name ?? ""}
              initialPhone={user.phone ?? ""}
            />
          </div>
        </div>

        <p className="text-[10.5px] text-[#1B3A5C]/30 font-light leading-[1.8]">
          To change your email address, contact the Salt Route team through the Support section.
        </p>
      </div>

      {/* Security */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#1B3A5C]/50 font-medium">Security</h2>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 px-8 py-7"
          style={{ border: "1px solid rgba(201,169,110,0.08)", background: "rgba(201,169,110,0.02)" }}
        >
          <div className="space-y-1">
            <p className="text-[13px] text-[#1B3A5C]/70 font-medium">Password</p>
            <p className="text-[11px] text-[#1B3A5C]/40 font-light">
              Update your password to keep your owner area secure.
            </p>
          </div>
          <Link
            href="/owner/profile/change-password"
            className="shrink-0 px-7 py-3.5 text-[9px] uppercase tracking-[0.35em] font-medium text-gold/70 hover:text-gold transition-all duration-500"
            style={{ border: "1px solid rgba(201,169,110,0.2)" }}
          >
            Change Password
          </Link>
        </div>
      </div>

    </div>
  )
}
