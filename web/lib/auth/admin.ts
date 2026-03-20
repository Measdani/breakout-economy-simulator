import 'server-only'

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE_NAME = 'admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8

const ADMIN_SESSION_SUBJECT = 'admin'

type AdminSessionPayload = {
  sub: string
  uid: string
  email: string
  iat: number
  exp: number
  jti: string
}

type AdminIdentity = {
  userId: string
  email: string
}

type SupabaseAuthUser = {
  id: string
  email?: string | null
  email_confirmed_at?: string | null
  confirmed_at?: string | null
}

let hasLoggedMissingAdminConfig = false

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

function getAdminAllowedEmails(): Set<string> {
  const rawValue = process.env.ADMIN_ALLOWED_EMAILS?.trim()
  if (!rawValue) {
    return new Set()
  }

  return new Set(
    rawValue
      .split(',')
      .map((email) => normalizeEmail(email))
      .filter((email): email is string => Boolean(email))
  )
}

function getAdminSessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim()
  return value && value.length > 0 ? value : null
}

function hasSupabasePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

function logMissingAdminConfig() {
  if (hasLoggedMissingAdminConfig) {
    return
  }

  hasLoggedMissingAdminConfig = true
  console.error(
    'Admin authentication is disabled because ADMIN_ALLOWED_EMAILS, ADMIN_SESSION_SECRET, or Supabase public auth config is missing.'
  )
}

function getAdminConfig() {
  const allowedEmails = getAdminAllowedEmails()
  const sessionSecret = getAdminSessionSecret()

  if (allowedEmails.size === 0 || !sessionSecret || !hasSupabasePublicConfig()) {
    logMissingAdminConfig()
    return null
  }

  return { allowedEmails, sessionSecret }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function parseAdminSessionPayload(token: string): AdminSessionPayload | null {
  const [encodedPayload, providedSignature, ...extraParts] = token.split('.')

  if (!encodedPayload || !providedSignature || extraParts.length > 0) {
    return null
  }

  const config = getAdminConfig()
  if (!config) {
    return null
  }

  const expectedSignature = createHmac('sha256', config.sessionSecret)
    .update(encodedPayload)
    .digest('base64url')

  if (!constantTimeEqual(providedSignature, expectedSignature)) {
    return null
  }

  try {
    const rawPayload = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const payload = JSON.parse(rawPayload) as Partial<AdminSessionPayload>

    if (
      payload.sub !== ADMIN_SESSION_SUBJECT ||
      typeof payload.uid !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      typeof payload.jti !== 'string'
    ) {
      return null
    }

    return {
      sub: payload.sub,
      uid: payload.uid,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
      jti: payload.jti,
    }
  } catch {
    return null
  }
}

export function isAdminAuthConfigured(): boolean {
  return getAdminConfig() !== null
}

export function isAdminEmailAllowed(email: string | null | undefined): boolean {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return false
  }

  const config = getAdminConfig()
  if (!config) {
    return false
  }

  return config.allowedEmails.has(normalizedEmail)
}

export function getAuthorizedAdminIdentity(
  user: SupabaseAuthUser | null | undefined
): AdminIdentity | null {
  if (!user?.id) {
    return null
  }

  const email = normalizeEmail(user.email)
  const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at)

  if (!email || !isConfirmed || !isAdminEmailAllowed(email)) {
    return null
  }

  return {
    userId: user.id,
    email,
  }
}

export function createAdminSessionToken(
  identity: AdminIdentity,
  now = Date.now()
): string | null {
  const config = getAdminConfig()
  if (!config) {
    return null
  }

  const issuedAt = Math.floor(now / 1000)
  const payload: AdminSessionPayload = {
    sub: ADMIN_SESSION_SUBJECT,
    uid: identity.userId,
    email: identity.email,
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_SECONDS,
    jti: randomUUID(),
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', config.sessionSecret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/',
  }
}

export function getAdminSessionFromToken(
  token: string,
  now = Date.now()
): AdminIdentity | null {
  if (typeof token !== 'string' || token.length === 0) {
    return null
  }

  const payload = parseAdminSessionPayload(token)
  if (!payload) {
    return null
  }

  const currentTime = Math.floor(now / 1000)
  if (payload.exp <= currentTime || payload.iat > currentTime) {
    return null
  }

  if (!isAdminEmailAllowed(payload.email)) {
    return null
  }

  return {
    userId: payload.uid,
    email: payload.email,
  }
}

export async function getAdminSession(): Promise<AdminIdentity | null> {
  if (!isAdminAuthConfigured()) {
    return null
  }

  const cookieStore = await cookies()
  const adminSession = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value

  if (!adminSession) {
    return null
  }

  return getAdminSessionFromToken(adminSession)
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized')
  }
}
