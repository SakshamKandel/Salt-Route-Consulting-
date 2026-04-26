import { Html, Head, Body, Container, Section, Text, Hr, Preview, Link as EmailLink } from '@react-email/components'
import * as React from 'react'

export const CHARCOAL = '#1B3A5C'
export const GOLD = '#C9A96E'
export const MUTED = '#5A7A9A'
export const VELLUM = '#FBF9F4'

export const serif = "Georgia, 'Times New Roman', Times, serif"
export const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export function LabelText({ children, align = 'center' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return (
    <Text style={{ fontFamily: sans, fontSize: '9px', fontWeight: '500', color: MUTED, letterSpacing: '0.4em', textTransform: 'uppercase' as const, margin: '0 0 16px 0', lineHeight: '1', textAlign: align }}>
      {children}
    </Text>
  )
}

export function HeadlineText({ children, align = 'center' }: { children: React.ReactNode; align?: 'left' | 'center' | 'right' }) {
  return (
    <Text style={{ fontFamily: serif, fontSize: '32px', fontWeight: '300', color: CHARCOAL, margin: '0 0 24px 0', lineHeight: '1.2', letterSpacing: '-0.01em', textAlign: align }}>
      {children}
    </Text>
  )
}

export function GoldRule() {
  return <Hr style={{ borderColor: CHARCOAL, opacity: 0.1, borderTopWidth: '1px', margin: '32px auto', width: '40px' }} />
}

export function BodyText({ children, style, align = 'center' }: { children: React.ReactNode; style?: React.CSSProperties; align?: 'left' | 'center' | 'right' }) {
  return (
    <Text style={{ fontFamily: sans, fontSize: '13px', color: CHARCOAL, opacity: 0.8, lineHeight: '1.8', margin: '0 0 24px 0', textAlign: align, fontWeight: '300', ...style }}>
      {children}
    </Text>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ fontFamily: sans, fontSize: '9px', fontWeight: '600', color: MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.2em', paddingBottom: '16px', paddingRight: '24px', whiteSpace: 'nowrap' as const, verticalAlign: 'top' }}>
        {label}
      </td>
      <td style={{ fontFamily: sans, fontSize: '13px', color: CHARCOAL, paddingBottom: '16px', verticalAlign: 'top', lineHeight: '1.5', fontWeight: '300' }}>
        {value}
      </td>
    </tr>
  )
}

export function DetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ borderTop: `1px solid rgba(27,58,92,0.1)`, borderBottom: `1px solid rgba(27,58,92,0.1)`, padding: '32px 0', margin: '32px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>{children}</tbody>
      </table>
    </Section>
  )
}

export function ActionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ textAlign: 'center', margin: '40px 0' }}>
      <EmailLink
        href={href}
        style={{
          display: 'inline-block',
          backgroundColor: 'transparent',
          color: CHARCOAL,
          border: `1px solid ${CHARCOAL}`,
          padding: '16px 40px',
          fontFamily: sans,
          fontSize: '9px',
          fontWeight: '500',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          textDecoration: 'none'
        }}
      >
        {children}
      </EmailLink>
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
      <Body style={{ backgroundColor: VELLUM, margin: 0, padding: '40px 0', fontFamily: sans }}>
        {preview && <Preview>{preview}</Preview>}
        <Container style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px' }}>

          {/* Minimal Editorial Header */}
          <Section style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Text style={{ fontFamily: serif, fontSize: '18px', fontWeight: '300', color: CHARCOAL, letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
              Salt Route
            </Text>
          </Section>

          {/* Core Content */}
          <Section style={{ backgroundColor: 'transparent' }}>
            {children}
          </Section>

          {/* Extreme Minimal Footer */}
          <Section style={{ textAlign: 'center', marginTop: '60px', paddingTop: '40px', borderTop: `1px solid rgba(27,58,92,0.05)` }}>
            <Text style={{ fontFamily: serif, fontSize: '12px', fontStyle: 'italic', color: MUTED, margin: '0 0 16px 0' }}>
              Curated journeys. Exclusive spaces.
            </Text>
            <Text style={{ fontFamily: sans, fontSize: '9px', fontWeight: '500', color: MUTED, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 24px 0', lineHeight: '1.8' }}>
              <EmailLink href="https://saltroutegroup.com" style={{ color: MUTED, textDecoration: 'none' }}>Saltroutegroup.com</EmailLink>
            </Text>
            <Text style={{ fontFamily: sans, fontSize: '8px', color: 'rgba(27,58,92,0.3)', margin: '0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              © {new Date().getFullYear()} Salt Route Consulting. Nepal.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
