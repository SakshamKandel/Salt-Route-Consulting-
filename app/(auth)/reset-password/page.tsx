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
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Invalid Link</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Missing reset token or email.</p>
        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors"><Link href="/login">Go to Login</Link></Button>
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
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Create New Password</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Please enter your new password below.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 rounded-none">
          <AlertDescription className="text-xs uppercase tracking-widest">{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <div className="space-y-6">
          <Alert className="bg-green-500/10 text-green-500 border-green-500/20 rounded-none">
            <AlertDescription className="text-xs uppercase tracking-widest font-semibold">{success}</AlertDescription>
          </Alert>
          <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors">
            <Link href="/login">Login Now</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
