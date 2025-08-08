import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        stockData: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    })

    // Transform data to include current price and changes
    const stocksWithPrices = stocks.map((stock: any) => {
      const latestData = stock.stockData[0]
      // Calculate change from previous day if available
      const prevPrice = latestData ? latestData.open : 0
      const currentPrice = latestData ? latestData.close : 0
      const change = currentPrice - prevPrice
      const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0
      
      return {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        sector: stock.sector,
        industry: stock.industry,
        marketCap: stock.marketCap,
        currentPrice: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: latestData?.volume || 0,
      }
    })

    return NextResponse.json(stocksWithPrices)
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, name, exchange, sector, industry } = body

    const stock = await prisma.stock.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
        exchange,
        sector,
        industry,
      },
    })

    return NextResponse.json(stock, { status: 201 })
  } catch (error) {
    console.error('Error creating stock:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
