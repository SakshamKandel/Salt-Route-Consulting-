"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { LottieAnimation } from "@/components/ui/lottie-animation"
import { EASE } from "@/components/public/motion"
import srgAnimation from "@/lib/animations/srg.json"

type Message = { role: "user" | "assistant"; content: string }

const GREETING =
  "Namaste! I'm the Salt Route concierge. Ask me anything about our stays, locations, or planning your trip — and whenever you're ready to book, I'll connect you with our team."

const WHATSAPP_HREF =
  "https://wa.me/9779801300001?text=Hi%20Salt%20Route%2C%20I%27d%20like%20to%20know%20more"

const ERROR_REPLY =
  "Apologies — I had a little trouble just now. Our team would love to help directly on WhatsApp at +977 9801300001."

const PLACEHOLDERS = [
  "How else can I help?",
  "What is the weather like tomorrow?",
  "Can you arrange an airport transfer?",
  "What are the dining options?",
  "Tell me about the nearby attractions...",
]

export function AiConcierge() {
  const reduce = useReducedMotion()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // AI Chat Input State
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the newest message whenever the conversation grows or the
  // typing indicator toggles.
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, open])

  // Cycle placeholder text when input is inactive. The interval pauses while
  // the tab is hidden and never runs under prefers-reduced-motion.
  useEffect(() => {
    if (reduce || isActive || input) return

    let interval: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (interval) return
      interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
      }, 3000)
    }
    const stop = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") start()
      else stop()
    }

    onVisibilityChange()
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [reduce, isActive, input])

  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!input) setIsActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [input])

  const handleActivate = () => setIsActive(true)

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages: Message[] = [...messages, { role: "user", content: text }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    setIsActive(false) // Collapse input row

    try {
      const res = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? ERROR_REPLY },
      ])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: ERROR_REPLY }])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  // Single fixed wrapper with isolation:isolate creates one stacking context
  // for both the launcher button and the chat panel, guaranteeing they sit
  // above Leaflet map panes (z 200–700) and zoom controls (z 1000) regardless
  // of framer-motion transforms on the panel.
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none [isolation:isolate]">
      {/* Floating concierge launcher (bottom-right corner). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge chat" : "Open Salt Route concierge chat"}
        className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-gold/70 bg-navy text-cream shadow-[0_4px_20px_rgba(16,41,67,0.18)] transition-colors duration-300 hover:bg-navy-light"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="concierge-panel"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : 16,
              transition: reduce
                ? { duration: 0 }
                : { duration: 0.25, ease: EASE.standard },
            }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.3, ease: EASE.standard }
            }
            className="pointer-events-auto absolute bottom-[74px] right-4 sm:bottom-[90px] sm:right-8 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2px] border border-navy/10 bg-cream shadow-[0_12px_48px_rgba(16,41,67,0.10)]"
            style={{ height: "min(72vh, 600px)" }}
            role="dialog"
            aria-label="Salt Route Concierge"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy/10 bg-cream px-4 sm:px-6 py-4 sm:py-5 shrink-0">
              <h2 className="font-sans text-[12px] font-medium uppercase tracking-[0.24em] text-navy">
                Ask Salt Route AI
              </h2>
              <div className="flex items-center gap-3">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener"
                  className="relative font-sans text-[10px] uppercase tracking-[0.2em] text-gold-dark transition-colors duration-300 hover:text-navy after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[400ms] after:ease-out-quart hover:after:scale-x-100"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close concierge chat"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 transition-colors duration-300 hover:bg-beige hover:text-navy"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-5 overflow-y-auto bg-cream px-4 sm:px-6 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-navy/10"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={`msg-${i}`}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE.standard }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-3 items-end"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-navy/10 bg-cream">
                        <LottieAnimation
                          animationData={srgAnimation}
                          loop
                          autoplay={!reduce}
                          className="h-8 w-8"
                        />
                      </div>
                    )}
                    <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[100%] rounded-[2px] px-5 py-4 font-sans text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-beige text-navy"
                            : "border border-navy/10 bg-sand text-navy/80"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    key="loading-indicator"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE.standard }}
                    className="flex justify-start gap-3 items-end"
                  >
                    <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-navy/10 bg-cream">
                      <LottieAnimation
                        animationData={srgAnimation}
                        loop
                        autoplay={!reduce}
                        className="h-8 w-8"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex h-[54px] items-center gap-2 rounded-[2px] border border-navy/10 bg-sand px-5 py-4">
                        <span className="flex gap-1">
                          {[0, 0.2, 0.4].map((delay) =>
                            reduce ? (
                              <span key={delay} className="h-1.5 w-1.5 rounded-full bg-navy/40" />
                            ) : (
                              <motion.span
                                key={delay}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.4, ease: EASE.standard, delay }}
                                className="h-1.5 w-1.5 rounded-full bg-navy/40"
                              />
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input row */}
            <div className="shrink-0 bg-cream px-4 sm:px-6 pb-6 pt-2">
              <div
                ref={wrapperRef}
                onClick={handleActivate}
                className="flex w-full flex-col items-stretch overflow-hidden rounded-[2px] border border-navy/15 bg-cream transition-colors duration-300 focus-within:border-navy/40"
              >
                <div className="flex h-[60px] w-full shrink-0 items-center gap-2 px-2 py-1.5">
                  {/* Text Input & Placeholder */}
                  <div className="relative flex h-full flex-1 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      onFocus={handleActivate}
                      disabled={loading}
                      className="relative z-10 w-full border-0 bg-transparent pl-4 pr-2 font-sans text-sm text-navy outline-0 focus:outline-none disabled:opacity-60"
                    />
                    <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center px-4">
                      <AnimatePresence mode="wait">
                        {!isActive && !input && (
                          <motion.span
                            key={placeholderIndex}
                            initial={reduce ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                              opacity: 0,
                              transition: reduce
                                ? { duration: 0 }
                                : { duration: 0.2, ease: EASE.standard },
                            }}
                            transition={
                              reduce
                                ? { duration: 0 }
                                : { duration: 0.4, ease: EASE.standard }
                            }
                            className="pointer-events-none absolute left-4 right-10 top-1/2 -translate-y-1/2 select-none font-sans text-sm text-navy/40"
                            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", zIndex: 0 }}
                          >
                            {PLACEHOLDERS[placeholderIndex]}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || input.trim().length === 0}
                    aria-label="Send message"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      input.trim().length > 0
                        ? "bg-navy text-cream hover:bg-navy-dark"
                        : "bg-beige text-navy/40"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Send className="ml-0.5 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
