import * as React from "react"
import {
  EmailLayout,
  HeadlineText,
  BodyText,
  GoldRule,
  CHARCOAL,
  sans,
} from "./EmailLayout"

interface CampaignEmailProps {
  subject: string
  body: string
}

export default function CampaignEmail({ subject, body }: CampaignEmailProps) {
  const paragraphs = body.split(/\n{2,}/).filter(Boolean)
  return (
    <EmailLayout preview={subject}>
      <HeadlineText>{subject}</HeadlineText>
      <GoldRule />
      {paragraphs.map((para, i) => (
        <BodyText key={i} align="left">
          {para.replace(/\n/g, " ")}
        </BodyText>
      ))}
      <GoldRule />
      <BodyText
        style={{ fontSize: "10px", opacity: 0.5, textAlign: "center" as const }}
        align="center"
      >
        You are receiving this email as a registered member of Salt Route Consulting.
      </BodyText>
    </EmailLayout>
  )
}
