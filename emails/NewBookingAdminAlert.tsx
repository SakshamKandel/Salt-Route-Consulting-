import * as React from 'react'
import { Button } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, NAVY } from './EmailLayout'

interface NewBookingAdminAlertProps {
  propertyName: string
  guestName: string
  dates: string
  bookingCode?: string
  guestEmail?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  totalPrice?: string
  adminUrl?: string
}

export function NewBookingAdminAlert({ propertyName, guestName, dates, bookingCode, guestEmail, checkIn, checkOut, guests, totalPrice, adminUrl }: NewBookingAdminAlertProps) {
  return (
    <EmailLayout preview={`New booking request — ${propertyName} from ${guestName}`}>
      <LabelText>Admin Alert</LabelText>
      <HeadlineText>New Booking Request.</HeadlineText>
      <GoldRule />
      <BodyText>
        A new reservation request has been submitted and is awaiting your review. Please confirm or decline at your earliest convenience.
      </BodyText>

      <DetailsCard>
        {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
        <DetailRow label="Property" value={propertyName} />
        <DetailRow label="Guest" value={guestName} />
        {guestEmail && <DetailRow label="Email" value={guestEmail} />}
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

      <Button
        href={adminUrl || 'https://saltroutegroup.com/admin/bookings'}
        style={{ backgroundColor: NAVY, color: '#ffffff', padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        Review Booking
      </Button>
    </EmailLayout>
  )
}

export default NewBookingAdminAlert
