import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const { name, description, startDate, endDate, initialCash, strategy } =
      await request.json();

    const backtest = await prisma.backtest.create({
      data: {
        userId: user.id,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        initialCash,
        status: "pending",
      },
      include: {
        trades: {
          include: {
            stock: true,
          },
        },
      },
    });

    // Start backtest execution (this would be done in background)
    // For now, we'll just mark it as completed
    // TODO: Implement actual backtest strategy execution

    return NextResponse.json(backtest);
  } catch (error) {
    console.error("Error creating backtest:", error);
    return NextResponse.json(
      { error: "Failed to create backtest" },
      { status: 500 }
    );
  }
}
