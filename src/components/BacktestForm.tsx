"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StrategySelector } from "./StrategySelector";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, TrendingUpIcon, SettingsIcon } from "lucide-react";

interface BacktestFormProps {
  onBacktestComplete?: (result: any) => void;
}

interface StrategySelection {
  strategyKey: string;
  parameters: Record<string, any>;
  allocation?: number;
}

export function BacktestForm({ onBacktestComplete }: BacktestFormProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    initialCash: 100000000, // 100M VND
    stockSymbols: ["VCB", "VIC", "GAS", "MSN", "VHM"],
  });
  const [singleStrategy, setSingleStrategy] =
    useState<StrategySelection | null>(null);
  const [multiStrategies, setMultiStrategies] = useState<StrategySelection[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStockSymbolsChange = (value: string) => {
    const symbols = value
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, stockSymbols: symbols }));
  };

  const runSingleStrategyBacktest = async () => {
    if (!singleStrategy) {
      toast({
        title: "Error",
        description: "Please select a trading strategy",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/backtests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          strategyKey: singleStrategy.strategyKey,
          strategyParams: singleStrategy.parameters,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to run backtest");
      }

      toast({
        title: "Backtest Completed",
        description: `Strategy: ${singleStrategy.strategyKey} | Return: ${(
          result.totalReturn * 100
        ).toFixed(2)}%`,
      });

      onBacktestComplete?.(result);
    } catch (error) {
      console.error("Backtest error:", error);
      toast({
        title: "Backtest Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runMultiStrategyBacktest = async () => {
    if (multiStrategies.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one trading strategy",
        variant: "destructive",
      });
      return;
    }

    const totalAllocation = multiStrategies.reduce(
      (sum, s) => sum + (s.allocation || 0),
      0
    );
    if (Math.abs(totalAllocation - 100) > 0.01) {
      toast({
        title: "Error",
        description: "Strategy allocations must sum to 100%",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/multi-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          strategies: multiStrategies.map((s) => ({
            strategyKey: s.strategyKey,
            allocation: s.allocation,
            parameters: s.parameters,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to run multi-strategy backtest"
        );
      }

      toast({
        title: "Multi-Strategy Backtest Completed",
        description: `Portfolio Return: ${result.totalReturn.toFixed(
          2
        )}% | Strategies: ${result.successfulStrategies}/${
          result.totalStrategies
        }`,
      });

      onBacktestComplete?.(result);
    } catch (error) {
      console.error("Multi-strategy backtest error:", error);
      toast({
        title: "Backtest Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Backtest Configuration
          </CardTitle>
          <CardDescription>
            Configure your backtest parameters and select trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Backtest Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="My Backtest Strategy"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Description of your backtest..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="initialCash">Initial Capital (VND)</Label>
                <Input
                  id="initialCash"
                  type="number"
                  value={formData.initialCash}
                  onChange={(e) =>
                    handleInputChange("initialCash", Number(e.target.value))
                  }
                  placeholder="100000000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {(formData.initialCash / 1000000).toFixed(0)}M VND
                </p>
              </div>

              <div>
                <Label htmlFor="stockSymbols">Stock Symbols</Label>
                <Input
                  id="stockSymbols"
                  value={formData.stockSymbols.join(", ")}
                  onChange={(e) => handleStockSymbolsChange(e.target.value)}
                  placeholder="VCB, VIC, GAS, MSN"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of stock symbols
                </p>
              </div>

              <div className="pt-2">
                <Label className="text-sm font-medium">Selected Stocks</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.stockSymbols.map((symbol) => (
                    <Badge key={symbol} variant="outline" className="text-xs">
                      {symbol}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Strategy Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Strategy</TabsTrigger>
              <TabsTrigger value="multi">Multi-Strategy Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-6">
              <StrategySelector
                mode="single"
                onStrategySelect={(selection) =>
                  setSingleStrategy(selection as StrategySelection)
                }
              />

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={runSingleStrategyBacktest}
                  disabled={!singleStrategy || loading}
                  className="min-w-32"
                >
                  {loading ? "Running..." : "Run Backtest"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="multi" className="mt-6">
              <StrategySelector
                mode="multi"
                onStrategySelect={(selections) =>
                  setMultiStrategies(selections as StrategySelection[])
                }
                selectedStrategies={multiStrategies}
              />

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={runMultiStrategyBacktest}
                  disabled={multiStrategies.length === 0 || loading}
                  className="min-w-32"
                >
                  {loading ? "Running..." : "Run Multi-Strategy Backtest"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
