"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrategySelector } from "./StrategySelector";
import { useToast } from "@/hooks/use-toast";
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
} from "lucide-react";

interface PaperTradingPosition {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  strategy: string;
}

interface ActiveStrategy {
  id: string;
  name: string;
  status: "active" | "paused" | "stopped";
  totalReturn: number;
  dayChange: number;
  startDate: string;
}

interface PaperTradingData {
  totalValue: number;
  cashBalance: number;
  positions: PaperTradingPosition[];
  activeStrategies: ActiveStrategy[];
}

interface StrategySelection {
  strategyKey: string;
  parameters: Record<string, any>;
}

export function PaperTrading() {
  const [paperData, setPaperData] = useState<PaperTradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [newStrategyForm, setNewStrategyForm] = useState({
    name: "",
    initialCash: 10000000, // 10M VND
    stockSymbols: ["VCB", "VIC", "GAS", "MSN"],
  });
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategySelection | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaperTradingData();

    // Setup real-time updates (simulated with interval)
    const interval = setInterval(fetchPaperTradingData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPaperTradingData = async () => {
    try {
      const response = await fetch("/api/paper-trading");
      if (response.ok) {
        const data = await response.json();
        // Ensure data has the expected structure
        setPaperData({
          totalValue: data?.totalValue || 0,
          cashBalance: data?.cashBalance || 0,
          positions: Array.isArray(data?.positions) ? data.positions : [],
          activeStrategies: Array.isArray(data?.activeStrategies)
            ? data.activeStrategies
            : [],
        });
      } else {
        // Set default empty state on API error
        setPaperData({
          totalValue: 0,
          cashBalance: 0,
          positions: [],
          activeStrategies: [],
        });
      }
    } catch (error) {
      console.error("Error fetching paper trading data:", error);
      // Set default empty state on error
      setPaperData({
        totalValue: 0,
        cashBalance: 0,
        positions: [],
        activeStrategies: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewStrategy = async () => {
    if (!selectedStrategy) {
      toast({
        title: "Error",
        description: "Please select a trading strategy",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/paper-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStrategyForm,
          strategyKey: selectedStrategy.strategyKey,
          strategyParams: selectedStrategy.parameters,
          stockSymbols: newStrategyForm.stockSymbols,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to start paper trading");
      }

      toast({
        title: "Paper Trading Started",
        description: `Strategy "${newStrategyForm.name}" is now active`,
      });

      setShowNewStrategy(false);
      setNewStrategyForm({
        name: "",
        initialCash: 10000000,
        stockSymbols: ["VCB", "VIC", "GAS", "MSN"],
      });
      setSelectedStrategy(null);
      fetchPaperTradingData();
    } catch (error) {
      console.error("Error starting paper trading:", error);
      toast({
        title: "Failed to Start",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const toggleStrategy = async (
    strategyId: string,
    action: "pause" | "resume" | "stop"
  ) => {
    try {
      // TODO: Implement strategy control API
      toast({
        title: `Strategy ${action}d`,
        description: `Strategy ${strategyId} has been ${action}d`,
      });
      fetchPaperTradingData();
    } catch (error) {
      console.error(`Error ${action}ing strategy:`, error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        Loading paper trading data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paperData?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paperData?.cashBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Positions
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paperData?.positions?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Strategies
            </CardTitle>
            <PlayCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paperData?.activeStrategies?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Strategies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Strategies</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowNewStrategy(!showNewStrategy)}
              >
                {showNewStrategy ? "Cancel" : "New Strategy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNewStrategy && (
              <div className="space-y-4 p-4 border rounded-lg mb-4">
                <div>
                  <Label htmlFor="strategyName">Strategy Name</Label>
                  <Input
                    id="strategyName"
                    value={newStrategyForm.name}
                    onChange={(e) =>
                      setNewStrategyForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="My Paper Trading Strategy"
                  />
                </div>

                <div>
                  <Label htmlFor="initialCash">Initial Cash (VND)</Label>
                  <Input
                    id="initialCash"
                    type="number"
                    value={newStrategyForm.initialCash}
                    onChange={(e) =>
                      setNewStrategyForm((prev) => ({
                        ...prev,
                        initialCash: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Select Trading Strategy</Label>
                  <div className="mt-2">
                    <StrategySelector
                      mode="single"
                      onStrategySelect={(selection) =>
                        setSelectedStrategy(selection as StrategySelection)
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={startNewStrategy}
                  disabled={!selectedStrategy || !newStrategyForm.name}
                  className="w-full"
                >
                  Start Paper Trading
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {paperData?.activeStrategies &&
              paperData.activeStrategies.length > 0 ? (
                paperData.activeStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{strategy.name}</span>
                        <Badge
                          variant={
                            strategy.status === "active"
                              ? "default"
                              : strategy.status === "paused"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {strategy.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>
                          Total: {formatPercent(strategy.totalReturn)}
                        </span>
                        <span
                          className={
                            strategy.dayChange >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          Today: {formatPercent(strategy.dayChange)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {strategy.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStrategy(strategy.id, "pause")}
                        >
                          <PauseCircleIcon className="h-4 w-4" />
                        </Button>
                      ) : strategy.status === "paused" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStrategy(strategy.id, "resume")}
                        >
                          <PlayCircleIcon className="h-4 w-4" />
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStrategy(strategy.id, "stop")}
                      >
                        <StopCircleIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No active strategies. Click "New Strategy" to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Current Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paperData?.positions && paperData.positions.length > 0 ? (
                paperData.positions.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{position.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {position.strategy}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {position.quantity} shares @{" "}
                        {formatCurrency(position.avgPrice)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(position.currentPrice)}
                      </div>
                      <div
                        className={`text-sm ${
                          position.unrealizedPnL >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {position.unrealizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(position.unrealizedPnL)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No open positions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
