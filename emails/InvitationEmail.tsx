import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, CHARCOAL, MUTED, sans, ActionButton } from './EmailLayout'

export function InvitationEmail({ role, url, invitedBy }: { role: string; url: string; invitedBy: string }) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  return (
    <EmailLayout preview={`You have been invited to join Salt Route as a ${roleLabel}`}>
      <LabelText>Invitation</LabelText>
      <HeadlineText>You Have Been Invited.</HeadlineText>
      <GoldRule />
      <BodyText>
        {invitedBy} has extended an invitation for you to join Salt Route Consulting as a {roleLabel}. We are pleased to welcome you to our platform.
      </BodyText>
      <BodyText>
        Click below to accept your invitation and set up your account. This link expires in 48 hours.
      </BodyText>

      <ActionButton href={url}>
        Accept Invitation
      </ActionButton>

      <Text style={{ fontFamily: sans, fontSize: '10px', color: MUTED, lineHeight: '1.6', margin: '40px 0 0 0', textAlign: 'center' }}>
        If you were not expecting this invitation, you may safely ignore this email. For any concerns, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: CHARCOAL, textDecoration: 'none' }}>
          info@saltroutegroup.com
        </a>.
      </Text>
    </EmailLayout>
  )
}

export default InvitationEmail
