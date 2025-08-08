import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, symbols } = body;

    // Handle multiple symbols sync - delegate to Python service
    if (symbols && Array.isArray(symbols)) {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      
      try {
        const response = await fetch(`${pythonServiceUrl}/sync/stocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbols,
            period: "1Y"
          }),
        });

        if (response.ok) {
          return NextResponse.json({ 
            success: true, 
            message: `Sync started for ${symbols.length} symbols via Python service`
          });
        } else {
          throw new Error("Python service sync failed");
        }
      } catch (error) {
        // Fallback to manual sync if Python service is not available
        console.warn("Python service unavailable, falling back to manual sync");
        const results = [];
        for (const sym of symbols) {
          try {
            const result = await syncSingleStockManual(sym);
            results.push(result);
          } catch (error) {
            console.error(`Error syncing ${sym}:`, error);
            results.push({
              symbol: sym,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        return NextResponse.json({ results });
      }
    }

    // Handle single symbol sync
    if (symbol) {
      try {
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
        const response = await fetch(`${pythonServiceUrl}/sync/stocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbols: [symbol],
            period: "3M"
          }),
        });

        if (response.ok) {
          return NextResponse.json({ 
            success: true, 
            message: `Sync started for ${symbol} via Python service`
          });
        } else {
          throw new Error("Python service sync failed");
        }
      } catch (error) {
        console.warn("Python service unavailable, falling back to manual sync");
        const result = await syncSingleStockManual(symbol);
        return NextResponse.json(result);
      }
    }

    return NextResponse.json({ error: "No symbol provided" }, { status: 400 });
  } catch (error) {
    console.error("Error syncing stock data:", error);
    return NextResponse.json(
      { error: "Failed to sync stock data" },
      { status: 500 }
    );
  }
}

// Manual sync function for fallback (using existing TCBS API)
async function syncSingleStockManual(symbol: string) {
  try {
    console.log(`Manual syncing ${symbol} from TCBS API...`);

    // Get data from TCBS API as fallback
    const [priceResponse, historyResponse] = await Promise.all([
      fetch(`https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/${symbol}/overview`),
      fetch(`https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/${symbol}/prices-chart?size=90&resolution=1D`)
    ]);

    if (!priceResponse.ok) {
      throw new Error(`No price data found for ${symbol}`);
    }

    const priceData = await priceResponse.json();
    const historyData = historyResponse.ok ? await historyResponse.json() : null;

    // Update or create stock
    const stock = await prisma.stock.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: {
        name: symbol, // We don't have company name from TCBS overview
        exchange: "HOSE", // Default
        currentPrice: priceData.price,
        changePercent: priceData.percentPriceChange,
        volume: priceData.volume,
        high: priceData.high,
        low: priceData.low,
        open: priceData.open,
        close: priceData.price,
        tradingDate: priceData.tradingDate,
        updatedAt: new Date(),
      },
      create: {
        symbol: symbol.toUpperCase(),
        name: symbol,
        exchange: "HOSE",
        currentPrice: priceData.price,
        changePercent: priceData.percentPriceChange,
        volume: priceData.volume,
        tradingDate: priceData.tradingDate,
      },
    });

    // Update historical data if available
    if (historyData && historyData.data && historyData.data.length > 0) {
      // Delete old historical data for this symbol (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      await prisma.stockHistory.deleteMany({
        where: {
          symbol: symbol.toUpperCase(),
          date: {
            gte: threeMonthsAgo.toISOString().split('T')[0],
          },
        },
      });

      // Insert new historical data
      const historyRecords = historyData.data.map((item: any) => ({
        symbol: symbol.toUpperCase(),
        date: new Date(item.tradingDate).toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        value: item.volume * item.close,
      }));

      await prisma.stockHistory.createMany({
        data: historyRecords,
        skipDuplicates: true,
      });
    }

    return {
      symbol,
      success: true,
      message: `Stock ${symbol} synchronized successfully (manual fallback)`,
      dataPoints: historyData?.data?.length || 0,
    };
  } catch (error) {
    console.error(`Error syncing ${symbol}:`, error);
    return {
      symbol,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// GET endpoint for manual trigger
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const symbols = url.searchParams.get("symbols");
    const symbol = url.searchParams.get("symbol");

    if (symbols) {
      const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
      
      // Try Python service first
      try {
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
        const response = await fetch(`${pythonServiceUrl}/sync/stocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbols: symbolList,
            period: "1Y"
          }),
        });

        if (response.ok) {
          return NextResponse.json({
            message: `Synced ${symbolList.length} symbols via Python service`,
            success: true,
          });
        }
      } catch (error) {
        console.warn("Python service unavailable, using manual sync");
      }

      // Fallback to manual sync
      const results = [];
      for (const sym of symbolList) {
        const result = await syncSingleStockManual(sym);
        results.push(result);
      }

      return NextResponse.json({
        message: `Synced ${symbolList.length} symbols (manual fallback)`,
        results,
      });
    }

    if (symbol) {
      const result = await syncSingleStockManual(symbol.toUpperCase());
      return NextResponse.json(result);
    }

    // Default: sync some popular Vietnamese stocks
    const popularStocks = [
      "VNM", "VCB", "HPG", "VHM", "TCB", 
      "BID", "CTG", "VIC", "MSN", "POW"
    ];
    
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${pythonServiceUrl}/sync/stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: popularStocks,
          period: "1Y"
        }),
      });

      if (response.ok) {
        return NextResponse.json({
          message: `Synced ${popularStocks.length} popular stocks via Python service`,
          success: true,
        });
      }
    } catch (error) {
      console.warn("Python service unavailable, using manual sync");
    }

    // Fallback to manual sync
    const results = [];
    for (const sym of popularStocks) {
      const result = await syncSingleStockManual(sym);
      results.push(result);
    }

    return NextResponse.json({
      message: `Synced ${popularStocks.length} popular stocks (manual fallback)`,
      results,
    });
  } catch (error) {
    console.error("Error in GET sync:", error);
    return NextResponse.json(
      { error: "Failed to sync stock data" },
      { status: 500 }
    );
  }
}
