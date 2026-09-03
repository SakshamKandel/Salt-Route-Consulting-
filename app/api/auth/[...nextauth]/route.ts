import { handlers } from '@/auth'

// Auth.js endpoints must always run on the server and must never be cached as
// page output. Keeping these route guarantees explicit also makes Turbopack
// rebuild the catch-all handler when auth configuration changes in development.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers
