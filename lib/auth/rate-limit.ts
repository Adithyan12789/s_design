type AttemptRecord = {
  failures: number
  firstFailureAt: number
  lockedUntil: number | null
}

const attemptsStore = new Map<string, AttemptRecord>()

function getConfig() {
  const maxAttemptsRaw = Number(process.env.ADMIN_MAX_ATTEMPTS || 5)
  const lockoutMinutesRaw = Number(process.env.ADMIN_LOCKOUT_MINUTES || 15)

  const maxAttempts =
    Number.isFinite(maxAttemptsRaw) && maxAttemptsRaw >= 1 ? Math.floor(maxAttemptsRaw) : 5
  const lockoutMs =
    Number.isFinite(lockoutMinutesRaw) && lockoutMinutesRaw >= 1
      ? Math.floor(lockoutMinutesRaw * 60 * 1000)
      : 15 * 60 * 1000

  return { maxAttempts, lockoutMs }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'local-client'
}

export function checkLoginRateLimit(clientId: string): {
  allowed: boolean
  retryAfterSeconds: number
  remainingAttempts: number
} {
  const { maxAttempts, lockoutMs } = getConfig()
  const now = Date.now()
  const record = attemptsStore.get(clientId)

  if (!record) {
    return { allowed: true, retryAfterSeconds: 0, remainingAttempts: maxAttempts }
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((record.lockedUntil - now) / 1000)),
      remainingAttempts: 0,
    }
  }

  // Lockout or window expired -> reset cleanly
  if (
    (record.lockedUntil && now >= record.lockedUntil) ||
    now - record.firstFailureAt > lockoutMs
  ) {
    attemptsStore.delete(clientId)
    return { allowed: true, retryAfterSeconds: 0, remainingAttempts: maxAttempts }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: Math.max(0, maxAttempts - record.failures),
  }
}

export function recordFailedLoginAttempt(clientId: string): {
  locked: boolean
  retryAfterSeconds: number
  remainingAttempts: number
} {
  const { maxAttempts, lockoutMs } = getConfig()
  const now = Date.now()
  const existing = attemptsStore.get(clientId)

  if (!existing || now - existing.firstFailureAt > lockoutMs) {
    const nextFailures = 1
    const locked = nextFailures >= maxAttempts
    const lockedUntil = locked ? now + lockoutMs : null
    attemptsStore.set(clientId, {
      failures: nextFailures,
      firstFailureAt: now,
      lockedUntil,
    })
    return {
      locked,
      retryAfterSeconds: locked ? Math.ceil(lockoutMs / 1000) : 0,
      remainingAttempts: Math.max(0, maxAttempts - nextFailures),
    }
  }

  const nextFailures = existing.failures + 1
  const locked = nextFailures >= maxAttempts
  const lockedUntil = locked ? now + lockoutMs : null

  attemptsStore.set(clientId, {
    failures: nextFailures,
    firstFailureAt: existing.firstFailureAt,
    lockedUntil,
  })

  return {
    locked,
    retryAfterSeconds: locked ? Math.ceil(lockoutMs / 1000) : 0,
    remainingAttempts: Math.max(0, maxAttempts - nextFailures),
  }
}

export function clearLoginAttempts(clientId: string): void {
  attemptsStore.delete(clientId)
}

