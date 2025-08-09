import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BacktestEngine } from "@/lib/improved-backtest-engine";
import { TRADING_STRATEGIES } from "@/lib/trading-strategies";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    const backtests = await prisma.backtest.findMany({
      where: { userId: user.id },
      include: {
        trades: {
          include: {
            stock: true,
          },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(backtests);
  } catch (error) {
    console.error("Error fetching backtests:", error);
    return NextResponse.json(
      { error: "Failed to fetch backtests" },
      { status: 500 }
    );
  }
}

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

    const {
      name,
      description,
      startDate,
      endDate,
      initialCash,
      strategyKey,
      strategyParams,
      stockSymbols,
    } = await request.json();

    // Debug logging
    console.log("Request data:", {
      name,
      description,
      startDate,
      endDate,
      initialCash,
      initialCashType: typeof initialCash,
      strategyKey,
      strategyParams,
      stockSymbols,
    });

    // Validate strategy
    const strategy = TRADING_STRATEGIES[strategyKey];
    if (!strategy) {
      return NextResponse.json(
        { error: "Invalid strategy selected" },
        { status: 400 }
      );
    }

    // Validate initialCash
    if (!initialCash || isNaN(parseFloat(initialCash))) {
      return NextResponse.json(
        { error: "Initial cash must be a valid number" },
        { status: 400 }
      );
    }

    // Create backtest record
    const backtest = await prisma.backtest.create({
      data: {
        userId: user.id,
        name,
        description: description || strategy.description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        initialCash: parseFloat(initialCash),
        status: "pending",
      },
    });

    // Run backtest in background
    try {
      const engine = new BacktestEngine();

      // Apply custom parameters to strategy if provided
      const customStrategy = strategyParams
        ? {
            ...strategy,
            parameters: { ...strategy.parameters, ...strategyParams },
          }
        : strategy;

      const result = await engine.runBacktest(
        backtest.id,
        customStrategy,
        stockSymbols || ["VCB", "VIC", "GAS", "MSN"], // Default symbols
        new Date(startDate),
        new Date(endDate),
        initialCash
      );

      // Update backtest with results
      await prisma.backtest.update({
        where: { id: backtest.id },
        data: {
          status: "completed",
          finalCash: result.finalCash,
          totalReturn: result.totalReturnPercent / 100,
          maxDrawdown: result.maxDrawdown,
          winRate: result.winRate,
          sharpeRatio: result.sharpeRatio,
        },
      });

      // Return updated backtest with trades
      const updatedBacktest = await prisma.backtest.findUnique({
        where: { id: backtest.id },
        include: {
          trades: {
            include: {
              stock: true,
            },
            orderBy: { date: "asc" },
          },
        },
      });

      return NextResponse.json(updatedBacktest);
    } catch (backtestError: any) {
      console.error("Backtest execution error:", backtestError);

      // Mark backtest as failed
      await prisma.backtest.update({
        where: { id: backtest.id },
        data: {
          status: "failed",
        },
      });

      return NextResponse.json(
        {
          error: "Backtest execution failed",
          details: backtestError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating backtest:", error);
    return NextResponse.json(
      { error: "Failed to create backtest" },
      { status: 500 }
    );
  }
}
