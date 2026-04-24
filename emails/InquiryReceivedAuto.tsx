import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const InquiryReceivedAuto = ({ name }: { name: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>We have received your inquiry and our team will get back to you shortly.</Text>
  </EmailLayout>
)