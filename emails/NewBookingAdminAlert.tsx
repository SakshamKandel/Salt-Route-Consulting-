import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const NewBookingAdminAlert = ({ propertyName, guestName, dates }: { propertyName: string, guestName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>New Booking Alert</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>{guestName} has requested a booking at {propertyName} for {dates}.</Text>
  </EmailLayout>
)