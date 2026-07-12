import type { Metadata } from "next";
import { Playfair_Display, Inter, Niramit, Great_Vibes } from 'next/font/google'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/public/SessionProvider"

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// Global body/UI font — kept on Inter for the admin/owner/guest portals.
// The PUBLIC site remaps --font-sans → --font-niramit on its own wrapper
// (see app/(public)/layout.tsx), so portals are unaffected.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Public body font (Banyan-Hybrid direction). Scoped to app/(public) only.
const niramit = Niramit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-niramit',
  display: 'swap',
})

// Cursive accent for the public hero slogans. Great Vibes — flowing formal calligraphy.
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Salt Route Corp",
  description: "Bespoke Consulting Services",
};

// Warm connections to the image/video CDNs the public site depends on.
// preconnect → full TLS handshake now; dns-prefetch → DNS only (lighter fallback).
const resourceHints = (
  <>
    <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
    <link rel="dns-prefetch" href="https://res.cloudinary.com" />
    <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
    <link rel="dns-prefetch" href="https://images.unsplash.com" />
  </>
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${niramit.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <head>{resourceHints}</head>
      <body className="font-sans bg-background text-foreground min-h-full flex flex-col">
        {/* Hidden mount point for the Google Translate widget (driven by LanguageSwitcher) */}
        <div id="google_translate_element" aria-hidden="true" />
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
