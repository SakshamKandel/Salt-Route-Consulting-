import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, NAVY, GOLD, VELLUM, sans } from './EmailLayout'

interface BookingCheckinReminderProps {
  name: string
  propertyName: string
  checkIn: string
  checkOut?: string
  bookingCode?: string
  location?: string
  daysUntilArrival?: number
}

export function BookingCheckinReminder({ name, propertyName, checkIn, checkOut, bookingCode, location, daysUntilArrival }: BookingCheckinReminderProps) {
  const dayLabel = daysUntilArrival === 1 ? 'tomorrow' : daysUntilArrival === 2 ? 'in 2 days' : 'soon'

  return (
    <EmailLayout preview={`Your arrival at ${propertyName} is approaching`}>
      <LabelText>Arrival Reminder</LabelText>
      <HeadlineText>Your Journey Begins {daysUntilArrival ? dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1) : 'Soon'}.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, we are looking forward to welcoming you {daysUntilArrival ? dayLabel : 'soon'}. Your stay at {propertyName} awaits — we have prepared everything for your arrival.
      </BodyText>

      <DetailsCard>
        {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
        <DetailRow label="Property" value={propertyName} />
        {location && <DetailRow label="Location" value={location} />}
        <DetailRow label="Check-in" value={checkIn} />
        {checkOut && <DetailRow label="Check-out" value={checkOut} />}
      </DetailsCard>

      <Text style={{ fontFamily: sans, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderLeft: `3px solid ${GOLD}`, backgroundColor: VELLUM }}>
        If you have any last-minute requests, special dietary needs, or require assistance arranging your arrival, please do not hesitate to contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>
        . We are here to ensure a seamless experience from the moment you set out.
      </Text>

      <Button
        href="https://saltroutegroup.com/account/bookings"
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        View Booking Details
      </Button>
    </EmailLayout>
  )
}

export default BookingCheckinReminder
