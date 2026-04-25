"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations"
import { forgotPasswordAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsPending(true)
    setError(null)
    setSuccess(null)
    
    const res = await forgotPasswordAction(data)
    
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
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Reset Password</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold leading-loose">Enter your email and we&apos;ll send you a link<br/>to reset your password.</p>
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
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      )}

      <div className="text-center pt-6 border-t border-charcoal/10">
        <Link href="/login" className="text-charcoal hover:text-gold transition-colors font-bold uppercase tracking-[0.2em] text-[9px]">
          Back to login
        </Link>
      </div>
    </div>
  )
}
