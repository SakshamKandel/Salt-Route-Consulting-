"use client"

// global-error.tsx must include its own <html>/<body> tags since it replaces
// the root layout when a fatal error occurs. It deliberately avoids using any
// context providers (SessionProvider, etc.) that caused the SSR prerender crash
// on /_global-error during production builds.

export const dynamic = "force-dynamic"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#FFFAF3",
          color: "#1B3A5C",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "8rem",
            lineHeight: 1,
            fontWeight: 700,
            color: "rgba(27,58,92,0.08)",
            margin: 0,
            userSelect: "none",
          }}
        >
          500
        </p>
        <h1 style={{ fontSize: "2rem", margin: "1rem 0 0.75rem" }}>
          Something Went Wrong
        </h1>
        <p style={{ color: "rgba(27,58,92,0.6)", maxWidth: "28rem", marginBottom: "2rem" }}>
          An unexpected error occurred. Our team has been notified. Please try
          again or return to the homepage.
        </p>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "rgba(27,58,92,0.35)", marginBottom: "1.5rem" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#1B3A5C",
              color: "#FFFAF3",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              color: "#1B3A5C",
              border: "1px solid rgba(27,58,92,0.2)",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Back to Home
          </a>
        </div>
      </body>
    </html>
  )
}
