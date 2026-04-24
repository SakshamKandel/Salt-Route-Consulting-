import { render } from '@react-email/render'
import { VerifyEmail } from '../emails/VerifyEmail'
import * as React from 'react'

async function main() {
  const html = await render(<VerifyEmail name="Test User" url="http://localhost:3000/verify?token=123" />)
  console.log('✅ Template rendered successfully:')
  console.log(html.substring(0, 100) + '...')
}
main()
