"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BacktestForm } from "@/components/BacktestForm";
import { PaperTrading } from "@/components/PaperTrading";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { 
  BarChart3Icon, 
  PlayCircleIcon, 
  TrendingUpIcon,
  BrainIcon 
} from "lucide-react";

export default function BacktestPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("backtest");

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access the trading system</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BrainIcon className="h-8 w-8 text-blue-600" />
          Advanced Trading System
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive backtesting, strategy optimization, and paper trading platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Backtest Engine
          </TabsTrigger>
          <TabsTrigger value="paper-trading" className="flex items-center gap-2">
            <PlayCircleIcon className="h-4 w-4" />
            Paper Trading
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Results & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backtest" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5" />
                  Strategy Backtesting
                </CardTitle>
                <CardDescription>
                  Test your trading strategies with historical data. Choose from 12 built-in strategies 
                  or create multi-strategy portfolios with custom parameter configurations.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <BacktestForm onBacktestComplete={(result) => {
              console.log('Backtest completed:', result);
              // Optionally switch to results tab
              setActiveTab("results");
            }} />
          </div>
        </TabsContent>

        <TabsContent value="paper-trading" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircleIcon className="h-5 w-5" />
                  Live Paper Trading
                </CardTitle>
                <CardDescription>
                  Test your strategies in real-time with simulated money. Track performance, 
                  manage multiple strategies, and learn without risk.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <PaperTrading />
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Analyze your backtest results, compare strategies, and track performance metrics. 
                  Detailed trade history and comprehensive statistics.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <ResultsDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
