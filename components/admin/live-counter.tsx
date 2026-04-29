"use client"

import { useEffect, useRef, useState } from "react"
import { useLiveContext } from "./live-provider"
import type { AdminEventType } from "@/lib/realtime/publisher"

interface LiveCounterProps {
  initial: number
  eventType: AdminEventType
  className?: string
}

export function LiveCounter({ initial, eventType, className }: LiveCounterProps) {
  const { lastEvent } = useLiveContext()
  const [value, setValue] = useState(initial)
  const prevEventTs = useRef<number>(0)

  useEffect(() => {
    if (
      lastEvent?.type === eventType &&
      lastEvent.ts &&
      lastEvent.ts > prevEventTs.current
    ) {
      prevEventTs.current = lastEvent.ts
      setValue((v) => v + 1)
    }
  }, [lastEvent, eventType])

  return <span className={className}>{value.toLocaleString()}</span>
}
