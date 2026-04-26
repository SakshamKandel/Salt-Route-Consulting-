"use client"

import { useState, use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { acceptInviteAction, checkInviteTokenAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect } from "react"
import Link from "next/link"

const schema = z
  .object({
    token: z.string(),
    name: z.string().min(2, "Name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = use(searchParams)
  const token = resolvedParams.token as string | undefined

  const [tokenStatus, setTokenStatus] = useState<"loading" | "valid" | "invalid">("loading")
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: token || "", name: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid")
      setTokenError("Missing invitation token.")
      return
    }

    checkInviteTokenAction(token).then((res) => {
      if (res.error) {
        setTokenStatus("invalid")
        setTokenError(res.error)
      } else {
        setTokenStatus("valid")
      }
    })
  }, [token])

  if (tokenStatus === "loading") {
    return (
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Checking...</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Verifying your invitation link.</p>
      </div>
    )
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="space-y-10 text-center">
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Invalid Link</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-red-500/80 font-semibold">{tokenError}</p>
      </div>
    )
  }

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsPending(true)
    setError(null)
    setSuccess(null)

    const { confirmPassword: _cp, ...payload } = data
    void _cp
    const res = await acceptInviteAction(payload)

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
        <h1 className="text-2xl font-display text-charcoal uppercase tracking-widest">Accept Invitation</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">Set up your profile to join the team.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 rounded-none">
          <AlertDescription className="text-xs uppercase tracking-widest">{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <div className="space-y-6">
          <Alert className="bg-green-500/10 text-green-700 border-green-500/20 rounded-none">
            <AlertDescription className="text-xs uppercase tracking-widest">{success}</AlertDescription>
          </Alert>
          <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none transition-colors">
            <Link href="/login">Login Now</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-transparent border-charcoal/20 rounded-none text-charcoal focus-visible:ring-0 focus-visible:border-charcoal/60 placeholder:text-charcoal/30 font-sans text-sm pb-2" {...field} />
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
                  <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">Create Password</FormLabel>
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
            <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90 uppercase tracking-[0.3em] text-[10px] py-6 rounded-none mt-6 transition-colors" disabled={isPending}>
              {isPending ? "Setting up account..." : "Accept & Join"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
