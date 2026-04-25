import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, NAVY, GOLD, VELLUM, MUTED, sans } from './EmailLayout'

export function VerifyEmail({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout preview="Welcome to Salt Route — please verify your email">
      <LabelText>Welcome</LabelText>
      <HeadlineText>Please Verify Your Email.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, welcome to Salt Route Consulting. We are delighted to have you. To complete your registration and unlock the full experience, please verify your email address.
      </BodyText>

      <Button
        href={url}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '32px' }}
      >
        Verify Email Address
      </Button>

      <Text style={{ fontFamily: sans, fontSize: '12px', color: MUTED, lineHeight: '1.7', margin: 0, padding: '16px 20px', backgroundColor: VELLUM, borderTop: `1px solid ${GOLD}` }}>
        If you did not create an account with Salt Route, please disregard this email. If you have any questions, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>
        .
      </Text>
    </EmailLayout>
  )
}

export const VerifyEmailTemplate = VerifyEmail
export default VerifyEmail
