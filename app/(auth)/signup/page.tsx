"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupInput } from "@/lib/validations"
import { signupAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: SignupInput) {
    // Basic Honeypot Check
    const honeypot = (document.getElementById("website-url") as HTMLInputElement)?.value
    if (honeypot) return // silently reject bots

    setIsPending(true)
    setError(null)
    setSuccess(null)
    
    const res = await signupAction(data)
    
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
        <h1 className="text-2xl font-display text-cream">Create an account</h1>
        <p className="text-sm text-beige">Join Salt Route to book your next stay.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 text-green-400 border-green-500/20">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot field for bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website-url">Website URL</label>
            <input type="text" id="website-url" name="website-url" tabIndex={-1} autoComplete="off" />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-beige">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className="bg-white/5 border-white/10 text-cream placeholder:text-white/30" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-beige">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" className="bg-white/5 border-white/10 text-cream placeholder:text-white/30" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-beige">Password</FormLabel>
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
                <FormLabel className="text-beige">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-cream placeholder:text-white/30" {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <div className="text-xs text-beige/70 pb-2">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>

          <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold/90 font-medium" disabled={isPending || !!success}>
            {isPending ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-beige">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
