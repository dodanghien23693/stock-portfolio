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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  CalendarIcon,
  ActivityIcon,
  TrashIcon,
} from "lucide-react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MuiButton,
} from "@mui/material";
import { useToast } from "@/hooks/use-toast";

interface BacktestResult {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed";
  startDate: string;
  endDate: string;
  initialCash: number;
  finalCash?: number;
  totalReturn?: number;
  maxDrawdown?: number;
  winRate?: number;
  sharpeRatio?: number;
  createdAt: string;
  trades: Array<{
    id: string;
    type: "BUY" | "SELL";
    quantity: number;
    price: number;
    date: string;
    stock: {
      symbol: string;
      name: string;
    };
  }>;
}

interface MultiStrategyResult {
  name: string;
  totalStrategies: number;
  successfulStrategies: number;
  initialCash: number;
  finalValue: number;
  totalReturn: number;
  weightedWinRate: number;
  maxDrawdown: number;
  strategies: Array<{
    strategyName: string;
    allocation: number;
    totalReturn: number;
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
  }>;
}

export function ResultsDashboard() {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(
    null
  );
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [backtestToDelete, setBacktestToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBacktests();
  }, []);

  const fetchBacktests = async () => {
    try {
      const response = await fetch("/api/backtests");
      const data = await response.json();
      // Ensure data is an array, fallback to empty array if not
      setBacktests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching backtests:", error);
      // Set empty array on error
      setBacktests([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBacktest = async (id: string) => {
    setBacktestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!backtestToDelete) return;

    setDeleting(backtestToDelete);
    setDeleteDialogOpen(false);
    
    try {
      const response = await fetch(`/api/backtests/${backtestToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete backtest");
      }

      // Remove the deleted backtest from the list
      setBacktests(prev => prev.filter(backtest => backtest.id !== backtestToDelete));
      
      // Clear selected result if it was the deleted one
      if (selectedResult?.id === backtestToDelete) {
        setSelectedResult(null);
      }

      toast({
        title: "Thành công",
        description: "Backtest đã được xóa thành công.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting backtest:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể xóa backtest. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setBacktestToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBacktestToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${(percent * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary" as const,
      running: "default" as const,
      completed: "default" as const,
      failed: "destructive" as const,
    };
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getReturnColor = (returnValue?: number) => {
    if (!returnValue) return "text-gray-600";
    return returnValue >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading results...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Backtests
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backtests?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backtests?.filter((b) => b.status === "completed").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Return</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {backtests && backtests.length > 0
                ? Math.max(
                    ...backtests.map((b) => (b.totalReturn || 0) * 100),
                    0
                  ).toFixed(2)
                : "0.00"}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Return
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backtests && backtests.length > 0
                ? (
                    backtests.reduce(
                      (sum, b) => sum + (b.totalReturn || 0) * 100,
                      0
                    ) / backtests.length
                  ).toFixed(2)
                : "0.00"}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backtest Results</CardTitle>
          <CardDescription>
            View and compare your backtest results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backtests && backtests.length > 0 ? (
              backtests.map((backtest) => (
                <div
                  key={backtest.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    selectedResult?.id === backtest.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedResult(backtest)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{backtest.name}</h3>
                        {getStatusBadge(backtest.status)}
                      </div>

                      {backtest.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {backtest.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(backtest.startDate)} -{" "}
                          {formatDate(backtest.endDate)}
                        </span>
                        <span>
                          Initial: {formatCurrency(backtest.initialCash)}
                        </span>
                        {backtest.trades && (
                          <span>{backtest.trades.length} trades</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {backtest.status === "completed" && (
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getReturnColor(
                              backtest.totalReturn
                            )}`}
                          >
                            {formatPercent(backtest.totalReturn || 0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(backtest.finalCash || 0)}
                          </div>
                          {backtest.winRate && (
                            <div className="text-xs text-gray-500">
                              Win Rate: {(backtest.winRate * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBacktest(backtest.id);
                        }}
                        disabled={deleting === backtest.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === backtest.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No backtest results yet. Run your first backtest to see results
                here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View */}
      {selectedResult && selectedResult.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results: {selectedResult.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Return</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${getReturnColor(
                          selectedResult.totalReturn
                        )}`}
                      >
                        {formatPercent(selectedResult.totalReturn || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Final Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedResult.finalCash || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Max Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedResult.maxDrawdown
                          ? `${(selectedResult.maxDrawdown * 100).toFixed(2)}%`
                          : "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trades" className="mt-6">
                <div className="space-y-2">
                  {selectedResult.trades && selectedResult.trades.length > 0 ? (
                    selectedResult.trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              trade.type === "BUY" ? "default" : "secondary"
                            }
                          >
                            {trade.type}
                          </Badge>
                          <span className="font-medium">
                            {trade.stock.symbol}
                          </span>
                          <span className="text-sm text-gray-600">
                            {trade.quantity} shares @{" "}
                            {formatCurrency(trade.price)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(trade.date)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trades available for this backtest.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-medium">
                        {selectedResult.winRate
                          ? `${(selectedResult.winRate * 100).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio:</span>
                      <span className="font-medium">
                        {selectedResult.sharpeRatio?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">
                        {selectedResult.trades?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(selectedResult.endDate).getTime() -
                            new Date(selectedResult.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>P&L:</span>
                      <span
                        className={`font-medium ${getReturnColor(
                          selectedResult.totalReturn
                        )}`}
                      >
                        {formatCurrency(
                          (selectedResult.finalCash || 0) -
                            selectedResult.initialCash
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa backtest này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCancelDelete} color="primary">
            Hủy
          </MuiButton>
          <MuiButton onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
