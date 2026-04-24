"use client"

import { useState, use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { acceptInviteAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: token || "", name: "", password: "", confirmPassword: "" },
  })

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-cream">Invalid Link</h1>
        <p className="text-sm text-beige">Missing invitation token.</p>
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display text-cream">Accept Invitation</h1>
        <p className="text-sm text-beige">Set up your profile to join the team.</p>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-beige">Create Password</FormLabel>
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
            <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold/90 font-medium" disabled={isPending}>
              {isPending ? "Setting up account..." : "Accept & Join"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
