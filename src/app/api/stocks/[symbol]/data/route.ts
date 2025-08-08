import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vietnamStockAPI } from "@/lib/vnstock-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: symbolParam } = await params;
    const symbol = symbolParam.toUpperCase();
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "1Y";
    const forceRefresh = url.searchParams.get("refresh") === "true";

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1D":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "1W":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "5Y":
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // Try to get stock info from database first
    let stock = await prisma.stock.findUnique({
      where: { symbol },
    });

    // Get historical data from StockHistory table
    const stockHistory = await prisma.stockHistory.findMany({
      where: {
        symbol: symbol,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0],
        },
      },
      orderBy: { date: "asc" },
    });

    // Check if we need to fetch fresh data from API
    const shouldFetchFromAPI =
      forceRefresh ||
      !stock ||
      stockHistory.length === 0 ||
      (stock.updatedAt &&
        Date.now() - stock.updatedAt.getTime() > 60 * 60 * 1000); // 1 hour cache

    if (shouldFetchFromAPI) {
      try {
        console.log(
          `Fetching fresh data for ${symbol} from VietnamStockAPI...`
        );

        // Fetch data from VietnamStockAPI
        const [stockInfo, stockHistoryApi, stockPrice] = await Promise.all([
          vietnamStockAPI.getStockInfo(symbol),
          vietnamStockAPI.getStockHistory(symbol, period),
          vietnamStockAPI.getStockPrice(symbol),
        ]);

        if (stockHistoryApi && stockHistoryApi.data.length > 0) {
          // Update or create stock info
          stock = await prisma.stock.upsert({
            where: { symbol },
            create: {
              symbol,
              name: stockInfo?.companyName || symbol,
              exchange: stockInfo?.exchange || "HOSE",
              sector: stockInfo?.sector,
              industry: stockInfo?.industry,
              currentPrice: stockPrice?.price,
              changePercent: stockPrice?.changePercent,
              volume: stockPrice?.volume,
              marketCap: stockInfo?.marketCap,
              listedShares: stockInfo?.listedShares,
            },
            update: {
              name: stockInfo?.companyName || stock?.name || symbol,
              exchange: stockInfo?.exchange || stock?.exchange || "HOSE",
              sector: stockInfo?.sector || stock?.sector,
              industry: stockInfo?.industry || stock?.industry,
              currentPrice: stockPrice?.price,
              changePercent: stockPrice?.changePercent,
              volume: stockPrice?.volume,
              marketCap: stockInfo?.marketCap || stock?.marketCap,
              listedShares: stockInfo?.listedShares || stock?.listedShares,
              updatedAt: new Date(),
            },
          });

          // Clear old stock history in the date range
          await prisma.stockHistory.deleteMany({
            where: {
              symbol: symbol,
              date: {
                gte: startDate.toISOString().split('T')[0],
                lte: endDate.toISOString().split('T')[0],
              },
            },
          });

          // Insert new stock history
          const stockHistoryToInsert = stockHistoryApi.data
            .filter((item) => {
              const itemDate = new Date(item.date);
              return itemDate >= startDate && itemDate <= endDate;
            })
            .map((item) => ({
              symbol: symbol,
              date: item.date,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: item.volume,
              value: item.value,
            }));

          if (stockHistoryToInsert.length > 0) {
            await prisma.stockHistory.createMany({
              data: stockHistoryToInsert,
              skipDuplicates: true,
            });

            // Fetch updated stock history
            const updatedStockHistory = await prisma.stockHistory.findMany({
              where: {
                symbol: symbol,
                date: {
                  gte: startDate.toISOString().split('T')[0],
                  lte: endDate.toISOString().split('T')[0],
                },
              },
              orderBy: { date: "asc" },
            });

            return NextResponse.json({
              stock: {
                id: stock.id,
                symbol: stock.symbol,
                name: stock.name,
                exchange: stock.exchange,
                sector: stock.sector,
                industry: stock.industry,
                currentPrice: stock.currentPrice,
                changePercent: stock.changePercent,
                volume: stock.volume,
                marketCap: stock.marketCap,
                listedShares: stock.listedShares,
                lastUpdated: stock.updatedAt,
              },
              data: updatedStockHistory.map((data: any) => ({
                date: data.date,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
                volume: data.volume,
                value: data.value,
              })),
              dataSource: "api",
            });
          }
        }
      } catch (apiError) {
        console.error("Error fetching from VietnamStockAPI:", apiError);
        // Continue with database data if API fails
      }
    }

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({
      stock: {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        sector: stock.sector,
        industry: stock.industry,
        currentPrice: stock.currentPrice,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap,
        listedShares: stock.listedShares,
        lastUpdated: stock.updatedAt,
      },
      data: stockHistory.map((data: any) => ({
        date: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        value: data.value,
      })),
      dataSource: shouldFetchFromAPI ? "api" : "cache",
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
