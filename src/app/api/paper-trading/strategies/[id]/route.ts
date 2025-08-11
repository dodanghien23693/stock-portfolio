import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { mockActiveStrategies } from "../../route";

interface RouteParams {
  params: {
    id: string;
  };
}

// DELETE - Delete a paper trading strategy
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const strategyId = params.id;

    // Find strategy in mock data
    const strategyIndex = mockActiveStrategies.findIndex(s => s.id === strategyId);
    
    if (strategyIndex === -1) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    // Remove strategy from mock data
    mockActiveStrategies.splice(strategyIndex, 1);

    // TODO: In real implementation, you would:
    // 1. Find the strategy by ID and user ID
    // 2. Check if the user owns this strategy
    // 3. Close all open positions for this strategy
    // 4. Delete the strategy record
    // 5. Update the user's cash balance if needed

    return NextResponse.json({ 
      success: true, 
      message: "Strategy deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting paper trading strategy:", error);
    return NextResponse.json(
      { error: "Failed to delete strategy" },
      { status: 500 }
    );
  }
}

// GET - Get specific strategy details
export async function GET(request: Request, { params }: RouteParams) {
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

    const strategyId = params.id;

    // TODO: Implement actual database query
    // Mock data for now
    const strategy = {
      id: strategyId,
      name: "Mock Strategy",
      status: "active",
      totalReturn: 2.5,
      dayChange: 0.8,
      startDate: new Date().toISOString(),
      positions: [],
    };

    return NextResponse.json(strategy);

  } catch (error) {
    console.error("Error fetching strategy details:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}

// PUT - Update strategy (pause/resume/stop)
export async function PUT(request: Request, { params }: RouteParams) {
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

    const strategyId = params.id;
    const { action } = await request.json();

    // Find strategy in mock data
    const strategy = mockActiveStrategies.find(s => s.id === strategyId);
    
    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    // Update strategy status based on action
    switch (action) {
      case "pause":
        strategy.status = "paused";
        break;
      case "resume":
        strategy.status = "active";
        break;
      case "stop":
        strategy.status = "stopped";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Strategy ${action}d successfully`,
      strategy 
    });

  } catch (error) {
    console.error("Error updating strategy:", error);
    return NextResponse.json(
      { error: "Failed to update strategy" },
      { status: 500 }
    );
  }
}
