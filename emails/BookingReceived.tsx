import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingReceived = ({ name, propertyName, dates }: { name: string, propertyName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>We have received your booking request for {propertyName} for {dates}. We will review it and confirm shortly.</Text>
  </EmailLayout>
)