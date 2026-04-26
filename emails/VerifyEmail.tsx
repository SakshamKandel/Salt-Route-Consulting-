import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, CHARCOAL, MUTED, sans, ActionButton } from './EmailLayout'

export function VerifyEmail({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout preview="Welcome to Salt Route — please verify your email">
      <LabelText>Welcome</LabelText>
      <HeadlineText>Please Verify Your Email.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, welcome to Salt Route Consulting. We are delighted to have you. To complete your registration and unlock the full experience, please verify your email address.
      </BodyText>

      <ActionButton href={url}>
        Verify Email Address
      </ActionButton>

      <Text style={{ fontFamily: sans, fontSize: '10px', color: MUTED, lineHeight: '1.6', margin: '40px 0 0 0', textAlign: 'center' }}>
        If you did not create an account with Salt Route, please disregard this email. If you have any questions, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: CHARCOAL, textDecoration: 'none' }}>
          info@saltroutegroup.com
        </a>.
      </Text>
    </EmailLayout>
  )
}

export const VerifyEmailTemplate = VerifyEmail
export default VerifyEmail
