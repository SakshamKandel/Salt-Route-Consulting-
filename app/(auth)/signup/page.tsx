"use client"

import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupInput } from "@/lib/validations"
import { signupAction } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { getSafeCallback } from "@/lib/auth-utils"

function SignupForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  })
  const callbackParam = searchParams.get("callbackUrl")
  const loginHref = callbackParam ? `/login?callbackUrl=${encodeURIComponent(callbackParam)}` : "/login"

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

  const handleGoogleLogin = () => {
    setIsPending(true)
    setError(null)
    const callbackUrl = getSafeCallback(searchParams.get("callbackUrl"))
    signIn("google", { 
      callbackUrl: callbackUrl || undefined 
    })
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Create an Account</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Join Salt Route</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 rounded-none">
          <AlertDescription className="text-xs uppercase tracking-widest">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 text-green-400 border-green-500/20 rounded-none">
          <AlertDescription className="text-xs uppercase tracking-widest">{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Aarav Sharma" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+977 98XXXXXXXX" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Password</FormLabel>
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
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
          
          <div className="text-[9px] text-charcoal/40 pb-2 uppercase tracking-widest leading-loose text-center font-semibold">
            By signing up, you agree to our <Link href="/terms" className="text-charcoal hover:text-gold transition-colors font-bold">Terms</Link> and <Link href="/privacy" className="text-charcoal hover:text-gold transition-colors font-bold">Privacy Policy</Link>.
          </div>

          <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors" disabled={isPending || !!success}>
            {isPending ? "Creating..." : "Sign up"}
          </Button>
        </form>
      </Form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal/10"></div>
        </div>
        <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]">
          <span className="bg-white px-4 text-charcoal/30 font-bold">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white uppercase tracking-[0.3em] text-[10px] py-6 rounded-none transition-all duration-300 group"
        onClick={handleGoogleLogin}
        disabled={isPending}
      >
        <svg className="mr-3 h-4 w-4 transition-colors group-hover:fill-white" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </Button>

      <div className="text-center text-[10px] uppercase tracking-[0.2em] text-charcoal/50 pt-6 border-t border-charcoal/10 font-semibold">
        Already registered?{" "}
        <Link href={loginHref} className="text-charcoal hover:text-gold transition-colors font-bold">
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
