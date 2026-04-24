import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const VerifyEmail = ({ name, url }: { name: string, url: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Welcome to Salt Route! Please verify your email address to complete your registration.</Text>
    <Button href={url} style={{ backgroundColor: '#1B3A5C', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Verify Email
    </Button>
  </EmailLayout>
)