import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { KeyRound, Mail, UserRound } from "lucide-react"
import { EditProfileForm } from "./EditProfileForm"

export default async function OwnerProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, role: true },
  })
  if (!user) redirect("/login")

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PP"

  return (
    <div className="pb-12 space-y-8 max-w-2xl">

      {/* ── PAGE HEADER ── */}
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
          Owner Details
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
          Partner profile
        </h1>
      </div>

      {/* ── IDENTITY CARD ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1B3A5C] flex items-center justify-center shrink-0">
          <span className="text-base font-bold text-[#C9A96E] uppercase">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#1B3A5C] truncate">{user.name}</p>
          <p className="text-[10px] text-[#1B3A5C]/40 uppercase tracking-[0.2em] font-medium mt-0.5">
            Salt Route Property Partner
          </p>
          <span className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold border uppercase tracking-[0.15em] bg-[#C9A96E]/10 text-[#A8863F] border-[#C9A96E]/30">
            {user.role}
          </span>
        </div>
      </div>

      {/* ── EDIT DETAILS ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
          <UserRound className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
            Account Details
          </h2>
        </div>

        {/* Read-only email */}
        <div className="px-5 py-4 border-b border-[#1B3A5C]/5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium w-36 shrink-0">
            <Mail className="h-3 w-3" />
            Email address
          </p>
          <p className="text-[13px] text-[#1B3A5C]/70">{user.email}</p>
        </div>

        <div className="px-5 py-4">
          <EditProfileForm
            initialName={user.name ?? ""}
            initialPhone={user.phone ?? ""}
          />
        </div>
      </div>

      <p className="text-[11px] text-[#1B3A5C]/35 leading-relaxed">
        To change your email address, contact the Salt Route team through the Support section.
      </p>

      {/* ── SECURITY ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1B3A5C]/5 flex items-center justify-center shrink-0">
            <KeyRound className="h-4 w-4 text-[#1B3A5C]/40" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1B3A5C]">Password</p>
            <p className="text-[11px] text-[#1B3A5C]/45 mt-0.5">
              Update your password to keep your owner area secure.
            </p>
          </div>
        </div>
        <Link
          href="/owner/profile/change-password"
          className="shrink-0 self-start sm:self-auto inline-flex items-center px-4 py-2 border border-[#1B3A5C]/15 rounded-lg text-[11px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
        >
          Change password
        </Link>
      </div>

    </div>
  )
}
