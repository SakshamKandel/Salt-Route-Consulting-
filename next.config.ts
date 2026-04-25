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
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "saltroutegroup.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
