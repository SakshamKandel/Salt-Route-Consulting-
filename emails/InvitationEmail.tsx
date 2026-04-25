import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, NAVY, GOLD, VELLUM, MUTED, sans } from './EmailLayout'

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
        Click below to accept your invitation and set up your account. This invitation link expires in 48 hours.
      </BodyText>

      <Button
        href={url}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '32px' }}
      >
        Accept Invitation
      </Button>

      <Text style={{ fontFamily: sans, fontSize: '12px', color: MUTED, lineHeight: '1.7', margin: 0, padding: '16px 20px', backgroundColor: VELLUM, borderTop: `1px solid ${GOLD}` }}>
        If you were not expecting this invitation, you may safely ignore this email. For any concerns, contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>
        .
      </Text>
    </EmailLayout>
  )
}

export default InvitationEmail
