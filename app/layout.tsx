import type { Metadata } from "next";
import { Playfair_Display, Inter, Dancing_Script } from 'next/font/google'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/public/SessionProvider"

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Salt Route Corp",
  description: "Bespoke Consulting Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${dancingScript.variable} h-full antialiased`}
    >
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
