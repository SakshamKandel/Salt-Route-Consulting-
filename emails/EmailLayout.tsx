import { Html, Head, Body, Container, Section, Text } from '@react-email/components'
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
)