import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { backtestEngine } from '@/lib/improved-backtest-engine'
import { TRADING_STRATEGIES } from '@/lib/trading-strategies'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { strategy, symbols } = await request.json()

    // Check if backtest belongs to user
    const backtest = await prisma.backtest.findFirst({
      where: { id, userId: user.id }
    })

    if (!backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 })
    }

    // Get strategy
    const tradingStrategy = TRADING_STRATEGIES[strategy]
    if (!tradingStrategy) {
      return NextResponse.json({ 
        error: 'Invalid strategy',
        availableStrategies: Object.keys(TRADING_STRATEGIES)
      }, { status: 400 })
    }

    console.log(`Running backtest ${id} with strategy ${strategy} for symbols: ${symbols.join(', ')}`)

    // Run backtest in background
    const result = await backtestEngine.runBacktest(
      id,
      tradingStrategy,
      symbols,
      backtest.startDate,
      backtest.endDate,
      backtest.initialCash
    )

    return NextResponse.json({
      success: true,
      result,
      strategy: {
        name: tradingStrategy.name,
        description: tradingStrategy.description
      }
    })
  } catch (error) {
    console.error('Error running backtest:', error)
    return NextResponse.json(
      { 
        error: 'Failed to run backtest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
