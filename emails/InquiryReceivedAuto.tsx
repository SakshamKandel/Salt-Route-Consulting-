import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, GOLD, VELLUM, NAVY, sans } from './EmailLayout'

interface InquiryReceivedAutoProps {
  name: string
  subject?: string
  message?: string
}

export function InquiryReceivedAuto({ name, subject, message }: InquiryReceivedAutoProps) {
  return (
    <EmailLayout preview={`Thank you for reaching out to Salt Route`}>
      <LabelText>Thank You</LabelText>
      <HeadlineText>We Have Received Your Message.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, thank you for reaching out to Salt Route Consulting. We have received your enquiry and a member of our team will be in touch with you within one business day.
      </BodyText>

      {(subject || message) && (
        <Text style={{ fontFamily: sans, fontSize: '13px', color: '#7A7A7A', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderLeft: `3px solid ${GOLD}`, backgroundColor: VELLUM }}>
          {subject && (
            <span style={{ display: 'block', fontWeight: '700', color: '#4A4A4A', marginBottom: '8px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {subject}
            </span>
          )}
          {message && <span style={{ display: 'block', fontStyle: 'italic' }}>&ldquo;{message}&rdquo;</span>}
        </Text>
      )}

      <BodyText>
        In the meantime, you are welcome to explore our curated collection of properties at{' '}
        <a href="https://saltroutegroup.com/properties" style={{ color: NAVY, textDecoration: 'none', fontWeight: '600' }}>
          saltroutegroup.com
        </a>
        .
      </BodyText>
    </EmailLayout>
  )
}

export default InquiryReceivedAuto
