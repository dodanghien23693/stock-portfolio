import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: symbolParam } = await params
    const symbol = symbolParam.toUpperCase()
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '1Y'

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '1W':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5)
        break
      default:
        startDate.setFullYear(endDate.getFullYear() - 1)
    }

    const stock = await prisma.stock.findUnique({
      where: { symbol },
      include: {
        stockData: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    return NextResponse.json({
      stock: {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        sector: stock.sector,
        industry: stock.industry,
      },
      data: stock.stockData.map((data: any) => ({
        date: data.date.toISOString().split('T')[0],
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        value: data.value,
      }))
    })
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
