"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleUserStatusAction, deleteUserAction } from "../actions"
import type { UserStatus } from "@prisma/client"
import { Trash2, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserActions({ 
  userId, 
  status, 
  currentUser 
}: { 
  userId: string; 
  status: UserStatus; 
  currentUser?: { email?: string | null } 
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMasterAdmin = currentUser?.email === "connect@saltroutecorp.com"

  const handleToggle = async () => {
    setIsPending(true)
    setError(null)
    const newStatus: UserStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const result = await toggleUserStatusAction(userId, newStatus)
    if (result?.error) setError(result.error)
    setIsPending(false)
  }

  const handleDelete = async () => {
    setIsPending(true)
    setError(null)
    const result = await deleteUserAction(userId)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
      setShowConfirmDelete(false)
    } else if (result?.redirect) {
      router.push(result.redirect)
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center gap-3">
        {status === "ACTIVE" ? (
          <Button variant="outline" className="border-rose-200/60 text-[#B84040] hover:bg-rose-50 rounded-lg text-[12px] font-medium" onClick={handleToggle} disabled={isPending}>
            {isPending ? "Suspending..." : "Suspend User"}
          </Button>
        ) : (
          <Button variant="outline" className="border-emerald-200/60 text-emerald-600 hover:bg-emerald-50 rounded-lg text-[12px] font-medium" onClick={handleToggle} disabled={isPending}>
            {isPending ? "Restoring..." : "Restore User"}
          </Button>
        )}
        
        {isMasterAdmin && (
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => setShowConfirmDelete(true)} 
            disabled={isPending}
            title="Permanently Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showConfirmDelete && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200/60 rounded-xl space-y-4 max-w-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#B84040] shrink-0 mt-0.5" />
            <p className="text-xs text-[#B84040] leading-relaxed">
              <strong>Are you absolutely sure?</strong> This will permanently delete this user, all their properties, and all their data. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-[10px] h-8" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" className="text-[10px] h-8" onClick={handleDelete}>Confirm Delete</Button>
          </div>
        </div>
      )}

      {error && <p className="text-[#B84040] text-[10px] font-medium uppercase tracking-[0.15em]">{error}</p>}
    </div>
  )
}
