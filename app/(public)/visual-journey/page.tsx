import type { Metadata } from "next"
import { VisualJourneyPage } from "./VisualJourneyPage"

export const metadata: Metadata = {
  title: "Visual Journey: Tapestry of Nepal",
  description:
    "Thirteen windows into Nepal — from Kathmandu's Durbar Squares to the high desert of Mustang, the Himalayas, festivals, food, and the artisans who keep it all alive.",
}

export default function Page() {
  return <VisualJourneyPage />
}
