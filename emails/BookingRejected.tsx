import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingRejected = ({ name, propertyName, reason }: { name: string, propertyName: string, reason?: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Unfortunately, we are unable to accommodate your booking for {propertyName} at this time.</Text>
    {reason && <Text style={{ color: '#555', lineHeight: '1.5' }}>Reason: {reason}</Text>}
  </EmailLayout>
)