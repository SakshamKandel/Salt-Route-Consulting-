import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, CHARCOAL, MUTED, sans, ActionButton } from './EmailLayout'

export function ResetPassword({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout preview="Reset your Salt Route password">
      <LabelText>Account Security</LabelText>
      <HeadlineText>Password Reset Request.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, we received a request to reset the password associated with your Salt Route account. Click the button below to set a new password.
      </BodyText>

      <ActionButton href={url}>
        Reset My Password
      </ActionButton>

      <Text style={{ fontFamily: sans, fontSize: '10px', color: MUTED, lineHeight: '1.6', margin: '40px 0 0 0', textAlign: 'center' }}>
        This link will expire in 1 hour. If you did not request a password reset, please disregard this email — your account remains secure. For any concerns, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: CHARCOAL, textDecoration: 'none' }}>
          info@saltroutegroup.com
        </a>.
      </Text>
    </EmailLayout>
  )
}

export default ResetPassword
