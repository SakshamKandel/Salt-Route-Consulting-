"use client"

import { useEffect, useRef } from "react"
import { useLiveContext } from "./live-provider"
import { toast } from "sonner"

const TOAST_MESSAGES: Partial<Record<string, string>> = {
  "booking.created": "New booking received",
  "inquiry.created": "New inquiry received",
  "review.created": "New review submitted",
}

export function ToastListener() {
  const { lastEvent } = useLiveContext()
  const prevTs = useRef<number>(0)

  useEffect(() => {
    if (!lastEvent?.ts || lastEvent.ts <= prevTs.current) return
    if (lastEvent.type === "connected") return
    prevTs.current = lastEvent.ts

    const msg = TOAST_MESSAGES[lastEvent.type]
    if (msg) {
      toast.info(msg, { duration: 4000 })
    }
  }, [lastEvent])

  return null
}
