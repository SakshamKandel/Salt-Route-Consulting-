import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, NAVY, GOLD, VELLUM, sans } from './EmailLayout'

interface BookingThankYouProps {
  name: string
  propertyName: string
  checkOut?: string
  bookingCode?: string
  reviewUrl?: string
}

export function BookingThankYou({ name, propertyName, checkOut, bookingCode, reviewUrl }: BookingThankYouProps) {
  return (
    <EmailLayout preview={`Thank you for staying with us, ${name}`}>
      <LabelText>Thank You</LabelText>
      <HeadlineText>It Was a Pleasure Hosting You.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, on behalf of the entire Salt Route team, we want to express our heartfelt gratitude for choosing to stay with us at {propertyName}. We hope your experience was everything you imagined and more.
      </BodyText>

      {(bookingCode || checkOut) && (
        <DetailsCard>
          {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
          <DetailRow label="Property" value={propertyName} />
          {checkOut && <DetailRow label="Checked Out" value={checkOut} />}
        </DetailsCard>
      )}

      <Text style={{ fontFamily: sans, fontSize: '15px', color: '#5A5A5A', lineHeight: '1.8', margin: '0 0 16px 0', fontStyle: 'italic' }}>
        &ldquo;Travel is not just movement — it is transformation. We are honoured to have been part of yours.&rdquo;
      </Text>

      <Text style={{ fontFamily: sans, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderLeft: `3px solid ${GOLD}`, backgroundColor: VELLUM }}>
        Your feedback helps us grow. We would love to hear about your stay — a brief review goes a long way in helping other guests discover Salt Route's hidden gems.
      </Text>

      <Button
        href={reviewUrl || 'https://saltroutegroup.com/account/reviews'}
        style={{ backgroundColor: GOLD, color: NAVY, padding: '15px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '16px' }}
      >
        Share Your Experience
      </Button>

      <Button
        href="https://saltroutegroup.com/properties"
        style={{ backgroundColor: 'transparent', color: NAVY, padding: '13px 32px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', textAlign: 'center', textDecoration: 'none', border: `1px solid ${NAVY}` }}
      >
        Plan Your Next Stay
      </Button>
    </EmailLayout>
  )
}

export default BookingThankYou
