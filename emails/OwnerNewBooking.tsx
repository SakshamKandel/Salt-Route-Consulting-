import * as React from 'react'
import { Button } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, NAVY } from './EmailLayout'

interface OwnerNewBookingProps {
  ownerName: string
  propertyName: string
  guestName: string
  dates: string
  bookingCode?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  ownerUrl?: string
}

export function OwnerNewBooking({ ownerName, propertyName, guestName, dates, bookingCode, checkIn, checkOut, guests, ownerUrl }: OwnerNewBookingProps) {
  return (
    <EmailLayout preview={`New booking confirmed at ${propertyName}`}>
      <LabelText>Property Update</LabelText>
      <HeadlineText>A Guest Has Reserved Your Property.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {ownerName}, a booking for {propertyName} has been confirmed. Please review the details below and ensure your property is prepared for the guest's arrival.
      </BodyText>

      <DetailsCard>
        {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
        <DetailRow label="Property" value={propertyName} />
        <DetailRow label="Guest" value={guestName} />
        {checkIn && checkOut ? (
          <>
            <DetailRow label="Check-in" value={checkIn} />
            <DetailRow label="Check-out" value={checkOut} />
          </>
        ) : (
          <DetailRow label="Dates" value={dates} />
        )}
        {guests !== undefined && <DetailRow label="Guests" value={guests === 1 ? '1 guest' : `${guests} guests`} />}
      </DetailsCard>

      <BodyText>
        If you have any questions or concerns about this booking, please contact the Salt Route team at info@saltroutegroup.com.
      </BodyText>

      <Button
        href={ownerUrl || 'https://saltroutegroup.com/owner/bookings'}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        View Booking Details
      </Button>
    </EmailLayout>
  )
}

export default OwnerNewBooking
