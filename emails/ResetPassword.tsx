import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const ResetPassword = ({ name, url }: { name: string, url: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>You requested to reset your password. Click the button below to proceed.</Text>
    <Button href={url} style={{ backgroundColor: '#C9A96E', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Reset Password
    </Button>
  </EmailLayout>
)