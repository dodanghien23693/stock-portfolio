import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Get user's paper trading positions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, return mock data. Later we'll implement proper paper trading schema
    const paperTradingData = {
      totalValue: 1000000, // Starting with 1M VND
      cashBalance: 500000,
      positions: [
        {
          id: "1",
          symbol: "VCB",
          quantity: 100,
          avgPrice: 21.5,
          currentPrice: 22.1,
          unrealizedPnL: 60,
          strategy: "RSI Strategy",
        },
        {
          id: "2",
          symbol: "VIC",
          quantity: 200,
          avgPrice: 24.0,
          currentPrice: 23.5,
          unrealizedPnL: -100,
          strategy: "SMA Strategy",
        },
      ],
      activeStrategies: [
        {
          id: "strategy-1",
          name: "RSI Strategy",
          status: "active",
          totalReturn: 2.5,
          dayChange: 0.8,
        },
        {
          id: "strategy-2",
          name: "SMA Strategy",
          status: "active",
          totalReturn: -1.2,
          dayChange: -0.3,
        },
      ],
    };

    return NextResponse.json(paperTradingData);
  } catch (error) {
    console.error("Error fetching paper trading data:", error);
    return NextResponse.json(
      { error: "Failed to fetch paper trading data" },
      { status: 500 }
    );
  }
}

// POST - Start new paper trading strategy
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { strategyKey, strategyParams, initialCash, stockSymbols, name } =
      await request.json();

    // TODO: Implement paper trading strategy start logic
    // For now return success

    const paperTrading = {
      id: `paper-${Date.now()}`,
      name: name || `Paper Trading ${strategyKey}`,
      strategyKey,
      strategyParams,
      initialCash,
      stockSymbols,
      status: "active",
      startDate: new Date(),
      currentValue: initialCash,
      totalReturn: 0,
      positions: [],
    };

    return NextResponse.json(paperTrading);
  } catch (error) {
    console.error("Error starting paper trading:", error);
    return NextResponse.json(
      { error: "Failed to start paper trading" },
      { status: 500 }
    );
  }
}
