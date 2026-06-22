"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Lang = { code: string; label: string; short: string }

const LANGUAGES: Lang[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "nl", label: "Nederlands", short: "NL" },
]

/** Read the language currently applied by Google Translate from its cookie. */
function readCurrentLang(): string {
  if (typeof document === "undefined") return "en"
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/)
  if (!match) return "en"
  // Cookie value looks like "/en/es" — the last segment is the active language.
  const parts = decodeURIComponent(match[1]).split("/")
  const code = parts[parts.length - 1]
  return LANGUAGES.some((l) => l.code === code) ? code : "en"
}

/** Write the googtrans cookie on every host variant so Google picks it up. */
function setGoogTransCookie(code: string) {
  const value = code === "en" ? "" : `/en/${code}`
  const host = window.location.hostname
  // Cover bare host, dotted host (subdomains), and path=/ so it survives navigation.
  const variants = [
    `googtrans=${value};path=/`,
    `googtrans=${value};path=/;domain=${host}`,
    `googtrans=${value};path=/;domain=.${host}`,
  ]
  // When clearing (back to English) we must expire the cookie, not just blank it.
  const expiry = code === "en" ? ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : ""
  variants.forEach((v) => {
    document.cookie = v + expiry
  })
}

interface LanguageSwitcherProps {
  /** True when the nav sits over a hero (transparent bg) and needs light text. */
  transparent?: boolean
  /** "desktop" = compact inline dropdown, "mobile" = stacked list for the menu. */
  variant?: "desktop" | "mobile"
  onSelect?: () => void
}

let scriptInjected = false

export function LanguageSwitcher({
  transparent = false,
  variant = "desktop",
  onSelect,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string>("en")
  const ref = useRef<HTMLDivElement>(null)

  // Inject the Google Translate widget once for the whole app.
  useEffect(() => {
    setCurrent(readCurrentLang())

    if (scriptInjected) return
    scriptInjected = true

    // Global init callback the Google script invokes once loaded.
    ;(window as unknown as { googleTranslateElementInit: () => void }).googleTranslateElementInit =
      () => {
        const g = (window as unknown as {
          google?: { translate?: { TranslateElement: new (opts: object, el: string) => void } }
        }).google
        if (!g?.translate) return
        new g.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element"
        )
      }

    const s = document.createElement("script")
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    s.async = true
    document.body.appendChild(s)
  }, [])

  // Close on outside click / escape (desktop dropdown only).
  useEffect(() => {
    if (variant !== "desktop") return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [variant])

  const choose = useCallback(
    (code: string) => {
      if (code === current) {
        setOpen(false)
        onSelect?.()
        return
      }
      setGoogTransCookie(code)
      // Reload so Google Translate re-renders the full page (incl. DB content)
      // in the chosen language and the cookie persists across navigation.
      window.location.reload()
    },
    [current, onSelect]
  )

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  if (variant === "mobile") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            className={`text-sm uppercase tracking-[0.2em] font-sans transition-colors ${
              l.code === current
                ? "text-charcoal"
                : "text-charcoal/40 hover:text-charcoal/70"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }

  const triggerColor = transparent
    ? "text-charcoal/70 md:text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
    : "text-charcoal/40 hover:text-charcoal/70"

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Select language"
        className={`flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] font-sans font-medium transition-colors duration-300 ${triggerColor}`}
      >
        {active.short}
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full mt-4 min-w-[150px] bg-cream/95 backdrop-blur-xl border border-charcoal/10 shadow-xl py-2 z-[10002]"
          >
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => choose(l.code)}
                  className={`w-full text-left px-5 py-2.5 text-sm tracking-[0.15em] uppercase font-sans transition-colors ${
                    l.code === current
                      ? "text-charcoal bg-charcoal/[0.04]"
                      : "text-charcoal/55 hover:text-charcoal hover:bg-charcoal/[0.03]"
                  }`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
