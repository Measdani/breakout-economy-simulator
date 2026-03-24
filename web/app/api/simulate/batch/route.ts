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
 * POST /api/simulate/batch
 * Run multiple policy simulations in batch for comparative analysis
 *
 * Request body: { scenarios: Array<{name: string, config: Partial<PolicyConfig>}> }
 * Response: Array of SimulationResults with names for easy comparison
 *
 * Example:
 * POST /api/simulate/batch
 * {
 *   "scenarios": [
 *     {"name": "Conservative", "config": {"tokenTaxRate": 0.003}},
 *     {"name": "Moderate", "config": {"tokenTaxRate": 0.0035}},
 *     {"name": "Aggressive", "config": {"tokenTaxRate": 0.005}}
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkPublicRateLimit(
      'simulate-batch',
      getRequestFingerprint(request.headers),
      PUBLIC_RATE_LIMITS.simulateBatch
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many batch simulation requests. Try again in about ${rateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (!body.scenarios || !Array.isArray(body.scenarios)) {
      return NextResponse.json(
        { error: 'Request must include "scenarios" array' },
        { status: 400 }
      )
    }

    if (body.scenarios.length === 0) {
      return NextResponse.json(
        { error: 'scenarios array cannot be empty' },
        { status: 400 }
      )
    }

    if (body.scenarios.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 scenarios per batch' },
        { status: 400 }
      )
    }

    // Run simulations
    const results = body.scenarios.map((scenario: any, idx: number) => {
      const scenarioName = scenario.name || `Scenario ${idx + 1}`

      if (!scenario.config || typeof scenario.config !== 'object') {
        throw new Error(`Scenario "${scenarioName}" has invalid config`)
      }
      const config = normalizePublicPolicyConfig(scenario.config)

      const result: SimulationResult = runSimulation(config)

      return {
        name: scenarioName,
        config: {
          tokenTaxRate: config.tokenTaxRate,
          ubiAnnualPerAdult: config.ubiAnnualPerAdult,
          breakoutPoint: config.breakoutPoint,
        },
        result: {
          revenue: result.revenue,
          obligations: result.obligations,
          balance: result.balance,
        },
      }
    })

    // Calculate comparative metrics
    const comparative = {
      count: results.length,
      solventCount: results.filter((r: any) => r.result.balance.isSolvent).length,
      deficitCount: results.filter((r: any) => !r.result.balance.isSolvent).length,
      avgBalance: results.reduce((sum: number, r: any) => sum + r.result.balance.surplusDeficit, 0) / results.length / 1e9,
      maxBalance: Math.max(...results.map((r: any) => r.result.balance.surplusDeficit)) / 1e9,
      minBalance: Math.min(...results.map((r: any) => r.result.balance.surplusDeficit)) / 1e9,
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        scenarios: results,
        comparative,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && /must be|Configuration must|Scenario/.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Batch simulation error:', error)
    return NextResponse.json(
      { error: 'Failed to run batch simulation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/simulate/batch
 * Returns batch API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/simulate/batch',
    method: 'POST',
    description: 'Run multiple policy simulations for comparative analysis',
    useCase: 'Compare policy scenarios side-by-side to identify tradeoffs',
    documentation: {
      request: {
        contentType: 'application/json',
        body: {
          scenarios: [
            {
              name: 'string (optional)',
              config: 'Partial<PolicyConfig>',
            },
          ],
        },
        example: {
          scenarios: [
            {
              name: 'Conservative BEL',
              config: {
                ubiAnnualPerAdult: 10000,
                tokenTaxRate: 0.003,
              },
            },
            {
              name: 'Generous BEL',
              config: {
                ubiAnnualPerAdult: 15000,
                tokenTaxRate: 0.005,
              },
            },
          ],
        },
      },
      response: {
        scenarios: [
          {
            name: 'Scenario name',
            config: { tokenTaxRate: 0.0035, ubiAnnualPerAdult: 12000, breakoutPoint: 60000 },
            result: {
              revenue: { tokenTaxRevenue: 0, incomeTaxRevenue: 0, welfareSavingsCredit: 0, totalRevenue: 0 },
              obligations: { ubiCost: 0, govtOperatingRequirement: 0, totalObligations: 0 },
              balance: { surplusDeficit: 0, isSolvent: false },
            },
          },
        ],
        comparative: {
          count: 2,
          solventCount: 1,
          deficitCount: 1,
          avgBalance: 0,
          maxBalance: 0,
          minBalance: 0,
        },
      },
    },
  })
}
