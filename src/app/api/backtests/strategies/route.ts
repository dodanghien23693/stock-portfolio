import { NextResponse } from 'next/server'
import { TRADING_STRATEGIES, STRATEGY_CATEGORIES, STRATEGY_DESCRIPTIONS } from '@/lib/trading-strategies'

export async function GET() {
  try {
    const strategies = Object.keys(TRADING_STRATEGIES).map(key => {
      const strategy = TRADING_STRATEGIES[key]
      return {
        key,
        name: strategy.name,
        description: strategy.description || STRATEGY_DESCRIPTIONS[key as keyof typeof STRATEGY_DESCRIPTIONS] || '',
        parameters: strategy.parameters || {}
      }
    })

    return NextResponse.json({
      strategies,
      categories: STRATEGY_CATEGORIES,
      total: strategies.length
    })
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}
