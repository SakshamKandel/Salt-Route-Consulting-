import { auth } from "@/auth"
import { NextResponse } from "next/server"
import Redis from "ioredis"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const subscriber = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  })

  let cleanup: (() => void) | undefined

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
        } catch {
          // Stream closed
        }
      }

      subscriber.subscribe("admin:events", (err) => {
        if (err) {
          controller.close()
          return
        }
        send(JSON.stringify({ type: "connected" }))
      })

      subscriber.on("message", (_channel: string, message: string) => {
        send(message)
      })

      // Keepalive comment every 25 seconds to prevent proxy timeout
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keepalive\n\n"))
        } catch {
          clearInterval(keepalive)
        }
      }, 25000)

      cleanup = () => {
        clearInterval(keepalive)
        subscriber.unsubscribe()
        subscriber.quit()
      }
    },
    cancel() {
      cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
