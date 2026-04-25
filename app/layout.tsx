import type { Metadata } from "next";
import { Playfair_Display, Inter } from 'next/font/google'
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

export const metadata: Metadata = {
  title: "Salt Route Consulting",
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
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="font-sans bg-background text-foreground min-h-full flex flex-col">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
