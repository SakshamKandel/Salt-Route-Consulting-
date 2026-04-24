"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleUserStatusAction } from "./actions"
import type { UserStatus } from "@prisma/client"

export function UserActions({ userId, status }: { userId: string; status: UserStatus }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    setIsPending(true)
    setError(null)
    const newStatus: UserStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const result = await toggleUserStatusAction(userId, newStatus)
    if (result?.error) setError(result.error)
    setIsPending(false)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {status === "ACTIVE" ? (
        <Button variant="destructive" onClick={handleToggle} disabled={isPending}>
          {isPending ? "Suspending..." : "Suspend User"}
        </Button>
      ) : (
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleToggle} disabled={isPending}>
          {isPending ? "Restoring..." : "Restore User"}
        </Button>
      )}
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}
