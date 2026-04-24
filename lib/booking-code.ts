import { prisma } from "./db"

export async function generateBookingCode(): Promise<string> {
  const year = new Date().getFullYear()
  let isUnique = false
  let code = ""
  
  while (!isUnique) {
    const random = Math.floor(1000 + Math.random() * 9000).toString() // 1000-9999
    code = `SLT-${year}-${random}`
    
    const existing = await prisma.booking.findUnique({
      where: { bookingCode: code }
    })
    
    if (!existing) {
      isUnique = true
    }
  }
  
  return code
}
