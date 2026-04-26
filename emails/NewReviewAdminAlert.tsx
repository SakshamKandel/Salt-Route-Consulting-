import * as React from 'react'

import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, ActionButton, CHARCOAL } from './EmailLayout'

interface NewReviewAdminAlertProps {
  propertyName: string
  guestName: string
  rating: number
  comment: string
  adminUrl?: string
}

export function NewReviewAdminAlert({ propertyName, guestName, rating, comment, adminUrl }: NewReviewAdminAlertProps) {
  return (
    <EmailLayout preview={`New review for ${propertyName} — ${rating} stars`}>
      <LabelText>Moderation Alert</LabelText>
      <HeadlineText>New Review Received.</HeadlineText>
      <GoldRule />
      <BodyText>
        A guest has submitted a new review for your property. It is currently pending approval and will not be public until you review it.
      </BodyText>

      <DetailsCard>
        <DetailRow label="Property" value={propertyName} />
        <DetailRow label="Guest" value={guestName} />
        <DetailRow label="Rating" value={`${rating} / 5 Stars`} />
        <DetailRow label="Comment" value={comment} />
      </DetailsCard>

      <ActionButton href={adminUrl || 'https://saltroutegroup.com/admin/reviews'}>
        Moderate Review
      </ActionButton>
    </EmailLayout>
  )
}

export default NewReviewAdminAlert
