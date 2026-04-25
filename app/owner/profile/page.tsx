import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function OwnerProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/login")

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PP"

  const memberSince = user.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })

  const fields = [
    { label: "Full Name",     value: user.name  || "—" },
    { label: "Email Address", value: user.email || "—" },
    { label: "Phone Number",  value: user.phone || "—" },
    { label: "Member Since",  value: memberSince },
  ]

  return (
    <div className="space-y-14 max-w-2xl">

      {/* ─── PAGE HEADER ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/40" />
          <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
            Owner Identity
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-sand/85 tracking-wide">
          Partner Profile
        </h1>
      </div>

      {/* ─── AVATAR + IDENTITY ─── */}
      <div className="flex items-center gap-7">
        <div
          className="w-16 h-16 flex items-center justify-center shrink-0"
          style={{
            border: "1px solid rgba(197,168,128,0.3)",
            background: "rgba(197,168,128,0.06)",
          }}
        >
          <span className="font-display text-2xl tracking-wider text-gold/80">
            {initials}
          </span>
        </div>
        <div className="space-y-1">
          <p className="font-display text-xl text-sand/85 tracking-wide">{user.name}</p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-sand/35 font-medium">
          Salt Route Property Partner
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="w-4 h-px bg-gold/30" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold/50 font-medium">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* ─── PERSONAL DETAILS ─── */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
          Contact Details
          </h2>
        </div>

        <div
          className="overflow-hidden"
          style={{ border: "1px solid rgba(197,168,128,0.08)" }}
        >
          {fields.map((field, i) => (
            <div
              key={field.label}
              className="flex flex-col sm:flex-row sm:items-center px-8 py-5 gap-3 hover:bg-white/[0.015] transition-colors duration-500"
              style={{
                borderBottom: i < fields.length - 1 ? "1px solid rgba(197,168,128,0.05)" : "none",
              }}
            >
              <p className="text-[9px] uppercase tracking-[0.35em] text-sand/30 font-medium w-36 shrink-0">
                {field.label}
              </p>
              <p className="text-[13px] text-sand/65 font-light">{field.value}</p>
            </div>
          ))}
        </div>

        <p className="text-[10.5px] text-sand/25 font-light leading-[1.8]">
          To update your name, email, or phone number, contact the Salt Route team through the Support section.
        </p>
      </div>

      {/* ─── SECURITY ─── */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
            Security
          </h2>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 px-8 py-7"
          style={{ border: "1px solid rgba(197,168,128,0.08)", background: "rgba(197,168,128,0.02)" }}
        >
          <div className="space-y-1">
            <p className="text-[13px] text-sand/65 font-medium">Password</p>
            <p className="text-[11px] text-sand/30 font-light">
              Update your account password to keep your portal secure.
            </p>
          </div>
          <Link
            href="/owner/profile/change-password"
            className="shrink-0 px-7 py-3.5 text-[9px] uppercase tracking-[0.35em] font-medium text-gold/70 hover:text-gold transition-all duration-500"
            style={{ border: "1px solid rgba(197,168,128,0.2)" }}
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}
