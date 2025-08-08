import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { symbol, priceData, historyData } = await request.json()

    // Update or create stock
    const stock = await prisma.stock.upsert({
      where: { symbol },
      update: {
        name: priceData.companyName || symbol,
        currentPrice: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: priceData.volume,
        updatedAt: new Date()
      },
      create: {
        symbol,
        name: priceData.companyName || symbol,
        exchange: priceData.exchange || 'HOSE', // Default to HOSE if not provided
        currentPrice: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: priceData.volume,
      }
    })

    // Update historical data
    if (historyData && historyData.length > 0) {
      // Delete old data for this symbol
      await prisma.stockData.deleteMany({
        where: { stockId: stock.id }
      })

      // Insert new historical data
      await prisma.stockData.createMany({
        data: historyData.map((item: any) => ({
          stockId: stock.id,
          date: new Date(item.date),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Stock ${symbol} synchronized successfully` 
    })
  } catch (error) {
    console.error('Error syncing stock data:', error)
    return NextResponse.json(
      { error: 'Failed to sync stock data' },
      { status: 500 }
    )
  }
}
