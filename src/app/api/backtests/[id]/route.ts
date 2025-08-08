import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const backtest = await prisma.backtest.findFirst({
      where: { 
        id,
        userId: user.id 
      },
      include: {
        trades: {
          include: {
            stock: true
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!backtest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 })
    }

    return NextResponse.json(backtest)
  } catch (error) {
    console.error('Error fetching backtest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backtest' },
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

    // Check if backtest belongs to user
    const existingBacktest = await prisma.backtest.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingBacktest) {
      return NextResponse.json({ error: 'Backtest not found' }, { status: 404 })
    }

    await prisma.backtest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting backtest:', error)
    return NextResponse.json(
      { error: 'Failed to delete backtest' },
      { status: 500 }
    )
  }
}
