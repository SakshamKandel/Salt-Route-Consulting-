import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, CHARCOAL, GOLD, VELLUM, sans, ActionButton } from './EmailLayout'

interface NewInquiryAdminAlertProps {
  name: string
  email: string
  subject: string
  message?: string
  phone?: string
  inquiryUrl?: string
}

export function NewInquiryAdminAlert({ name, email, subject, message, phone, inquiryUrl }: NewInquiryAdminAlertProps) {
  return (
    <EmailLayout preview={`New inquiry from ${name} — ${subject}`}>
      <LabelText>New Inquiry</LabelText>
      <HeadlineText>A Guest Has Made an Enquiry.</HeadlineText>
      <GoldRule />
      <BodyText>
        A new contact form submission has been received and is awaiting your attention.
      </BodyText>

      <DetailsCard>
        <DetailRow label="From" value={name} />
        <DetailRow label="Email" value={email} />
        {phone && <DetailRow label="Phone" value={phone} />}
        <DetailRow label="Subject" value={subject} />
      </DetailsCard>

      {message && (
        <Text style={{ fontFamily: sans, fontSize: '14px', color: '#4A6A85', lineHeight: '1.7', margin: '0 0 32px 0', padding: '20px 24px', borderLeft: `3px solid ${GOLD}`, backgroundColor: VELLUM, fontStyle: 'italic' }}>
          &ldquo;{message}&rdquo;
        </Text>
      )}

      <ActionButton href={inquiryUrl || 'https://saltroutegroup.com/admin/inquiries'}>
        View Inquiry
      </ActionButton>
    </EmailLayout>
  )
}

export default NewInquiryAdminAlert
