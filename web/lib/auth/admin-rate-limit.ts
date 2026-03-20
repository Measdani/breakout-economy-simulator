import 'server-only'

import { createHash } from 'node:crypto'

const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000
const LOGIN_BLOCK_DURATION_MS = 15 * 60 * 1000
const MAX_LOGIN_FAILURES = 5

type LoginRateLimitEntry = {
  failures: number[]
  blockedUntil: number
}

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type RedisCommand = Array<string | number>

type RedisCommandResponse = {
  result?: unknown
  error?: string
}

declare global {
  var __adminLoginRateLimitStore: Map<string, LoginRateLimitEntry> | undefined
}

function getRateLimitStore() {
  if (!globalThis.__adminLoginRateLimitStore) {
    globalThis.__adminLoginRateLimitStore = new Map<string, LoginRateLimitEntry>()
  }

  return globalThis.__adminLoginRateLimitStore
}

function normalizeEntry(key: string, now: number): LoginRateLimitEntry {
  const store = getRateLimitStore()
  const current = store.get(key)

  if (!current) {
    return { failures: [], blockedUntil: 0 }
  }

  const failures = current.failures.filter(
    (attemptedAt) => now - attemptedAt < LOGIN_FAILURE_WINDOW_MS
  )
  const blockedUntil = current.blockedUntil > now ? current.blockedUntil : 0

  if (failures.length === 0 && blockedUntil === 0) {
    store.delete(key)
    return { failures: [], blockedUntil: 0 }
  }

  const next = { failures, blockedUntil }
  store.set(key, next)
  return next
}

function cleanupRateLimitStore(now: number) {
  const store = getRateLimitStore()

  if (store.size < 1000) {
    return
  }

  for (const key of store.keys()) {
    normalizeEntry(key, now)
  }
}

function getLocalCheckResult(key: string, now: number): RateLimitResult {
  cleanupRateLimitStore(now)
  const entry = normalizeEntry(key, now)

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((entry.blockedUntil - now) / 1000)
      ),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

function getLocalFailureResult(key: string, now: number): RateLimitResult {
  cleanupRateLimitStore(now)
  const store = getRateLimitStore()
  const entry = normalizeEntry(key, now)
  const failures = [...entry.failures, now]

  if (failures.length >= MAX_LOGIN_FAILURES) {
    store.set(key, {
      failures: [],
      blockedUntil: now + LOGIN_BLOCK_DURATION_MS,
    })

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(LOGIN_BLOCK_DURATION_MS / 1000),
    }
  }

  store.set(key, {
    failures,
    blockedUntil: 0,
  })

  return { allowed: true, retryAfterSeconds: 0 }
}

function clearLocalFailures(key: string) {
  getRateLimitStore().delete(key)
}

function getUpstashRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim() ||
    null
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim() ||
    null

  if (!url || !token) {
    return null
  }

  return { url: url.replace(/\/+$/, ''), token }
}

function getRateLimitRedisKeys(key: string) {
  const digest = createHash('sha256').update(key).digest('hex')
  return {
    blockKey: `rl:admin:login:block:${digest}`,
    failureKey: `rl:admin:login:fail:${digest}`,
  }
}

async function executeRedisCommand(command: RedisCommand) {
  const config = getUpstashRedisConfig()
  if (!config) {
    return null
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Redis command failed with status ${response.status}`)
  }

  const data = (await response.json()) as RedisCommandResponse
  if (data.error) {
    throw new Error(data.error)
  }

  return data.result
}

async function executeRedisTransaction(commands: RedisCommand[]) {
  const config = getUpstashRedisConfig()
  if (!config) {
    return null
  }

  const response = await fetch(`${config.url}/multi-exec`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Redis transaction failed with status ${response.status}`)
  }

  const data = (await response.json()) as RedisCommandResponse[]
  for (const item of data) {
    if (item.error) {
      throw new Error(item.error)
    }
  }

  return data.map((item) => item.result)
}

function asPositiveNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

async function getRedisCheckResult(key: string, now: number): Promise<RateLimitResult> {
  const keys = getRateLimitRedisKeys(key)
  const blockedUntilRaw = await executeRedisCommand(['GET', keys.blockKey])
  const blockedUntil = asPositiveNumber(blockedUntilRaw)

  if (blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((blockedUntil - now) / 1000)
      ),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

async function getRedisFailureResult(
  key: string,
  now: number
): Promise<RateLimitResult> {
  const keys = getRateLimitRedisKeys(key)
  const txResult = await executeRedisTransaction([
    ['INCR', keys.failureKey],
    ['PEXPIRE', keys.failureKey, LOGIN_FAILURE_WINDOW_MS],
  ])

  if (!txResult) {
    return getLocalFailureResult(key, now)
  }

  const failureCount = asPositiveNumber(txResult[0])
  if (failureCount >= MAX_LOGIN_FAILURES) {
    const blockedUntil = now + LOGIN_BLOCK_DURATION_MS
    await executeRedisTransaction([
      ['SET', keys.blockKey, blockedUntil, 'PX', LOGIN_BLOCK_DURATION_MS],
      ['DEL', keys.failureKey],
    ])

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(LOGIN_BLOCK_DURATION_MS / 1000),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

async function clearRedisFailures(key: string) {
  const keys = getRateLimitRedisKeys(key)
  await executeRedisTransaction([
    ['DEL', keys.failureKey],
    ['DEL', keys.blockKey],
  ])
}

export function getAdminLoginRequestKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  const userAgent = request.headers.get('user-agent')?.trim() || 'unknown-agent'
  const clientId = forwardedIp || realIp || 'unknown-ip'

  return `${clientId}:${userAgent.slice(0, 160)}`
}

export async function checkAdminLoginRateLimit(
  key: string,
  now = Date.now()
): Promise<RateLimitResult> {
  try {
    if (getUpstashRedisConfig()) {
      return await getRedisCheckResult(key, now)
    }
  } catch (error) {
    console.error('Shared admin login rate limit check failed, using local fallback.', error)
  }

  return getLocalCheckResult(key, now)
}

export async function recordAdminLoginFailure(
  key: string,
  now = Date.now()
): Promise<RateLimitResult> {
  try {
    if (getUpstashRedisConfig()) {
      return await getRedisFailureResult(key, now)
    }
  } catch (error) {
    console.error('Shared admin login rate limit write failed, using local fallback.', error)
  }

  return getLocalFailureResult(key, now)
}

export async function clearAdminLoginFailures(key: string): Promise<void> {
  try {
    if (getUpstashRedisConfig()) {
      await clearRedisFailures(key)
      return
    }
  } catch (error) {
    console.error('Shared admin login rate limit clear failed, using local fallback.', error)
  }

  clearLocalFailures(key)
}
