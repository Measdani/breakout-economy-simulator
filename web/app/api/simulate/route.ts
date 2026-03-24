import { NextRequest, NextResponse } from 'next/server'
import { runSimulation } from '@/lib/engine'
import type { SimulationResult } from '@/lib/types'
import { normalizePublicPolicyConfig } from '@/lib/publicPolicyConfig'
import {
  PUBLIC_RATE_LIMITS,
  checkPublicRateLimit,
  getRequestFingerprint,
} from '@/lib/security/publicRateLimit'

/**
 * POST /api/simulate
 * Run a policy simulation with the given configuration
 *
 * Request body: Partial PolicyConfig
 * Response: Complete SimulationResult with all fiscal metrics
 *
 * Example:
 * POST /api/simulate
 * {
 *   "tokenTaxRate": 0.0035,
 *   "ubiAnnualPerAdult": 12000,
 *   "breakoutPoint": 60000
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkPublicRateLimit(
      'simulate',
      getRequestFingerprint(request.headers),
      PUBLIC_RATE_LIMITS.simulate
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many simulation requests. Try again in about ${rateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const config = normalizePublicPolicyConfig(body)

    // Run simulation
    const result: SimulationResult = runSimulation(config)

    // Return result with metadata
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        config: {
          tokenTaxRate: config.tokenTaxRate,
          ubiAnnualPerAdult: config.ubiAnnualPerAdult,
          breakoutPoint: config.breakoutPoint,
          ubiDependent1: config.ubiDependent1,
          ubiDependent2: config.ubiDependent2,
          ubiDependent3: config.ubiDependent3,
        },
        result: {
          revenue: result.revenue,
          obligations: result.obligations,
          balance: result.balance,
          citizenModel: result.citizenModel,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && /must be|Configuration must/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Simulation error:', error)
    return NextResponse.json(
      { error: 'Failed to run simulation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/simulate
 * Returns API documentation and usage examples
 */
export async function GET() {
  return NextResponse.json({
    api: 'NAiERM API v2.1 (National AI Economy Resiliency Model)',
    endpoint: '/api/simulate',
    methods: ['POST'],
    description: 'Run economic resilience policy simulations programmatically',
    documentation: {
      request: {
        method: 'POST',
        contentType: 'application/json',
        parameters: {
          tokenTaxRate: {
            type: 'number',
            range: '0.001 - 0.01',
            default: 0.0035,
            description: 'Proportional tax rate on digital capital transactions',
          },
          ubiAnnualPerAdult: {
            type: 'number',
            range: '0 - 20000',
            default: 12000,
            description: 'Annual Basic Economic Liquidity (BEL) amount per adult in USD',
          },
          breakoutPoint: {
            type: 'number',
            range: '30000 - 100000',
            default: 60000,
            description: 'Income threshold where SBI (Systemic Bonus Incentive) phases out in USD',
          },
          ubiDependent1: {
            type: 'number',
            default: 6000,
            description: 'Annual BEL dependent tier 1 amount in USD',
          },
          ubiDependent2: {
            type: 'number',
            default: 4000,
            description: 'Annual BEL dependent tier 2 amount in USD',
          },
          ubiDependent3: {
            type: 'number',
            default: 2000,
            description: 'Annual BEL dependent tier 3 amount in USD',
          },
        },
      },
      response: {
        status: 200,
        example: {
          success: true,
          timestamp: '2026-02-23T12:00:00.000Z',
          config: {
            tokenTaxRate: 0.0035,
            ubiAnnualPerAdult: 12000,
            breakoutPoint: 60000,
          },
          result: {
            revenue: {
              tokenTaxRevenue: 3500000000000,
              incomeTaxRevenue: 1234567890000,
              welfareSavingsCredit: 630000000000,
              totalRevenue: 5364567890000,
            },
            obligations: {
              ubiCost: 3180000000000,
              govtOperatingRequirement: 2740000000000,
              totalObligations: 5920000000000,
            },
            balance: {
              surplusDeficit: -555432110000,
              isSolvent: false,
            },
          },
        },
      },
      examples: [
        {
          description: 'Basic simulation with defaults',
          request: 'POST /api/simulate\n{}',
        },
        {
          description: 'Simulate higher BEL',
          request: 'POST /api/simulate\n{\n  "ubiAnnualPerAdult": 15000\n}',
        },
        {
          description: 'Simulate higher token tax',
          request: 'POST /api/simulate\n{\n  "tokenTaxRate": 0.006\n}',
        },
        {
          description: 'Test different breakout point',
          request: 'POST /api/simulate\n{\n  "breakoutPoint": 75000,\n  "tokenTaxRate": 0.005\n}',
        },
      ],
    },
  })
}

