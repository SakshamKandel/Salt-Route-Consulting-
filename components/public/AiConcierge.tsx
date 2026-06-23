"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { LottieAnimation } from "@/components/ui/lottie-animation"
import srgAnimation from "@/lib/animations/srg.json"

type Message = { role: "user" | "assistant"; content: string }

const GREETING =
  "Namaste! I'm the Salt Route Corp concierge. Ask me anything about our stays, locations, or planning your trip - and whenever you're ready to book, I'll connect you with our team."

const WHATSAPP_HREF =
  "https://wa.me/9779765978384?text=Hi%20Salt%20Route%20Corp%2C%20I%27d%20like%20to%20know%20more"

const ERROR_REPLY =
  "Apologies - I had a little trouble just now. Our team would love to help directly on WhatsApp at +977 976-5978384."

const PLACEHOLDERS = [
  "How else can I help?",
  "What is the weather like tomorrow?",
  "Can you arrange an airport transfer?",
  "What are the dining options?",
  "Tell me about the nearby attractions...",
]

const placeholderContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.025 } },
  exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
}

const letterVariants: Variants = {
  initial: { opacity: 0, filter: "blur(12px)", y: 10 },
  animate: {
    opacity: 1, filter: "blur(0px)", y: 0,
    transition: { opacity: { duration: 0.25 }, filter: { duration: 0.4 }, y: { type: "spring", stiffness: 80, damping: 20 } },
  },
  exit: {
    opacity: 0, filter: "blur(12px)", y: -10,
    transition: { opacity: { duration: 0.2 }, filter: { duration: 0.3 }, y: { type: "spring", stiffness: 80, damping: 20 } },
  },
}

export function AiConcierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // AI Chat Input State
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
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

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || input) return

    const interval = setInterval(() => {
      setShowPlaceholder(false)
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
        setShowPlaceholder(true)
      }, 400)
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive, input])

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
          messages: nextMessages
            .filter((m) => m.role === "user")
            .map((m) => ({ role: m.role, content: m.content })),
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

  return (
    <>
      {/* Floating concierge launcher (bottom-right corner). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge chat" : "Open Salt Route Corp concierge chat"}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1B3A5C] to-[#0F2033] text-white shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Subtle ping animation on the launcher */}
        {!open && <span className="absolute right-0 top-0 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60 opacity-75"></span><span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span></span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="concierge-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[74px] right-4 sm:bottom-[90px] sm:right-8 z-[61] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl sm:rounded-[32px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100"
            style={{ height: "min(72vh, 600px)" }}
            role="dialog"
            aria-label="Salt Route Concierge"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-white shrink-0 border-b border-slate-50">
              <h2 className="font-sans text-base font-semibold text-slate-800">Ask Salt Route Corp AI</h2>
              <div className="flex items-center gap-2">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 font-sans text-[11px] font-semibold text-[#2E7D32] transition-colors hover:bg-[#C8E6C9]"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close concierge chat"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-5 overflow-y-auto bg-white px-4 sm:px-6 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={`msg-${i}`}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    layout
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-3 items-end"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 mb-1 overflow-hidden">
                        <LottieAnimation animationData={srgAnimation} loop className="h-8 w-8" />
                      </div>
                    )}
                    <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[100%] px-5 py-4 font-sans text-[15px] leading-relaxed shadow-sm ${
                          m.role === "user"
                            ? "rounded-3xl rounded-tr-md bg-[#F0F7FF] text-[#0070E0]"
                            : "rounded-3xl rounded-tl-md bg-[#F3F4F6] text-slate-700"
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
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    layout
                    className="flex justify-start gap-3 items-end"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 mb-1 overflow-hidden">
                      <LottieAnimation animationData={srgAnimation} loop className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 rounded-3xl rounded-tl-md bg-[#F3F4F6] px-5 py-4 shadow-sm h-[54px]">
                        <span className="flex gap-1">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input row */}
            <div className="bg-white px-4 sm:px-6 pb-6 pt-2 shrink-0">
              <motion.div
                ref={wrapperRef}
                className="w-full flex flex-col items-stretch overflow-hidden rounded-[30px] bg-white border border-slate-200 shadow-sm"
                variants={{
                  collapsed: {
                    height: 60,
                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                    transition: { type: "spring", stiffness: 120, damping: 18 },
                  },
                  expanded: {
                    height: 60, // Don't expand vertically since we removed the buttons
                    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.12)",
                    transition: { type: "spring", stiffness: 120, damping: 18 },
                  },
                }}
                animate={isActive || input ? "expanded" : "collapsed"}
                initial="collapsed"
                onClick={handleActivate}
              >
                <div className="flex items-center gap-2 px-2 py-1.5 w-full h-[60px] shrink-0">
                  {/* Text Input & Placeholder */}
                  <div className="relative flex-1 h-full flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      onFocus={handleActivate}
                      disabled={loading}
                      maxLength={1000}
                      className="w-full border-0 outline-0 bg-transparent pl-4 pr-2 font-sans text-sm text-slate-800 focus:outline-none disabled:opacity-60 relative z-10"
                    />
                    <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-4">
                      <AnimatePresence mode="wait">
                        {showPlaceholder && !isActive && !input && (
                          <motion.span
                            key={placeholderIndex}
                            className="absolute left-4 right-10 top-1/2 -translate-y-1/2 text-slate-400 font-sans text-sm select-none pointer-events-none"
                            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", zIndex: 0 }}
                            variants={placeholderContainerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            {PLACEHOLDERS[placeholderIndex].split("").map((char, i) => (
                              <motion.span key={i} variants={letterVariants} style={{ display: "inline-block" }}>
                                {char === " " ? "\u00A0" : char}
                              </motion.span>
                            ))}
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                      input.trim().length > 0 
                        ? "bg-[#1B3A5C] text-white hover:bg-[#122941] shadow-md scale-100" 
                        : "bg-slate-100 text-slate-400 scale-95"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
