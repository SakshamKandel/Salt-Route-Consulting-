import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const OwnerNewBooking = ({ ownerName, propertyName, guestName, dates }: { ownerName: string, propertyName: string, guestName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {ownerName},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>You have a new booking at {propertyName} from {guestName} for {dates}.</Text>
  </EmailLayout>
)