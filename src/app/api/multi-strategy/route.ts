import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BacktestEngine } from "@/lib/improved-backtest-engine";
import { TRADING_STRATEGIES } from "@/lib/trading-strategies";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface StrategyAllocation {
  strategyKey: string;
  allocation: number; // Percentage (0-100)
  parameters?: any;
}

interface MultiStrategyRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  initialCash: number;
  stockSymbols: string[];
  strategies: StrategyAllocation[];
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
      stockSymbols,
      strategies,
    }: MultiStrategyRequest = await request.json();

    // Validate allocations sum to 100%
    const totalAllocation = strategies.reduce(
      (sum, s) => sum + s.allocation,
      0
    );
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return NextResponse.json(
        { error: "Strategy allocations must sum to 100%" },
        { status: 400 }
      );
    }

    // Validate strategies exist
    for (const strategyAllocation of strategies) {
      if (!TRADING_STRATEGIES[strategyAllocation.strategyKey]) {
        return NextResponse.json(
          { error: `Invalid strategy: ${strategyAllocation.strategyKey}` },
          { status: 400 }
        );
      }
    }

    const results: any[] = [];
    const engine = new BacktestEngine();

    // Run backtest for each strategy with allocated capital
    for (const strategyAllocation of strategies) {
      const strategy = TRADING_STRATEGIES[strategyAllocation.strategyKey];
      const allocatedCapital =
        (initialCash * strategyAllocation.allocation) / 100;

      // Apply custom parameters if provided
      const customStrategy = strategyAllocation.parameters
        ? {
            ...strategy,
            parameters: {
              ...strategy.parameters,
              ...strategyAllocation.parameters,
            },
          }
        : strategy;

      // Create individual backtest for this strategy
      const backtest = await prisma.backtest.create({
        data: {
          userId: user.id,
          name: `${name} - ${strategy.name}`,
          description: `${description || ""} (${
            strategyAllocation.allocation
          }% allocation)`,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          initialCash: allocatedCapital,
          status: "pending",
        },
      });

      try {
        const result = await engine.runBacktest(
          backtest.id,
          customStrategy,
          stockSymbols,
          new Date(startDate),
          new Date(endDate),
          allocatedCapital
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

        results.push({
          strategyKey: strategyAllocation.strategyKey,
          strategyName: strategy.name,
          allocation: strategyAllocation.allocation,
          allocatedCapital,
          finalValue: result.finalCash,
          totalReturn: result.totalReturnPercent,
          totalTrades: result.totalTrades,
          winRate: result.winRate,
          maxDrawdown: result.maxDrawdown,
          sharpeRatio: result.sharpeRatio,
          backtestId: backtest.id,
        });
      } catch (error) {
        console.error(`Error running strategy ${strategy.name}:`, error);

        await prisma.backtest.update({
          where: { id: backtest.id },
          data: { status: "failed" },
        });

        results.push({
          strategyKey: strategyAllocation.strategyKey,
          strategyName: strategy.name,
          allocation: strategyAllocation.allocation,
          allocatedCapital,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Calculate portfolio-level metrics
    const successfulResults = results.filter((r) => !r.error);
    const totalFinalValue = successfulResults.reduce(
      (sum, r) => sum + r.finalValue,
      0
    );
    const portfolioReturn =
      ((totalFinalValue - initialCash) / initialCash) * 100;

    // Weighted average of metrics
    const weightedWinRate = successfulResults.reduce(
      (sum, r) => sum + (r.winRate * r.allocation) / 100,
      0
    );

    const maxPortfolioDrawdown = Math.max(
      ...successfulResults.map((r) => r.maxDrawdown || 0)
    );

    const portfolioSummary = {
      name,
      totalStrategies: strategies.length,
      successfulStrategies: successfulResults.length,
      initialCash: initialCash,
      finalValue: totalFinalValue,
      totalReturn: portfolioReturn,
      weightedWinRate,
      maxDrawdown: maxPortfolioDrawdown,
      strategies: results,
    };

    return NextResponse.json(portfolioSummary);
  } catch (error) {
    console.error("Error running multi-strategy backtest:", error);
    return NextResponse.json(
      { error: "Failed to run multi-strategy backtest" },
      { status: 500 }
    );
  }
}
