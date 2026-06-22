"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function PreviewIframe({ children, className }: { children: React.ReactNode; className?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument
    if (!doc) return

    // Copy styles from parent document into iframe head
    const copyStyles = () => {
      doc.head.innerHTML = ""
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
        doc.head.appendChild(el.cloneNode(true))
      })
      const meta = doc.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1"
      doc.head.appendChild(meta)
    }

    if (doc.readyState === "complete") {
      copyStyles()
    } else {
      iframe.onload = copyStyles
    }

    doc.body.style.margin = "0"
    doc.body.style.padding = "0"
    doc.body.style.overflowX = "hidden"
    doc.body.style.background = "transparent"

    const div = doc.createElement("div")
    doc.body.appendChild(div)
    setMountNode(div)

    // Re-copy styles when parent styles change (HMR, etc.)
    const mo = new MutationObserver(() => copyStyles())
    mo.observe(document.head, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      title="Preview"
    >
      {mountNode ? createPortal(children, mountNode) : null}
    </iframe>
  )
}
