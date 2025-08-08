import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { symbol, quantity, avgPrice } = await request.json()

    // Check if portfolio belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Find or create stock
    let stock = await prisma.stock.findUnique({
      where: { symbol }
    })

    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          symbol,
          name: symbol,
          exchange: 'HOSE' // Default
        }
      })
    }

    // Add or update stock in portfolio
    const portfolioStock = await prisma.portfolioStock.upsert({
      where: {
        portfolioId_stockId: {
          portfolioId: id,
          stockId: stock.id
        }
      },
      update: {
        quantity,
        avgPrice
      },
      create: {
        portfolioId: id,
        stockId: stock.id,
        quantity,
        avgPrice
      },
      include: {
        stock: true
      }
    })

    return NextResponse.json(portfolioStock)
  } catch (error) {
    console.error('Error adding stock to portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to add stock to portfolio' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { stockId } = await request.json()

    // Check if portfolio belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    await prisma.portfolioStock.deleteMany({
      where: {
        portfolioId: id,
        stockId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing stock from portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to remove stock from portfolio' },
      { status: 500 }
    )
  }
}
