"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import type { AdminEvent } from "@/lib/realtime/publisher"

interface LiveContextValue {
  lastEvent: AdminEvent | null
  counters: Record<string, number>
}

const LiveContext = createContext<LiveContextValue>({
  lastEvent: null,
  counters: {},
})

export function useLiveContext() {
  return useContext(LiveContext)
}

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [lastEvent, setLastEvent] = useState<AdminEvent | null>(null)
  const [counters, setCounters] = useState<Record<string, number>>({})
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryDelay = useRef(1000)

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close()

    const es = new EventSource("/api/admin/events")
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event: AdminEvent = JSON.parse(e.data)
        if (event.type === "connected") return
        setLastEvent(event)
        if (event.type.endsWith(".created")) {
          setCounters((prev) => ({
            ...prev,
            [event.type]: (prev[event.type] ?? 0) + 1,
          }))
        }
        retryDelay.current = 1000
      } catch {
        // non-JSON keep-alive comment
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      retryRef.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, 30000)
        connect()
      }, retryDelay.current)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [connect])

  return (
    <LiveContext.Provider value={{ lastEvent, counters }}>
      {children}
    </LiveContext.Provider>
  )
}
