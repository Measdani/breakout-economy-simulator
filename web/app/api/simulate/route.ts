import { NextRequest, NextResponse } from 'next/server'
import { runSimulation } from '@/lib/engine'
import type { PolicyConfig, SimulationResult } from '@/lib/types'

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
    const body = await request.json()

    // Validate input is a partial config
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid PolicyConfig object' },
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

    // Merge provided config with defaults
    const config: PolicyConfig = {
      ...DEFAULT_CONFIG,
      ...body,
    }

    // Validate critical parameters
    if (config.tokenTaxRate < 0.001 || config.tokenTaxRate > 0.01) {
      return NextResponse.json(
        { error: 'tokenTaxRate must be between 0.001 and 0.01' },
        { status: 400 }
      )
    }

    if (config.ubiAnnualPerAdult < 0 || config.ubiAnnualPerAdult > 20000) {
      return NextResponse.json(
        { error: 'ubiAnnualPerAdult must be between $0 and $20,000' },
        { status: 400 }
      )
    }

    if (config.breakoutPoint < 30000 || config.breakoutPoint > 100000) {
      return NextResponse.json(
        { error: 'breakoutPoint must be between $30,000 and $100,000' },
        { status: 400 }
      )
    }

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
    api: 'NAIERM API v2.1 (National AI Economy Resiliency Model)',
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
            description: 'Annual Universal Basic Income per adult in USD',
          },
          breakoutPoint: {
            type: 'number',
            range: '30000 - 100000',
            default: 60000,
            description: 'Income threshold where UBI supplement phases out in USD',
          },
          ubiDependent1: {
            type: 'number',
            default: 6000,
            description: 'Annual UBI for first dependent child in USD',
          },
          ubiDependent2: {
            type: 'number',
            default: 4000,
            description: 'Annual UBI for second dependent child in USD',
          },
          ubiDependent3: {
            type: 'number',
            default: 2000,
            description: 'Annual UBI for third+ dependent children in USD',
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
          description: 'Simulate higher UBI',
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

