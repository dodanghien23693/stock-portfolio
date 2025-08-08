import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const stockCount = await prisma.stock.count();
    
    // Get sample stocks
    const sampleStocks = await prisma.stock.findMany({
      take: 5,
      orderBy: { symbol: 'asc' }
    });
    
    return NextResponse.json({
      status: "success",
      message: "Database connection OK",
      stockCount,
      sampleStocks: sampleStocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        currentPrice: stock.currentPrice
      }))
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
