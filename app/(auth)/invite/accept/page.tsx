import { Suspense } from "react"
import { AcceptInviteForm } from "./AcceptInviteForm"

export const dynamic = "force-dynamic"

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-10 text-center">
          <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Checking...</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Verifying your invitation link.</p>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  )
}
