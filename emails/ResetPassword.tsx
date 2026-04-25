import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, NAVY, GOLD, VELLUM, MUTED, sans } from './EmailLayout'

export function ResetPassword({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout preview="Reset your Salt Route password">
      <LabelText>Account Security</LabelText>
      <HeadlineText>Password Reset Request.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, we received a request to reset the password associated with your Salt Route account. Click the button below to set a new password.
      </BodyText>

      <Button
        href={url}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '32px' }}
      >
        Reset My Password
      </Button>

      <Text style={{ fontFamily: sans, fontSize: '12px', color: MUTED, lineHeight: '1.7', margin: 0, padding: '16px 20px', backgroundColor: VELLUM, borderTop: `1px solid ${GOLD}` }}>
        This link will expire in 1 hour. If you did not request a password reset, please disregard this email — your account remains secure. For any concerns, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>
        .
      </Text>
    </EmailLayout>
  )
}

export default ResetPassword
