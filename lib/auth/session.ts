export const ADMIN_SESSION_COOKIE = 'sd_admin_session'

const DEFAULT_SESSION_TTL_HOURS = 12

export type AdminSessionPayload = {
  sub: 'studio-admin'
  iat: number
  exp: number
}

export function getAdminAccessCodeConfig(): {
  isConfigured: boolean
  code: string | null
  error: string | null
} {
  const raw = process.env.ADMIN_ACCESS_CODE?.trim()
  if (!raw) {
    return {
      isConfigured: false,
      code: null,
      error: 'ADMIN_ACCESS_CODE is not configured on the server.',
    }
  }
  if (!/^\d{6}$/.test(raw)) {
    return {
      isConfigured: false,
      code: null,
      error: 'ADMIN_ACCESS_CODE must be a 6-digit numeric secret.',
    }
  }
  return { isConfigured: true, code: raw, error: null }
}

function getSessionTtlMs(): number {
  const parsed = Number(process.env.ADMIN_SESSION_TTL_HOURS || DEFAULT_SESSION_TTL_HOURS)
  const hours = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_TTL_HOURS
  return Math.floor(hours * 60 * 60 * 1000)
}

export function getSessionMaxAgeSeconds(): number {
  return Math.floor(getSessionTtlMs() / 1000)
}

function getSigningSecret(): string | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_ACCESS_CODE?.trim()
  if (!secret) return null
  return `s_design_admin_session_v1:${secret}`
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch {
    return null
  }
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function verifyAdminAccessCode(submittedCode: string): Promise<boolean> {
  const { isConfigured, code } = getAdminAccessCodeConfig()
  if (!isConfigured || !code) return false
  if (!/^\d{6}$/.test(submittedCode)) return false

  const enc = new TextEncoder()
  const [hashA, hashB] = await Promise.all([
    globalThis.crypto.subtle.digest('SHA-256', enc.encode(`code:${submittedCode}`)),
    globalThis.crypto.subtle.digest('SHA-256', enc.encode(`code:${code}`)),
  ])

  return constantTimeEqual(new Uint8Array(hashA), new Uint8Array(hashB))
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSigningSecret()
  if (!secret) {
    throw new Error('Admin session signing secret is not configured.')
  }

  const now = Date.now()
  const payload: AdminSessionPayload = {
    sub: 'studio-admin',
    iat: now,
    exp: now + getSessionTtlMs(),
  }

  const enc = new TextEncoder()
  const payloadB64 = toBase64Url(enc.encode(JSON.stringify(payload)))
  const key = await importHmacKey(secret)
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
  const sigB64 = toBase64Url(new Uint8Array(signature))

  return `${payloadB64}.${sigB64}`
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token) return null
  const { isConfigured } = getAdminAccessCodeConfig()
  const secret = getSigningSecret()
  if (!isConfigured || !secret) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts

  const sigBytes = fromBase64Url(sigB64)
  if (!sigBytes) return null

  const enc = new TextEncoder()
  const key = await importHmacKey(secret)
  const expectedSig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))

  if (!constantTimeEqual(sigBytes, new Uint8Array(expectedSig))) {
    return null
  }

  const payloadBytes = fromBase64Url(payloadB64)
  if (!payloadBytes) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as AdminSessionPayload
    if (payload.sub !== 'studio-admin') return null
    if (typeof payload.exp !== 'number' || Date.now() >= payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function isHttpsRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase()
  if (proto) return proto === 'https'
  return request.url.startsWith('https://')
}

export function getAdminCookieOptions(isHttps = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isHttps,
    path: '/',
    maxAge: getSessionMaxAgeSeconds(),
  }
}

