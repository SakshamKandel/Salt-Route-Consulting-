import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, NAVY, GOLD, VELLUM, sans } from './EmailLayout'

interface BookingConfirmedProps {
  name: string
  propertyName: string
  dates: string
  bookingCode?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  totalPrice?: string
  location?: string
  bookingUrl?: string
}

export function BookingConfirmed({ name, propertyName, dates, bookingCode, checkIn, checkOut, guests, totalPrice, location, bookingUrl }: BookingConfirmedProps) {
  return (
    <EmailLayout preview={`Your stay at ${propertyName} is confirmed`}>
      <LabelText>Booking Confirmed</LabelText>
      <HeadlineText>Your Stay is Confirmed.</HeadlineText>
      <GoldRule />
      <BodyText>
        Wonderful news, {name}. We are delighted to confirm your reservation at {propertyName}. We look forward to welcoming you and ensuring your experience is exceptional.
      </BodyText>

      <DetailsCard>
        {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
        <DetailRow label="Property" value={propertyName} />
        {location && <DetailRow label="Location" value={location} />}
        {checkIn && checkOut ? (
          <>
            <DetailRow label="Check-in" value={checkIn} />
            <DetailRow label="Check-out" value={checkOut} />
          </>
        ) : (
          <DetailRow label="Dates" value={dates} />
        )}
        {guests !== undefined && <DetailRow label="Guests" value={guests === 1 ? '1 guest' : `${guests} guests`} />}
        {totalPrice && <DetailRow label="Total" value={totalPrice} />}
      </DetailsCard>

      {/* Arrival note */}
      <Text style={{ fontFamily: sans, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderTop: `1px solid ${GOLD}`, borderBottom: `1px solid ${GOLD}`, backgroundColor: VELLUM }}>
        Should you require any assistance arranging your arrival, local transportation, or special requests, please contact us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>
        . We are here to make your journey seamless.
      </Text>

      <Button
        href={bookingUrl || 'https://saltroutegroup.com/account/bookings'}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        View Booking Details
      </Button>
    </EmailLayout>
  )
}

export default BookingConfirmed
