import crypto from "crypto"

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function normalizeBase32(input: string) {
  return input.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "")
}

export function generateBase32Secret(length = 20) {
  const bytes = crypto.randomBytes(length)
  let bits = 0
  let value = 0
  let output = ""

  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

export function formatSecret(secret: string) {
  return normalizeBase32(secret).match(/.{1,4}/g)?.join(" ") ?? secret
}

export function buildOtpAuthUrl({
  secret,
  accountName,
  issuer = "CloudPix",
}: {
  secret: string
  accountName: string
  issuer?: string
}) {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({
    secret: normalizeBase32(secret),
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  })

  return `otpauth://totp/${label}?${params.toString()}`
}

function base32ToBuffer(secret: string) {
  const normalized = normalizeBase32(secret)
  let bits = 0
  let value = 0
  const output: number[] = []

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) continue

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return Buffer.from(output)
}

export function generateTotpCode(secret: string, timestamp = Date.now(), step = 30, digits = 6) {
  const counter = Math.floor(timestamp / 1000 / step)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter))

  const hmac = crypto.createHmac("sha1", base32ToBuffer(secret)).update(counterBuffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return (binary % 10 ** digits).toString().padStart(digits, "0")
}

export function verifyTotpCode({
  secret,
  code,
  window = 1,
  step = 30,
  digits = 6,
}: {
  secret: string
  code: string
  window?: number
  step?: number
  digits?: number
}) {
  const normalizedCode = code.trim().replace(/\s+/g, "")

  for (let offset = -window; offset <= window; offset++) {
    const testTime = Date.now() + offset * step * 1000
    if (generateTotpCode(secret, testTime, step, digits) === normalizedCode) {
      return true
    }
  }

  return false
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => crypto.randomBytes(5).toString("hex").toUpperCase())
}
