import crypto from "crypto"

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Decode(encoded: string): Buffer {
  const clean = encoded.toUpperCase().replace(/=+$/, "")
  let bits = 0
  let value = 0
  const output: number[] = []
  for (const char of clean) {
    const idx = BASE32_CHARS.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(output)
}

export function generateTOTPSecret(): string {
  const bytes = crypto.randomBytes(20)
  return Array.from(bytes)
    .map((b) => BASE32_CHARS[b % 32])
    .join("")
}

export function keyuri(email: string, issuer: string, secret: string): string {
  return (
    `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}` +
    `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
  )
}

function computeTotp(secret: string, windowOffset = 0): string {
  const time = Math.floor(Date.now() / 30000) + windowOffset
  const key = base32Decode(secret)
  const counter = Buffer.alloc(8)
  counter.writeUInt32BE(Math.floor(time / 0x100000000), 0)
  counter.writeUInt32BE(time >>> 0, 4)
  const hmac = crypto.createHmac("sha1", key).update(counter).digest()
  const offset = hmac[19] & 0x0f
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000)
    .toString()
    .padStart(6, "0")
  return code
}

export function verifyTOTP(token: string, secret: string): boolean {
  for (const delta of [-1, 0, 1]) {
    if (computeTotp(secret, delta) === token) return true
  }
  return false
}
