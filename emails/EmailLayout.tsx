import { Html, Head, Body, Container, Section, Text, Hr, Preview } from '@react-email/components'
import * as React from 'react'

export const NAVY = '#1B3A5C'
export const GOLD = '#C9A96E'
export const VELLUM = '#FAF8F4'
export const CHARCOAL = '#2C2C2C'
export const MUTED = '#8B8B8B'

export const serif = "Georgia, 'Times New Roman', Times, serif"
export const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export const goldBar = {
  backgroundColor: GOLD,
  padding: '3px 0',
  lineHeight: '3px',
  fontSize: '3px',
  color: GOLD,
} as React.CSSProperties

export function LabelText({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: sans, fontSize: '9px', fontWeight: '700', color: GOLD, letterSpacing: '0.4em', textTransform: 'uppercase' as const, margin: '0 0 16px 0', lineHeight: '1' }}>
      {children}
    </Text>
  )
}

export function HeadlineText({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: serif, fontSize: '30px', fontWeight: '400', color: CHARCOAL, margin: '0 0 8px 0', lineHeight: '1.2', letterSpacing: '-0.01em' }}>
      {children}
    </Text>
  )
}

export function GoldRule() {
  return <Hr style={{ borderColor: GOLD, borderTopWidth: '1px', margin: '20px 0 28px 0', width: '48px', marginLeft: '0' }} />
}

export function BodyText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Text style={{ fontFamily: sans, fontSize: '15px', color: MUTED, lineHeight: '1.7', margin: '0 0 16px 0', ...style }}>
      {children}
    </Text>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ fontFamily: sans, fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.15em', paddingBottom: '10px', paddingRight: '20px', whiteSpace: 'nowrap' as const, verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ fontFamily: sans, fontSize: '14px', color: CHARCOAL, paddingBottom: '10px', verticalAlign: 'top', lineHeight: '1.4' }}>
        {value}
      </td>
    </tr>
  )
}

export function DetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: '20px', margin: '0 0 32px 0', backgroundColor: VELLUM, padding: '20px 24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>{children}</tbody>
      </table>
    </Section>
  )
}

interface EmailLayoutProps {
  children: React.ReactNode
  preview?: string
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Body style={{ backgroundColor: VELLUM, margin: 0, padding: '32px 0 48px', fontFamily: sans }}>
        {preview && <Preview>{preview}</Preview>}
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>

          {/* Gold top accent */}
          <Section style={goldBar}>
            <Text style={goldBar}>.</Text>
          </Section>

          {/* Header */}
          <Section style={{ backgroundColor: NAVY, padding: '36px 52px', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontSize: '28px', fontWeight: '400', color: '#FFFFFF', letterSpacing: '0.35em', textTransform: 'uppercase', margin: '0 0 8px 0', lineHeight: '1' }}>
              Salt Route
            </Text>
            <Text style={{ fontFamily: sans, fontSize: '8px', color: GOLD, letterSpacing: '0.55em', textTransform: 'uppercase', margin: 0, lineHeight: '1' }}>
              CONSULTING
            </Text>
          </Section>

          {/* Thin gold divider under header */}
          <Section style={{ ...goldBar, padding: '1.5px 0' }}>
            <Text style={{ ...goldBar, padding: '1.5px 0' }}>.</Text>
          </Section>

          {/* Content */}
          <Section style={{ backgroundColor: '#ffffff', padding: '52px 52px 44px' }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: NAVY, padding: '32px 52px', textAlign: 'center' }}>
            <Text style={{ fontFamily: sans, color: GOLD, fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0 0 14px 0', lineHeight: '1' }}>
              ——&nbsp;&nbsp;Salt Route Consulting&nbsp;&nbsp;——
            </Text>
            <Text style={{ fontFamily: sans, color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: '0 0 4px 0', lineHeight: '1.6' }}>
              Jhamsikhel, Lalitpur, Nepal
            </Text>
            <Text style={{ fontFamily: sans, color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 20px 0' }}>
              info@saltroutegroup.com
            </Text>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 16px 0' }} />
            <Text style={{ fontFamily: sans, color: 'rgba(255,255,255,0.2)', fontSize: '10px', margin: 0 }}>
              © {new Date().getFullYear()} Salt Route Consulting. All rights reserved.
            </Text>
          </Section>

          {/* Gold bottom accent */}
          <Section style={{ ...goldBar, padding: '2px 0' }}>
            <Text style={{ ...goldBar, padding: '2px 0' }}>.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
