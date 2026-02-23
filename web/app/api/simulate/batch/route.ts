import { NextRequest, NextResponse } from 'next/server'
import { runSimulation } from '@/lib/engine'
import type { PolicyConfig, SimulationResult } from '@/lib/types'

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

    // Default config values
    const DEFAULT_CONFIG: PolicyConfig = {
      tokenTaxRate: 0.0035,
      flowBaseAnnual: 1e15,
      ubiAnnualPerAdult: 12000,
      adultPopulation: 265000000,
      welfareSavingsCredit: 630e9,
      govtOperatingRequirement: 2.74e12,
      breakoutPoint: 60000,
      tier1Rate: 0.19,
      tier1Start: 60000,
      tier2Rate: 0.29,
      tier2Start: 135000,
      supplementApexIncome: 24000,
      supplementApexBonus: 6000,
      personaWeights: [0.25, 0.25, 0.25, 0.25],
      ubiDependent1: 6000,
      ubiDependent2: 4000,
      ubiDependent3: 2000,
      pctHouseholds1Dep: 0.25,
      pctHouseholds2Dep: 0.15,
      pctHouseholds3Dep: 0.10,
    }

    // Run simulations
    const results = body.scenarios.map((scenario: any, idx: number) => {
      const scenarioName = scenario.name || `Scenario ${idx + 1}`

      if (!scenario.config || typeof scenario.config !== 'object') {
        throw new Error(`Scenario "${scenarioName}" has invalid config`)
      }

      const config: PolicyConfig = {
        ...DEFAULT_CONFIG,
        ...scenario.config,
      }

      // Validate critical parameters
      if (config.tokenTaxRate < 0.001 || config.tokenTaxRate > 0.01) {
        throw new Error(`Scenario "${scenarioName}": tokenTaxRate must be between 0.001 and 0.01`)
      }

      if (config.ubiAnnualPerAdult < 0 || config.ubiAnnualPerAdult > 20000) {
        throw new Error(`Scenario "${scenarioName}": ubiAnnualPerAdult must be between $0 and $20,000`)
      }

      if (config.breakoutPoint < 30000 || config.breakoutPoint > 100000) {
        throw new Error(`Scenario "${scenarioName}": breakoutPoint must be between $30,000 and $100,000`)
      }

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
              name: 'Conservative UBI',
              config: {
                ubiAnnualPerAdult: 10000,
                tokenTaxRate: 0.003,
              },
            },
            {
              name: 'Generous UBI',
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
