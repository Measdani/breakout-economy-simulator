import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/leaderboard
 * Retrieve top policy configurations ranked by fiscal sustainability
 *
 * Query parameters:
 * - limit: number (default: 10, max: 100) - number of results
 * - sortBy: 'balance' | 'solvency' | 'workIncentive' (default: 'balance')
 * - filter: 'solvent' | 'deficit' | 'all' (default: 'solvent')
 *
 * Response: Array of top configurations with their results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
    const sortBy = searchParams.get('sortBy') || 'balance'
    const filter = searchParams.get('filter') || 'solvent'

    const supabase = createServiceClient()

    // Build query
    let query = supabase
      .from('submissions')
      .select('id, name, config_name, token_tax_rate, ubi_annual, breakout_point, is_solvent, surplus_deficit, result, created_at')

    // Apply solvency filter
    if (filter === 'solvent') {
      query = query.eq('is_solvent', true)
    } else if (filter === 'deficit') {
      query = query.eq('is_solvent', false)
    }

    // Apply sorting
    if (sortBy === 'solvency') {
      query = query.order('is_solvent', { ascending: false })
    } else if (sortBy === 'workIncentive') {
      query = query.order('created_at', { ascending: false })
    } else {
      // Default: sort by balance (highest first)
      query = query.order('surplus_deficit', { ascending: false })
    }

    // Apply limit
    query = query.limit(limit)

    const { data: submissions, error } = await query

    if (error) {
      console.error('Leaderboard query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Calculate work incentive scores
    const leaderboard = (submissions || []).map((submission: any, idx: number) => {
      const personas = submission.result?.citizenModel?.personaOutcomes || []
      let workIncentiveScore = 0

      if (personas.length >= 2) {
        let totalRetention = 0,
          count = 0
        for (let i = 0; i < personas.length - 1; i++) {
          const incomeDiff = personas[i + 1].earnedIncome - personas[i].earnedIncome
          const netDiff = personas[i + 1].netIncome - personas[i].netIncome
          if (incomeDiff > 0) {
            totalRetention += (netDiff / incomeDiff) * 100
            count++
          }
        }
        workIncentiveScore = count > 0 ? totalRetention / count : 0
      }

      const totalRevenue = submission.result?.revenue?.totalRevenue || 0
      const tokenTaxRevenue = submission.result?.revenue?.tokenTaxRevenue || 0
      const tokenTaxPercent = totalRevenue > 0 ? (tokenTaxRevenue / totalRevenue) * 100 : 0

      return {
        rank: idx + 1,
        name: submission.name || 'Anonymous',
        configName: submission.config_name || 'Custom',
        policy: {
          tokenTaxRate: submission.token_tax_rate,
          ubiAnnual: submission.ubi_annual,
          breakoutPoint: submission.breakout_point,
        },
        fiscal: {
          balance: submission.surplus_deficit,
          isSolvent: submission.is_solvent,
          revenue: submission.result?.revenue?.totalRevenue || 0,
          obligations: submission.result?.obligations?.totalObligations || 0,
        },
        metrics: {
          workIncentiveScore: workIncentiveScore.toFixed(1),
          tokenTaxPercent: tokenTaxPercent.toFixed(1),
        },
        submittedAt: submission.created_at,
      }
    })

    // Calculate statistics
    const stats = {
      total: leaderboard.length,
      solvent: leaderboard.filter((r: any) => r.fiscal.isSolvent).length,
      deficit: leaderboard.filter((r: any) => !r.fiscal.isSolvent).length,
      avgBalance: leaderboard.length > 0
        ? leaderboard.reduce((sum: number, r: any) => sum + r.fiscal.balance, 0) / leaderboard.length / 1e9
        : 0,
      avgWorkIncentive: leaderboard.length > 0
        ? leaderboard.reduce((sum: number, r: any) => sum + parseFloat(r.metrics.workIncentiveScore), 0) / leaderboard.length
        : 0,
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        filters: { limit, sortBy, filter },
        stats,
        leaderboard,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
