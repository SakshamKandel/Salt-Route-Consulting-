import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const token = resolvedParams.token as string | undefined
  const email = resolvedParams.email as string | undefined

  if (!token || !email) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-cream">Invalid Link</h1>
        <p className="text-sm text-beige">Missing verification token or email.</p>
        <Button asChild className="bg-gold text-navy hover:bg-gold/90 w-full"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  })

  if (!verificationToken) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-cream">Invalid Link</h1>
        <p className="text-sm text-beige">This verification link is invalid or has already been used.</p>
        <Button asChild className="bg-gold text-navy hover:bg-gold/90 w-full"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  if (new Date() > verificationToken.expires) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-cream">Link Expired</h1>
        <p className="text-sm text-beige">This verification link has expired. Please sign in to request a new one.</p>
        <Button asChild className="bg-gold text-navy hover:bg-gold/90 w-full"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  // Valid token -> verify user
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  })

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-display text-cream">Email Verified!</h1>
      <p className="text-sm text-beige">Your email has been successfully verified. You can now access your account.</p>
      <Button asChild className="bg-gold text-navy hover:bg-gold/90 w-full"><Link href="/login">Go to Login</Link></Button>
    </div>
  )
}
