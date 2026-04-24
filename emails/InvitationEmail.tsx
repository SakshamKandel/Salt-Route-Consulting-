import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const InvitationEmail = ({ role, url, invitedBy }: { role: string, url: string, invitedBy: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>You have been invited!</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>{invitedBy} has invited you to join Salt Route as a {role}.</Text>
    <Button href={url} style={{ backgroundColor: '#1B3A5C', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Accept Invitation
    </Button>
  </EmailLayout>
)