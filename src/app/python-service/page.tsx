"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServiceStatus {
  status: "healthy" | "unhealthy" | "unreachable";
  pythonService?: any;
  url?: string;
  error?: string;
}

export default function PythonServicePage() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [syncSymbols, setSyncSymbols] = useState("VCB,VNM,HPG,VHM,TCB");
  const [syncPeriod, setSyncPeriod] = useState("1Y");

  const checkServiceHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/python-service");
      const data = await response.json();
      setServiceStatus(data);
    } catch (error) {
      setServiceStatus({
        status: "unreachable",
        error: "Failed to check service status",
      });
    }
    setLoading(false);
  };

  const syncStocks = async () => {
    setLoading(true);
    try {
      const symbols = syncSymbols.split(",").map((s) => s.trim().toUpperCase());
      const response = await fetch("/api/python-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          symbols,
          period: syncPeriod,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Sync started successfully!");
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to start sync");
    }
    setLoading(false);
  };

  const syncTrackedStocks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/python-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync-tracked",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Tracked stocks sync started successfully!");
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to start tracked stocks sync");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500">Healthy</Badge>;
      case "unhealthy":
        return <Badge className="bg-yellow-500">Unhealthy</Badge>;
      case "unreachable":
        return <Badge className="bg-red-500">Unreachable</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Python VNStock Service</h1>
        <Button onClick={checkServiceHealth} disabled={loading}>
          {loading ? "Checking..." : "Refresh Status"}
        </Button>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Service Status
            {serviceStatus && getStatusBadge(serviceStatus.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceStatus ? (
            <div className="space-y-2">
              <p>
                <strong>URL:</strong> {serviceStatus.url}
              </p>
              {serviceStatus.status === "healthy" &&
                serviceStatus.pythonService && (
                  <div>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {serviceStatus.pythonService.timestamp}
                    </p>
                    <p>
                      <strong>Message:</strong>{" "}
                      {serviceStatus.pythonService.message}
                    </p>
                  </div>
                )}
              {serviceStatus.error && (
                <p className="text-red-500">
                  <strong>Error:</strong> {serviceStatus.error}
                </p>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Start Python Service:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <p>
                Windows: <code>start-python-service.bat</code>
              </p>
              <p>
                Linux/Mac: <code>./start-python-service.sh</code>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Manual Setup:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono space-y-1">
              <p>cd python-service</p>
              <p>python -m venv venv</p>
              <p>
                venv\\Scripts\\activate (Windows) || source venv/bin/activate
                (Linux/Mac)
              </p>
              <p>pip install -r requirements.txt</p>
              <p>cp .env.example .env</p>
              <p>python main.py</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Environment Variables:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p>
                Update <code>python-service/.env</code> with your database
                connection:
              </p>
              <p className="font-mono">
                DATABASE_URL=postgresql://user:password@localhost:5432/stock_portfolio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Data Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbols">Stock Symbols (comma separated)</Label>
              <Input
                id="symbols"
                value={syncSymbols}
                onChange={(e) => setSyncSymbols(e.target.value)}
                placeholder="VCB,VNM,HPG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <select
                id="period"
                className="w-full px-3 py-2 border rounded-md"
                value={syncPeriod}
                onChange={(e) => setSyncPeriod(e.target.value)}
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="2Y">2 Years</option>
                <option value="5Y">5 Years</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={syncStocks}
              disabled={loading || serviceStatus?.status !== "healthy"}
            >
              {loading ? "Syncing..." : "Sync Selected Stocks"}
            </Button>

            <Button
              onClick={syncTrackedStocks}
              disabled={loading || serviceStatus?.status !== "healthy"}
              variant="outline"
            >
              {loading ? "Syncing..." : "Sync Tracked Stocks"}
            </Button>
          </div>

          {serviceStatus?.status !== "healthy" && (
            <p className="text-yellow-600 text-sm">
              ⚠️ Python service must be running and healthy to sync data
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <p>
              <strong>Health Check:</strong> GET http://localhost:8001/health
            </p>
            <p>
              <strong>Stock Price:</strong> GET
              http://localhost:8001/stocks/VCB/price
            </p>
            <p>
              <strong>Stock Info:</strong> GET
              http://localhost:8001/stocks/VCB/info
            </p>
            <p>
              <strong>Stock History:</strong> GET
              http://localhost:8001/stocks/VCB/history?period=1Y
            </p>
            <p>
              <strong>Market Indices:</strong> GET
              http://localhost:8001/market/indices
            </p>
            <p>
              <strong>Search Stocks:</strong> GET
              http://localhost:8001/stocks/search?q=VCB
            </p>
            <p>
              <strong>Sync Stocks:</strong> POST
              http://localhost:8001/sync/stocks
            </p>
            <p>
              <strong>Sync Tracked:</strong> POST
              http://localhost:8001/sync/tracked-stocks
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
