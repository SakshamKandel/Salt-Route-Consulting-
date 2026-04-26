import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, CHARCOAL, GOLD, VELLUM, sans, ActionButton } from './EmailLayout'

interface BookingRejectedProps {
  name: string
  propertyName: string
  reason?: string
  bookingCode?: string
}

export function BookingRejected({ name, propertyName, reason, bookingCode }: BookingRejectedProps) {
  return (
    <EmailLayout preview={`An update on your booking request — ${propertyName}`}>
      <LabelText>Booking Update</LabelText>
      <HeadlineText>An Update on Your Request.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, thank you sincerely for your interest in {propertyName} and for choosing Salt Route.
      </BodyText>
      <BodyText>
        Regrettably, we are unable to accommodate your booking at this time. We understand this may be disappointing and we apologise for any inconvenience.
      </BodyText>

      {(bookingCode || reason) && (
        <DetailsCard>
          {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
          <DetailRow label="Property" value={propertyName} />
          {reason && <DetailRow label="Reason" value={reason} />}
        </DetailsCard>
      )}

      <Text style={{ fontFamily: sans, fontSize: '13px', color: '#5A7A9A', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderLeft: `3px solid ${GOLD}`, backgroundColor: VELLUM }}>
        We warmly invite you to explore our other available properties, or to reach us at{' '}
        <a href="mailto:info@saltroutegroup.com" style={{ color: CHARCOAL, textDecoration: 'none', fontWeight: '600' }}>
          info@saltroutegroup.com
        </a>{' '}
        to discuss alternative arrangements. It would be our pleasure to find the right experience for you.
      </Text>

      <Button
        href="https://saltroutegroup.com/properties"
        style={{ backgroundColor: CHARCOAL, color: '#ffffff', padding: '16px 36px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none' , border: `1px solid ${CHARCOAL}`}}
      >
        Explore Properties
      </Button>
    </EmailLayout>
  )
}

export default BookingRejected
