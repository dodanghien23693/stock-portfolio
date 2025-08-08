import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
    
    const response = await fetch(`${pythonServiceUrl}/health`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        status: "healthy", 
        pythonService: data,
        url: pythonServiceUrl
      });
    } else {
      return NextResponse.json({ 
        status: "unhealthy", 
        error: `Python service returned ${response.status}`,
        url: pythonServiceUrl
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: "unreachable", 
      error: error instanceof Error ? error.message : "Unknown error",
      url: process.env.PYTHON_SERVICE_URL || "http://localhost:8001"
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, symbols, period } = body;
    
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
    
    switch (action) {
      case "sync":
        const response = await fetch(`${pythonServiceUrl}/sync/stocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbols: symbols || [],
            period: period || "1Y"
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          throw new Error(`Python service returned ${response.status}`);
        }
        
      case "sync-tracked":
        const trackedResponse = await fetch(`${pythonServiceUrl}/sync/tracked-stocks`, {
          method: "POST",
        });
        
        if (trackedResponse.ok) {
          const data = await trackedResponse.json();
          return NextResponse.json(data);
        } else {
          throw new Error(`Python service returned ${trackedResponse.status}`);
        }
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error communicating with Python service:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
