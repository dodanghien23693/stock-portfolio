import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vietnamStockAPI } from '@/lib/vnstock-api'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const refresh = url.searchParams.get("refresh") === "true";
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          {
            symbol: {
              contains: search.toUpperCase(),
              mode: "insensitive" as const,
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      };
    }
    
    const stocks = await prisma.stock.findMany({
      where: whereClause,
      orderBy: { symbol: 'asc' },
      take: limit,
    });

    // If refresh is requested, try to update prices from API
    if (refresh && stocks.length > 0) {
      console.log("Refreshing stock prices from VietnamStockAPI...");
      
      // Update prices for each stock (limit to first 10 to avoid rate limiting)
      const updatePromises = stocks.slice(0, 10).map(async (stock) => {
        try {
          const priceData = await vietnamStockAPI.getStockPrice(stock.symbol);
          if (priceData) {
            await prisma.stock.update({
              where: { id: stock.id },
              data: {
                currentPrice: priceData.price,
                changePercent: priceData.changePercent,
                volume: priceData.volume,
                updatedAt: new Date(),
              },
            });
            return { ...stock, ...priceData };
          }
        } catch (error) {
          console.error(`Error updating ${stock.symbol}:`, error);
        }
        return stock;
      });

      const updatedStocks = await Promise.all(updatePromises);
      
      // Refresh the stocks data from database
      const refreshedStocks = await prisma.stock.findMany({
        orderBy: { symbol: 'asc' }
      });
      
      return NextResponse.json(transformStocks(refreshedStocks));
    }

    return NextResponse.json(transformStocks(stocks));
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function transformStocks(stocks: any[]) {
  return stocks.map((stock: any) => {
    // Use database values directly since we store current price info in stock table
    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange || "HOSE",
      sector: stock.sector,
      industry: stock.industry,
      marketCap: stock.marketCap,
      currentPrice: stock.currentPrice || 0,
      change: 0, // Will be calculated from changePercent if needed
      changePercent: stock.changePercent || 0,
      volume: stock.volume || 0,
      lastUpdated: stock.updatedAt,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, name, exchange, sector, industry } = body

    // Try to get stock info from VietnamStockAPI
    const stockInfo = await vietnamStockAPI.getStockInfo(symbol.toUpperCase());
    const stockPrice = await vietnamStockAPI.getStockPrice(symbol.toUpperCase());

    const stock = await prisma.stock.create({
      data: {
        symbol: symbol.toUpperCase(),
        name: stockInfo?.companyName || name,
        exchange: stockInfo?.exchange || exchange || "HOSE",
        sector: stockInfo?.sector || sector,
        industry: stockInfo?.industry || industry,
        marketCap: stockInfo?.marketCap,
        listedShares: stockInfo?.listedShares,
        currentPrice: stockPrice?.price,
        changePercent: stockPrice?.changePercent,
        volume: stockPrice?.volume,
      },
    })

    return NextResponse.json(stock, { status: 201 })
  } catch (error) {
    console.error('Error creating stock:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
