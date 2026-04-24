"use client"

import { useState, use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations"
import { resetPasswordAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = use(searchParams)
  const token = resolvedParams.token as string | undefined
  const email = resolvedParams.email as string | undefined

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "", password: "", confirmPassword: "" },
  })

  if (!token || !email) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-cream">Invalid Link</h1>
        <p className="text-sm text-beige">Missing reset token or email.</p>
        <Button asChild className="bg-gold text-navy hover:bg-gold/90 w-full"><Link href="/login">Go to Login</Link></Button>
      </div>
    )
  }

  async function onSubmit(data: ResetPasswordInput) {
    setIsPending(true)
    setError(null)
    setSuccess(null)
    
    // We already checked email exists above
    const res = await resetPasswordAction(data, email as string)
    
    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(res.success)
      form.reset()
    }
    setIsPending(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display text-cream">Create New Password</h1>
        <p className="text-sm text-beige">Please enter your new password below.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <div className="space-y-4">
          <Alert className="bg-green-500/10 text-green-400 border-green-500/20">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
          <Button asChild className="w-full bg-gold text-navy hover:bg-gold/90">
            <Link href="/login">Login Now</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-beige">New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-cream placeholder:text-white/30" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-beige">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-cream placeholder:text-white/30" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold/90 font-medium" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
