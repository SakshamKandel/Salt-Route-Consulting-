"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflowX: "hidden" }}
    >
      {children}
    </motion.div>
  )
}
