import 'server-only'

import { createHash } from 'node:crypto'

type RateLimitEntry = {
  attempts: number[]
  blockedUntil: number
}

type RequestHeaders = {
  get(name: string): string | null
}

type RedisCommand = Array<string | number>

type RedisCommandResponse = {
  result?: unknown
  error?: string
}

export type RateLimitPolicy = {
  limit: number
  windowMs: number
  blockDurationMs?: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

export const PUBLIC_RATE_LIMITS = {
  submission: { limit: 6, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  survey: { limit: 6, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  feedback: { limit: 10, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  simulate: { limit: 60, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
  simulateBatch: { limit: 20, windowMs: 5 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
} satisfies Record<string, RateLimitPolicy>

declare global {
  var __publicRateLimitStore: Map<string, RateLimitEntry> | undefined
}

function getRateLimitStore() {
  if (!globalThis.__publicRateLimitStore) {
    globalThis.__publicRateLimitStore = new Map<string, RateLimitEntry>()
  }

  return globalThis.__publicRateLimitStore
}

function normalizeEntry(key: string, policy: RateLimitPolicy, now: number): RateLimitEntry {
  const store = getRateLimitStore()
  const current = store.get(key)

  if (!current) {
    return { attempts: [], blockedUntil: 0 }
  }

  const attempts = current.attempts.filter((attemptedAt) => now - attemptedAt < policy.windowMs)
  const blockedUntil = current.blockedUntil > now ? current.blockedUntil : 0

  if (attempts.length === 0 && blockedUntil === 0) {
    store.delete(key)
    return { attempts: [], blockedUntil: 0 }
  }

  const next = { attempts, blockedUntil }
  store.set(key, next)
  return next
}

function getLocalRateLimitResult(
  key: string,
  policy: RateLimitPolicy,
  now: number
): RateLimitResult {
  const store = getRateLimitStore()
  const entry = normalizeEntry(key, policy, now)

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)),
    }
  }

  const attempts = [...entry.attempts, now]
  if (attempts.length > policy.limit) {
    const blockDurationMs = policy.blockDurationMs ?? policy.windowMs
    store.set(key, {
      attempts: [],
      blockedUntil: now + blockDurationMs,
    })

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(blockDurationMs / 1000)),
    }
  }

  store.set(key, {
    attempts,
    blockedUntil: 0,
  })

  return { allowed: true, retryAfterSeconds: 0 }
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

function getRedisKeys(scope: string, requestKey: string) {
  const digest = createHash('sha256').update(`${scope}:${requestKey}`).digest('hex')
  return {
    blockKey: `rl:public:${scope}:block:${digest}`,
    countKey: `rl:public:${scope}:count:${digest}`,
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

async function getRedisRateLimitResult(
  scope: string,
  requestKey: string,
  policy: RateLimitPolicy,
  now: number
): Promise<RateLimitResult> {
  const keys = getRedisKeys(scope, requestKey)
  const blockedUntilRaw = await executeRedisCommand(['GET', keys.blockKey])
  const blockedUntil = asPositiveNumber(blockedUntilRaw)

  if (blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((blockedUntil - now) / 1000)),
    }
  }

  const txResult = await executeRedisTransaction([
    ['INCR', keys.countKey],
    ['PEXPIRE', keys.countKey, policy.windowMs],
  ])

  if (!txResult) {
    return getLocalRateLimitResult(`${scope}:${requestKey}`, policy, now)
  }

  const count = asPositiveNumber(txResult[0])
  if (count > policy.limit) {
    const blockDurationMs = policy.blockDurationMs ?? policy.windowMs
    const nextBlockedUntil = now + blockDurationMs
    await executeRedisTransaction([
      ['SET', keys.blockKey, nextBlockedUntil, 'PX', blockDurationMs],
      ['DEL', keys.countKey],
    ])

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(blockDurationMs / 1000)),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

export function getRequestFingerprint(headers: RequestHeaders): string {
  const forwardedFor = headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()
  const realIp = headers.get('x-real-ip')?.trim()
  const userAgent = headers.get('user-agent')?.trim() || 'unknown-agent'
  const clientId = forwardedIp || realIp || 'unknown-ip'

  return `${clientId}:${userAgent.slice(0, 160)}`
}

export async function checkPublicRateLimit(
  scope: string,
  requestKey: string,
  policy: RateLimitPolicy,
  now = Date.now()
): Promise<RateLimitResult> {
  try {
    if (getUpstashRedisConfig()) {
      return await getRedisRateLimitResult(scope, requestKey, policy, now)
    }
  } catch (error) {
    console.error(`Shared public rate limit failed for ${scope}, using local fallback.`, error)
  }

  return getLocalRateLimitResult(`${scope}:${requestKey}`, policy, now)
}
