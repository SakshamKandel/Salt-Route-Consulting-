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
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Invalid Link</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Missing verification token or email.</p>
        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  })

  if (!verificationToken) {
    return (
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Invalid Link</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">This verification link is invalid or has already been used.</p>
        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  if (new Date() > verificationToken.expires) {
    return (
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Link Expired</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold leading-loose">This verification link has expired.<br/>Please sign in to request a new one.</p>
        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors"><Link href="/login">Go to Login</Link></Button>
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
    <div className="space-y-10 text-center">
      <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Email Verified!</h1>
      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold leading-loose">Your email has been successfully verified.<br/>You can now access your account.</p>
      <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors"><Link href="/login">Go to Login</Link></Button>
    </div>
  )
}
