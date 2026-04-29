import { config } from "dotenv"
import { resolve } from "path"

// Must run before any module that reads process.env at load time.
// Static imports are hoisted by tsx, so everything env-dependent is dynamically imported below.
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

void (async () => {
  // Dynamic import ensures lib/email/transporter and lib/db load AFTER dotenv runs,
  // so they pick up the correct SMTP credentials and DATABASE_URL.
  const { createEmailWorker } = await import("@/lib/queue/worker")

  console.log("[WORKER] Starting email campaign worker...")

  const worker = createEmailWorker()

  async function shutdown() {
    console.log("[WORKER] Shutting down gracefully...")
    await worker.close()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  console.log("[WORKER] Ready. Listening for email jobs on 'email-campaigns' queue.")
})()
