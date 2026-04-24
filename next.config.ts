import type { NextConfig } from "next";

/**
 * 10.5 — Security headers.
 * CSP, HSTS, X-Frame-Options, referrer, content-type sniffing, permissions.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ─── Content-Security-Policy ──────────────────────────
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://placehold.co",
              "connect-src 'self' https://api.cloudinary.com https://api.pwnedpasswords.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // ─── HSTS ─────────────────────────────────────────────
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ─── Clickjacking ─────────────────────────────────────
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // ─── MIME-type sniffing ────────────────────────────────
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ─── Referrer ─────────────────────────────────────────
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ─── Permissions ──────────────────────────────────────
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
          // ─── XSS filter (legacy browsers) ─────────────────────
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
