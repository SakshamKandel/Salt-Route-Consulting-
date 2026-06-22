"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, Check, RotateCcw, X, Bot, User, ChevronRight, Wand2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LottieAnimation } from "@/components/ui/lottie-animation"
import srgAnimation from "@/lib/animations/srg.json"

type Question = {
  key: string
  question: string
  placeholder: string
  example: string
}

const QUESTIONS: Question[] = [
  {
    key: "name",
    question: "Let's get started! What would you like to name your property?",
    placeholder: "e.g. Sunshine Villa",
    example: "Sunshine Villa",
  },
  {
    key: "location",
    question: "Great name! Now, where is this beautiful place located?",
    placeholder: "e.g. Ilam, Eastern Nepal",
    example: "Ilam, Eastern Nepal",
  },
  {
    key: "type",
    question: "Nice! What kind of property are we creating? A boutique lodge, villa, or something else?",
    placeholder: "e.g. Boutique lodge, heritage villa, mountain retreat...",
    example: "Boutique mountain lodge",
  },
  {
    key: "vibe",
    question: "Perfect! Paint me a picture — what's the feel of this place? Views, architecture, the atmosphere guests will experience?",
    placeholder: "What makes it special? Views, architecture, atmosphere...",
    example: "A quiet hillside retreat with panoramic tea garden views, built from local stone and timber with warm Nepali hospitality.",
  },
  {
    key: "guestLove",
    question: "Sounds wonderful! What are the top 3 things that will make guests fall in love with your place?",
    placeholder: "e.g. Sunrise views, home-cooked meals, guided tea walks...",
    example: "Sunrise over the Himalayas, organic farm-to-table dining, and private guided walks through tea estates.",
  },
  {
    key: "amenities",
    question: "What comforts and facilities can guests expect? Think about what makes a stay truly special.",
    placeholder: "e.g. WiFi, heated blankets, ensuite bathrooms, fireplace...",
    example: "High-speed WiFi, heated blankets, ensuite bathrooms with hot showers, fireplace lounge, and organic toiletries.",
  },
  {
    key: "roomTypes",
    question: "Tell me about your rooms! How many room types do you have, what are they called, and roughly how much per night?",
    placeholder: "e.g. 2 Deluxe Rooms at NPR 4500, 1 Suite at NPR 8000...",
    example: "3 Garden View Rooms at NPR 3500 per night (2 guests each), 2 Deluxe Suites at NPR 6500 per night (4 guests each), and 1 Family Cottage at NPR 9000 per night (6 guests).",
  },
  {
    key: "capacity",
    question: "Almost done! What's the total guest capacity of the entire property? Any special setup like event spaces or group bookings?",
    placeholder: "e.g. Max 16 guests, perfect for groups and retreats...",
    example: "Up to 16 guests across 6 rooms. We also have a common dining hall that seats 20 for group meals and workshops.",
  },
]

type GeneratedFields = {
  title?: string
  slug?: string
  propertyType?: string
  description?: string
  tagline?: string
  story?: string
  neighborhood?: string
  hostNote?: string
  highlights?: string[]
  amenities?: string[]
  services?: string[]
  whatToExpect?: string[]
  rules?: string[]
  highlightsTitle?: string
  amenitiesTitle?: string
  maxGuests?: number
  roomTypes?: {
    name: string
    classType: string
    pricePerNight: number
    maxGuests: number
    totalUnits: number
    bedrooms: number
    bathrooms: number
  }[]
}

type Message = {
  role: "bot" | "user"
  text: string
}

interface Props {
  onApply: (fields: GeneratedFields) => void
}

export function PropertyAiAssistant({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi there! I'm Salt Route AI, your property creation assistant. Think of me as your personal copywriter — I'll interview you about your property, then craft a stunning listing that makes guests want to book immediately. Just answer naturally below and I'll take care of the rest. Ready when you are!" },
  ])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<GeneratedFields | null>(null)
  const [groqStatus, setGroqStatus] = useState<"checking" | "connected" | "missing">("checking")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, generated, typing])

  useEffect(() => {
    fetch("/api/admin/ai/insights")
      .then((r) => {
        if (r.status === 503) setGroqStatus("missing")
        else if (r.ok) setGroqStatus("connected")
        else setGroqStatus("missing")
      })
      .catch(() => setGroqStatus("missing"))
  }, [])

  // Auto-focus input after any bot message or when opening
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [messages, open])

  const currentQ = QUESTIONS[step]
  const isDone = step >= QUESTIONS.length

  function askNextQuestion() {
    if (step < QUESTIONS.length) {
      setMessages((prev) => [...prev, { role: "bot", text: QUESTIONS[step].question }])
    }
  }

  async function askAiReply(userAnswer: string) {
    setTyping(true)
    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(-6),
          currentQuestion: currentQ?.question ?? "",
          userAnswer,
          step,
          totalSteps: QUESTIONS.length,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "AI reply failed")
      setTyping(false)
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }])
    } catch (e) {
      setTyping(false)
      setMessages((prev) => [...prev, { role: "bot", text: "Thanks for that! Let me keep going." }])
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")

    if (!currentQ) return

    const nextAnswers = { ...answers, [currentQ.key]: text }
    setAnswers(nextAnswers)
    const nextStep = step + 1
    setStep(nextStep)

    if (nextStep >= QUESTIONS.length) {
      await askAiReply(text)
      setMessages((prev) => [...prev, { role: "bot", text: "Perfect — I now have everything I need. Let me craft your property listing. I'll write the title, description, story, highlights, amenities, services, house rules, and more. This will take just a few seconds…" }])
      generateAll(nextAnswers)
    } else {
      await askAiReply(text)
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text: QUESTIONS[nextStep].question }])
      }, 400)
    }
  }

  function goBack() {
    if (step <= 0) return
    const prevStep = step - 1
    const prevKey = QUESTIONS[prevStep].key
    const newAnswers = { ...answers }
    delete newAnswers[prevKey]
    setAnswers(newAnswers)
    setStep(prevStep)
    setMessages((prev) => {
      // Trim back to before the previous question was asked
      const qIndex = prev.findIndex((m, i) => m.role === "bot" && i > 0 && QUESTIONS[prevStep].question === m.text)
      if (qIndex >= 0) return prev.slice(0, qIndex)
      // Fallback: just keep welcome and ask again
      return prev.slice(0, 1)
    })
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: `No problem! Let's go back. ${QUESTIONS[prevStep].question}` }])
    }, 200)
  }

  async function generateAll(finalAnswers: Record<string, string>) {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/ai/property-compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setGenerated(data.fields)
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "All done! I've written your complete property listing. Here's what I created — a title, tagline, description, the story of your place, neighborhood notes, highlights, amenities, services, what guests can expect, and even house rules." },
        { role: "bot", text: "Scroll down to review the preview. If you like it, click 'Apply to Form' and I'll fill in all the fields below automatically. You can still edit anything afterwards!" },
      ])
    } catch (e) {
      setMessages((prev) => [...prev, { role: "bot", text: `Sorry, I couldn't generate the content: ${e instanceof Error ? e.message : "Unknown error"}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (generated) {
      onApply(generated)
      setMessages((prev) => [...prev, { role: "bot", text: "Done! I've filled in all the form fields below. Feel free to tweak anything — change titles, add more amenities, or adjust the story. When you're ready, just hit 'Create Property' at the bottom of the page." }])
    }
  }

  function handleRestart() {
    setMessages([{ role: "bot", text: "Fresh start! I'm Salt Route AI, ready to help you create another beautiful property listing. What's the name of this new property?" }])
    setAnswers({})
    setStep(0)
    setGenerated(null)
    setInput("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          if (messages.length === 1 && step === 0) {
            setTimeout(() => askNextQuestion(), 300)
          }
        }}
        className="w-full group relative flex items-center justify-between bg-gradient-to-r from-[#1B3A5C] to-slate-800 p-1 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#1B3A5C]/20"
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
            <Sparkles className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <div className="text-left">
            <h3 className="text-[14px] font-semibold text-white tracking-wide">Salt Route AI</h3>
            <p className="text-[12px] text-white/70 mt-0.5 font-light">Generate your entire property listing in seconds</p>
          </div>
        </div>
        <div className="pr-5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B3A5C] to-slate-800 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight leading-tight">Salt Route AI</h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Listing Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {generated && (
            <button type="button" onClick={handleRestart} className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1.5 transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-50">
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="h-[450px] overflow-y-auto px-6 py-6 space-y-6 bg-[#F8FAFC]">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 max-w-[88%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${m.role === "bot" ? "bg-[#1B3A5C]" : "bg-[#C9A96E] text-white"}`}>
              {m.role === "bot" ? <img src="/logo.png" alt="AI" className="w-5 h-5 object-contain" /> : <User className="w-4 h-4" />}
            </div>
            {/* Message Bubble */}
            <div className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : ""}`}>
              <span className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${m.role === "bot" ? "pl-1" : "pr-1"}`}>
                {m.role === "bot" ? "Salt Route AI" : "You"}
              </span>
              <div className={`text-[14px] leading-relaxed px-5 py-3.5 shadow-sm ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm" : "bg-[#1B3A5C] text-white rounded-2xl rounded-tr-sm"}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {(typing || loading) && (
          <div className="flex gap-3 max-w-[88%]">
            <div className="w-8 h-8 rounded-full bg-[#1B3A5C] shadow-sm flex items-center justify-center shrink-0 mt-1">
              <img src="/logo.png" alt="AI" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Salt Route AI</span>
              <div className="bg-white border border-slate-200 text-slate-500 text-[13px] px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <LottieAnimation animationData={srgAnimation} loop className="h-6 w-6 opacity-70" />
                <span>{loading ? "Crafting your listing..." : "Thinking..."}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Preview */}
      {generated && (
        <div className="border-t border-slate-200 bg-white p-6 max-h-[300px] overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-800">Your Listing is Ready!</p>
              <p className="text-xs text-slate-500 mt-0.5">Review the generated content below. You can edit it directly in the form later.</p>
            </div>
            <button type="button" onClick={handleApply} className="shrink-0 inline-flex items-center justify-center gap-2 bg-[#1B3A5C] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#1B3A5C]/90 transition-colors shadow-sm">
              <Check className="w-4 h-4" /> Apply to Form
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            {generated.title && <PreviewRow label="Title" value={generated.title} />}
            {generated.tagline && <PreviewRow label="Tagline" value={generated.tagline} />}
            {generated.propertyType && <PreviewRow label="Property Type" value={generated.propertyType} />}
            {generated.highlights && generated.highlights.length > 0 && <PreviewRow label="Highlights" value={generated.highlights.join(" · ")} />}
            {generated.amenities && generated.amenities.length > 0 && <PreviewRow label="Amenities" value={generated.amenities.join(" · ")} />}
            {generated.services && generated.services.length > 0 && <PreviewRow label="Services" value={generated.services.join(" · ")} />}
            {generated.whatToExpect && generated.whatToExpect.length > 0 && <PreviewRow label="What to Expect" value={generated.whatToExpect.join(" · ")} />}
          </div>
          {generated.description && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Description</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">{generated.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress & Input Area */}
      {!isDone && (
        <div className="bg-white border-t border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <>
                  <button type="button" onClick={goBack} className="text-xs text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 font-medium">
                    <RotateCcw className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </>
              )}
              <span className="text-xs text-slate-400 font-medium">
                Question <span className="text-slate-700 font-semibold">{Math.min(step + 1, QUESTIONS.length)}</span> of {QUESTIONS.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? "w-4 bg-[#C9A96E]" : i === step ? "w-6 bg-[#1B3A5C]" : "w-1.5 bg-slate-200"}`} />
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSend()
                }
              }}
              placeholder={currentQ?.placeholder ?? "Type your answer here..."}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all placeholder:text-slate-400 shadow-inner"
              disabled={typing || loading}
            />
            <button 
              type="button" 
              onClick={handleSend} 
              disabled={!input.trim() || typing || loading} 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          
          {currentQ?.example && (
            <div className="mt-3 px-1">
              <button
                type="button"
                onClick={async () => {
                  const example = currentQ?.example ?? ""
                  if (!example) return
                  setInput(example)
                  setTimeout(() => inputRef.current?.focus(), 50)
                }}
                disabled={typing || loading}
                className="text-[12px] text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40 font-medium text-left inline-flex items-start gap-2"
              >
                <span className="shrink-0 text-[#C9A96E] font-semibold mt-0.5">Idea:</span>
                <span className="font-light leading-snug">{currentQ.example}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-[13px] text-slate-700 mt-1 truncate font-medium">{value}</p>
    </div>
  )
}
