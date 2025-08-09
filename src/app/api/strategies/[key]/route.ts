import { NextResponse } from "next/server";
import { STRATEGY_DETAILS } from "@/lib/strategy-details";

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const strategyKey = params.key;
    const strategyDetail = STRATEGY_DETAILS[strategyKey as keyof typeof STRATEGY_DETAILS];

    if (!strategyDetail) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(strategyDetail);
  } catch (error) {
    console.error("Error fetching strategy detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategy detail" },
      { status: 500 }
    );
  }
}
