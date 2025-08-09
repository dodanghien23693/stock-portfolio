import { NextResponse } from "next/server";
import { 
  TRADING_STRATEGIES, 
  STRATEGY_CATEGORIES, 
  STRATEGY_DESCRIPTIONS 
} from "@/lib/trading-strategies";

export async function GET() {
  try {
    const strategies = Object.entries(TRADING_STRATEGIES).map(([key, strategy]) => ({
      key,
      name: strategy.name,
      description: strategy.description,
      parameters: strategy.parameters,
      category: findStrategyCategory(key),
    }));

    return NextResponse.json({
      strategies,
      categories: STRATEGY_CATEGORIES,
      descriptions: STRATEGY_DESCRIPTIONS,
    });
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategies" },
      { status: 500 }
    );
  }
}

function findStrategyCategory(strategyKey: string): string {
  for (const [category, strategies] of Object.entries(STRATEGY_CATEGORIES)) {
    if ((strategies as readonly string[]).includes(strategyKey)) {
      return category;
    }
  }
  return "Other";
}
