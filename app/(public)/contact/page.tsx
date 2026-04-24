"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to send message.")
        return
      }
      setSent(true)
      toast.success("Message sent! We'll be in touch within 24 hours.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* Header */}
      <div className="bg-navy py-20 text-center px-4">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">Contact Us</h1>
        <p className="text-cream/60 max-w-xl mx-auto">
          Whether you have a specific property in mind or just a date and a dream — we&apos;d love to help.
        </p>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact info */}
        <div>
          <h2 className="font-display text-2xl text-navy mb-8">Reach Us Directly</h2>
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "info@saltroutegroup.com", href: "mailto:info@saltroutegroup.com" },
              { icon: Phone, label: "Phone / WhatsApp", value: "+977 98-0000-0000", href: "tel:+9779800000000" },
              { icon: MapPin, label: "Office", value: "Kathmandu, Nepal" },
              { icon: Clock, label: "Response Time", value: "Within 24 hours" },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-navy/40 font-semibold mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-navy hover:text-gold transition-colors">{value}</a>
                  ) : (
                    <p className="text-navy">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-navy rounded-2xl text-cream">
            <p className="font-display text-lg mb-2">Prefer WhatsApp?</p>
            <p className="text-cream/60 text-sm mb-4">Chat with our team directly on WhatsApp for the fastest response.</p>
            <Button asChild className="bg-[#25D366] hover:bg-[#1da855] text-white">
              <a href="https://wa.me/9779800000000" target="_blank" rel="noopener noreferrer">
                Open WhatsApp Chat
              </a>
            </Button>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-500" />
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">Message Received!</h2>
              <p className="text-navy/60">We&apos;ll reply within 24 hours. Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" name="phone" placeholder="+977 98..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" name="subject" required placeholder="e.g. Booking inquiry — Nagarkot villa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Tell us about your travel plans, dates, group size, and any special requirements..."
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
              <p className="text-xs text-navy/40 text-center">
                By submitting, you agree to our{" "}
                <a href="/privacy" className="underline hover:text-navy">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
