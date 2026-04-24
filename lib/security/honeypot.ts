/**
 * 10.4 — Honeypot field detection.
 *
 * Every public form (signup, inquiry, booking) includes a hidden "website"
 * field.  Real users never fill it; bots do.  If populated → silently
 * swallow the submission (return a fake "success" to the bot).
 */

/**
 * Returns `true` if the honeypot field was filled → the request is spam.
 */
export function isHoneypotTriggered(
  body: Record<string, unknown>
): boolean {
  const value = body?.website ?? body?.hp_field
  if (typeof value === "string" && value.trim().length > 0) {
    return true
  }
  return false
}

/**
 * React component props helper: renders an invisible field that
 * legitimate users will never see or fill.
 *
 * Usage in JSX:
 *   <input {...honeypotFieldProps} />
 */
export const honeypotFieldProps = {
  type: "text" as const,
  name: "website",
  autoComplete: "off",
  tabIndex: -1,
  "aria-hidden": true as const,
  style: {
    position: "absolute" as const,
    left: "-9999px",
    opacity: 0,
    height: 0,
    width: 0,
    overflow: "hidden" as const,
  },
} as const
