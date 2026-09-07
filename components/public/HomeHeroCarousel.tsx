"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react"
import snowcappedMountain from "@/public/images/hero/majestic-snowcapped-mountain.jpg"
import phewaLakeBoats from "@/public/images/hero/phewa-lake-boats.jpg"
import summerMountain from "@/public/images/hero/summer-mountain-landscape.jpg"
import wildlifeRhino from "@/public/images/hero/kaziranga-wildlife.jpg"

const slides = [
  { image: snowcappedMountain, alt: "Majestic snowcapped mountain in clouds" },
  { image: phewaLakeBoats, alt: "Colorful boats on Phewa Lake in Pokhara at sunset" },
  { image: summerMountain, alt: "Summer mountain landscape with rolling hills" },
  { image: wildlifeRhino, alt: "Serene wildlife scene at Kaziranga National Park" },
]

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (paused || hovered) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const timer = window.setInterval(() => {
      if (!motion.matches && !document.hidden && !document.querySelector("#site-menu[open]")) {
        setActive(index => (index + 1) % slides.length)
      }
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, hovered])

  function select(index: number) {
    setPaused(true)
    setActive((index + slides.length) % slides.length)
  }

  return <section className="editorial-hero editorial-hero-home editorial-hero-carousel" aria-label="Discover Nepal" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={event => { if (!(event.target as HTMLElement).closest(".editorial-hero-play")) setPaused(true) }}>
    {slides.map((slide, index) => <div key={slide.alt} className={`editorial-hero-slide${index === active ? " is-active" : ""}`} aria-hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
      <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" className="object-cover" />
    </div>)}
    <div className="editorial-hero-shade" />
    <div className="editorial-hero-content"><h1>A quieter way to discover Nepal</h1><Link className="editorial-link" href="/properties">Discover our stays</Link></div>
    <div className="editorial-hero-controls">
      <button onClick={() => select(active - 1)} aria-label="Previous photograph"><ArrowLeft size={18} strokeWidth={1.3} /></button>
      <div className="editorial-hero-dots">{slides.map((slide, index) => <button key={slide.alt} aria-label={`Show photograph ${index + 1}: ${slide.alt}`} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}</div>
      <button onClick={() => select(active + 1)} aria-label="Next photograph"><ArrowRight size={18} strokeWidth={1.3} /></button>
      <button className="editorial-hero-play" onClick={() => setPaused(value => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
    </div>
  </section>
}
