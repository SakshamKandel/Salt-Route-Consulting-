import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingConfirmed = ({ name, propertyName, dates }: { name: string, propertyName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Great news, {name}!</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Your booking for {propertyName} ({dates}) is confirmed. We look forward to hosting you.</Text>
  </EmailLayout>
)