import crypto from "crypto"

/**
 * 10.7 — Pwned-password check via the Have I Been Pwned k-Anonymity API.
 *
 * Hashes the password with SHA-1, sends only the first 5 hex chars to the
 * API, then checks whether the suffix appears in the returned list.
 *
 * @returns `true` if the password has appeared in known data breaches.
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  try {
    const sha1 = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase()

    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" }, // adds random padding to thwart timing attacks
      next: { revalidate: 86400 },       // cache for 24 h in Next.js data cache
    })

    if (!res.ok) {
      // If the API is down, fail open so users aren't blocked
      console.warn("[PWNED] API returned", res.status)
      return false
    }

    const text = await res.text()

    // Each line looks like  SUFFIX:COUNT
    return text.split("\n").some((line) => {
      const [hash] = line.split(":")
      return hash.trim() === suffix
    })
  } catch (err) {
    console.error("[PWNED] Check failed, failing open:", err)
    return false
  }
}
