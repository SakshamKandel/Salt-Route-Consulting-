import { EmailLayout, LabelText, HeadlineText, GoldRule, BodyText, DetailsCard, DetailRow, ActionButton, CHARCOAL } from './EmailLayout'

interface BookingReceivedProps {
  name: string
  propertyName: string
  dates: string
  bookingCode?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  totalPrice?: string
}

export function BookingReceived({ name, propertyName, dates, bookingCode, checkIn, checkOut, guests, totalPrice }: BookingReceivedProps) {
  return (
    <EmailLayout preview={`Booking request received — ${propertyName}`}>
      <LabelText>Booking Request</LabelText>
      <HeadlineText>Your Request Has Been Received.</HeadlineText>
      <GoldRule />
      <BodyText>
        Dear {name}, thank you for choosing Salt Route. We have received your booking request and our team will review it shortly.
      </BodyText>

      <DetailsCard>
        {bookingCode && <DetailRow label="Reference" value={bookingCode} />}
        <DetailRow label="Property" value={propertyName} />
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

      <BodyText>
        You will receive a confirmation email once your reservation has been reviewed. If you have any questions, please do not hesitate to reach us at info@saltroutegroup.com.
      </BodyText>

      <ActionButton href="https://saltroutegroup.com/account/bookings">
        View My Bookings
      </ActionButton>
    </EmailLayout>
  )
}

export default BookingReceived
