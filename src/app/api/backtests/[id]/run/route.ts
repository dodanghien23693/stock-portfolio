import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { backtestEngine, TRADING_STRATEGIES } from '@/lib/backtest-engine'

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
      return NextResponse.json({ error: 'Invalid strategy' }, { status: 400 })
    }

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
      result
    })
  } catch (error) {
    console.error('Error running backtest:', error)
    return NextResponse.json(
      { error: 'Failed to run backtest' },
      { status: 500 }
    )
  }
}
