import fs from 'fs'
import path from 'path'

const dir = path.join(process.cwd(), 'emails')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

const layout = `import { Html, Head, Body, Container, Section, Text } from '@react-email/components'
import * as React from 'react'

export const EmailLayout = ({ children }: { children: React.ReactNode }) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#FAF9F6', fontFamily: 'sans-serif' }}>
      <Container style={{ margin: '0 auto', padding: '20px', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
        <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1B3A5C' }}>Salt Route</Text>
        </Section>
        {children}
        <Section style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #eaeaea', paddingTop: '16px' }}>
          <Text style={{ color: '#888888', fontSize: '12px' }}>
            &copy; {new Date().getFullYear()} Salt Route Consulting. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)`

fs.writeFileSync(path.join(dir, 'EmailLayout.tsx'), layout)

const templates = {
  'VerifyEmail.tsx': `import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const VerifyEmail = ({ name, url }: { name: string, url: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Welcome to Salt Route! Please verify your email address to complete your registration.</Text>
    <Button href={url} style={{ backgroundColor: '#1B3A5C', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Verify Email
    </Button>
  </EmailLayout>
)`,
  'ResetPassword.tsx': `import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const ResetPassword = ({ name, url }: { name: string, url: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>You requested to reset your password. Click the button below to proceed.</Text>
    <Button href={url} style={{ backgroundColor: '#C9A96E', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Reset Password
    </Button>
  </EmailLayout>
)`,
  'InvitationEmail.tsx': `import * as React from 'react'
import { Text, Button } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const InvitationEmail = ({ role, url, invitedBy }: { role: string, url: string, invitedBy: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>You have been invited!</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>{invitedBy} has invited you to join Salt Route as a {role}.</Text>
    <Button href={url} style={{ backgroundColor: '#1B3A5C', color: '#fff', padding: '12px 24px', borderRadius: '4px', display: 'inline-block', marginTop: '16px' }}>
      Accept Invitation
    </Button>
  </EmailLayout>
)`,
  'BookingReceived.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingReceived = ({ name, propertyName, dates }: { name: string, propertyName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>We have received your booking request for {propertyName} for {dates}. We will review it and confirm shortly.</Text>
  </EmailLayout>
)`,
  'NewBookingAdminAlert.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const NewBookingAdminAlert = ({ propertyName, guestName, dates }: { propertyName: string, guestName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>New Booking Alert</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>{guestName} has requested a booking at {propertyName} for {dates}.</Text>
  </EmailLayout>
)`,
  'BookingConfirmed.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingConfirmed = ({ name, propertyName, dates }: { name: string, propertyName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Great news, {name}!</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Your booking for {propertyName} ({dates}) is confirmed. We look forward to hosting you.</Text>
  </EmailLayout>
)`,
  'BookingRejected.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const BookingRejected = ({ name, propertyName, reason }: { name: string, propertyName: string, reason?: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Unfortunately, we are unable to accommodate your booking for {propertyName} at this time.</Text>
    {reason && <Text style={{ color: '#555', lineHeight: '1.5' }}>Reason: {reason}</Text>}
  </EmailLayout>
)`,
  'OwnerNewBooking.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const OwnerNewBooking = ({ ownerName, propertyName, guestName, dates }: { ownerName: string, propertyName: string, guestName: string, dates: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {ownerName},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>You have a new booking at {propertyName} from {guestName} for {dates}.</Text>
  </EmailLayout>
)`,
  'InquiryReceivedAuto.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const InquiryReceivedAuto = ({ name }: { name: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>Hello {name},</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>We have received your inquiry and our team will get back to you shortly.</Text>
  </EmailLayout>
)`,
  'NewInquiryAdminAlert.tsx': `import * as React from 'react'
import { Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'

export const NewInquiryAdminAlert = ({ name, email, subject }: { name: string, email: string, subject: string }) => (
  <EmailLayout>
    <Text style={{ fontSize: '18px', color: '#333' }}>New Inquiry Received</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>From: {name} ({email})</Text>
    <Text style={{ color: '#555', lineHeight: '1.5' }}>Subject: {subject}</Text>
  </EmailLayout>
)`
}

for (const [filename, content] of Object.entries(templates)) {
  fs.writeFileSync(path.join(dir, filename), content)
}
console.log('✅ Generated 10 React Email templates')

// Test script generator
const testScript = `import { render } from '@react-email/render'
import { VerifyEmail } from '../emails/VerifyEmail'
import * as React from 'react'

async function main() {
  const html = await render(<VerifyEmail name="Test User" url="http://localhost:3000/verify?token=123" />)
  console.log('✅ Template rendered successfully:')
  console.log(html.substring(0, 100) + '...')
}
main()
`
fs.writeFileSync(path.join(process.cwd(), 'scripts', 'test-email.tsx'), testScript)
