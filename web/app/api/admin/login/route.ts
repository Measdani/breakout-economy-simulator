import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  getAuthorizedAdminIdentity,
  isAdminAuthConfigured,
} from '@/lib/auth/admin'
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  getAdminLoginRequestKey,
  recordAdminLoginFailure,
} from '@/lib/auth/admin-rate-limit'
import { createPublicServerClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
}

function jsonError(
  message: string,
  status: number,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        ...NO_STORE_HEADERS,
        ...extraHeaders,
      },
    }
  )
}

function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized.length === 0 || normalized.length > 254) {
    return null
  }

  return normalized
}

function sanitizePassword(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  if (value.length === 0 || value.length > 1024) {
    return null
  }

  return value
}

async function rejectFailedLogin(requestKey: string) {
  const failureState = await recordAdminLoginFailure(requestKey)

  if (!failureState.allowed) {
    return jsonError('Too many login attempts. Try again later.', 429, {
      'Retry-After': String(failureState.retryAfterSeconds),
    })
  }

  return jsonError('Invalid credentials.', 401)
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return jsonError('Admin login is not configured on the server.', 503)
  }

  const requestKey = getAdminLoginRequestKey(request)
  const rateLimitState = await checkAdminLoginRateLimit(requestKey)

  if (!rateLimitState.allowed) {
    return jsonError('Too many login attempts. Try again later.', 429, {
      'Retry-After': String(rateLimitState.retryAfterSeconds),
    })
  }

  let email: string | null = null
  let password: string | null = null

  try {
    const body = await request.json()
    email = sanitizeEmail(body?.email)
    password = sanitizePassword(body?.password)
  } catch {
    return jsonError('Invalid request body.', 400)
  }

  if (!email || !password) {
    return rejectFailedLogin(requestKey)
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user || !data.session) {
    return rejectFailedLogin(requestKey)
  }

  const identity = getAuthorizedAdminIdentity(data.user)
  if (!identity) {
    return rejectFailedLogin(requestKey)
  }

  const token = createAdminSessionToken(identity)
  if (!token) {
    return jsonError('Admin login is not configured on the server.', 503)
  }

  await clearAdminLoginFailures(requestKey)

  const cookieStore = await cookies()
  cookieStore.set(
    ADMIN_SESSION_COOKIE_NAME,
    token,
    getAdminSessionCookieOptions()
  )
  cookieStore.set('admin_token', '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  })

  return NextResponse.json(
    { success: true },
    {
      headers: NO_STORE_HEADERS,
    }
  )
}
