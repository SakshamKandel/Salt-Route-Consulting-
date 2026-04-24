import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const NewInquiryAdminAlert = ({ name, email, subject }: { name: string, email: string, subject: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>New Inquiry Received</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>From: {name} ({email})</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Subject: {subject}</Text>
  </EmailLayout>
)