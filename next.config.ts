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
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "saltroutecorp.com" },
    ],
    // AVIF first (20-50% smaller than WebP for photos), WebP fallback; cache
    // the optimized variants for 30 days.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },
  // Rewrite big barrel imports to per-module imports → smaller client JS.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns", "recharts"],
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
      {
        // Cross-origin isolation for /admin so ffmpeg.wasm (SharedArrayBuffer)
        // can run for in-browser video compression. `credentialless` lets
        // cross-origin assets (Cloudinary images) still load without CORP headers.
        source: "/admin/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
