export type SessionRole = "ADMIN" | "OWNER" | "GUEST"

export async function fetchSessionRole(): Promise<SessionRole | null> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const res = await fetch("/api/auth/session", { cache: "no-store" })
    const session = (await res.json().catch(() => null)) as { user?: { role?: SessionRole } } | null
    if (session?.user?.role) return session.user.role
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return null
}

export function getSafeCallback(raw: string | null) {
  if (!raw || typeof window === "undefined") return null

  try {
    const url = raw.startsWith("/") ? new URL(raw, window.location.origin) : new URL(raw)
    if (url.origin !== window.location.origin) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function getDestination(role: SessionRole | null, callbackUrl: string | null) {
  if (role === "ADMIN") {
    return callbackUrl?.startsWith("/admin") ? callbackUrl : "/admin/dashboard"
  }

  if (role === "OWNER") {
    return callbackUrl?.startsWith("/owner") ? callbackUrl : "/owner/dashboard"
  }

  if (role === "GUEST") {
    const callbackIsGuestSafe =
      callbackUrl &&
      !callbackUrl.startsWith("/admin") &&
      !callbackUrl.startsWith("/owner") &&
      !callbackUrl.startsWith("/login") &&
      !callbackUrl.startsWith("/signup")

    return callbackIsGuestSafe ? callbackUrl : "/account"
  }

  return "/"
}
