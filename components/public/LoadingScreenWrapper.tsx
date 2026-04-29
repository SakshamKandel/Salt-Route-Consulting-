"use client"

import dynamic from "next/dynamic"

const LoadingScreen = dynamic(
  () => import("./LoadingScreen").then((m) => m.LoadingScreen),
  { ssr: false }
)

export function LoadingScreenWrapper() {
  return <LoadingScreen />
}
