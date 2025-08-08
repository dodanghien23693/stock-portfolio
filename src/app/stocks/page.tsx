"use client";

import { useEffect, useState } from "react";
import { useStockStore } from "@/store/stockStore";
import { Search, Filter, BarChart3 } from "lucide-react";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StocksPage() {
  const { stocks, fetchStocks, isLoadingStocks } = useStockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStocks();
    } finally {
      setIsRefreshing(false);
    }
  };

  const testDatabase = async () => {
    try {
      const response = await fetch("/api/test");
      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert("Database test failed: " + error);
    }
  };

  const createSampleData = async () => {
    try {
      const response = await fetch("/api/stocks/sample", {
        method: "POST"
      });
      const data = await response.json();
      alert(data.message);
      if (data.count > 0) {
        await handleRefresh();
      }
    } catch (error) {
      alert("Failed to create sample data: " + error);
    }
  };

  const filteredStocks = (stocks || [])
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExchange =
        exchangeFilter === "ALL" || stock.exchange === exchangeFilter;
      return matchesSearch && matchesExchange;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case "symbol":
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "currentPrice":
          aVal = a.currentPrice;
          bVal = b.currentPrice;
          break;
        case "change":
          aVal = a.change;
          bVal = b.change;
          break;
        case "volume":
          aVal = a.volume;
          bVal = b.volume;
          break;
        case "marketCap":
          aVal = a.marketCap || 0;
          bVal = b.marketCap || 0;
          break;
        default:
          aVal = a.symbol;
          bVal = b.symbol;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách mã chứng khoán
            </h1>
            <p className="text-gray-600 mt-2">
              Theo dõi và phân tích các mã chứng khoán Việt Nam
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={testDatabase} variant="outline" size="sm">
              Test DB
            </Button>
            <Button onClick={createSampleData} variant="outline" size="sm">
              Sample Data
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm mã hoặc tên công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Chọn sàn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả sàn</SelectItem>
                  <SelectItem value="HOSE">HOSE</SelectItem>
                  <SelectItem value="HNX">HNX</SelectItem>
                  <SelectItem value="UPCOM">UPCOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">
            Danh sách cổ phiếu ({filteredStocks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStocks ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("symbol")}
                  >
                    Mã CK {getSortIcon("symbol")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    Tên công ty {getSortIcon("name")}
                  </TableHead>
                  <TableHead>Sàn</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("currentPrice")}
                  >
                    Giá {getSortIcon("currentPrice")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("change")}
                  >
                    Thay đổi {getSortIcon("change")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("volume")}
                  >
                    KL {getSortIcon("volume")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("marketCap")}
                  >
                    Vốn hóa {getSortIcon("marketCap")}
                  </TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {stock.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">
                          {stock.name}
                        </div>
                        {stock.sector && (
                          <div className="text-xs text-gray-500">
                            {stock.sector}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stock.exchange === "HOSE"
                            ? "destructive"
                            : stock.exchange === "HNX"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {stock.exchange}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(stock.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`${
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ({formatPercent(stock.changePercent)})
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(stock.volume)}
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.marketCap ? formatCurrency(stock.marketCap) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/stocks/${stock.symbol}`}>
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoadingStocks && filteredStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {stocks && stocks.length === 0
                  ? "Chưa có dữ liệu cổ phiếu trong database"
                  : "Không tìm thấy cổ phiếu nào"}
              </p>
              {stocks && stocks.length === 0 && (
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Hãy thử:</p>
                  <p>1. Kiểm tra kết nối database bằng nút "Test DB"</p>
                  <p>2. Đồng bộ dữ liệu từ Python Service</p>
                  <p>3. Import dữ liệu mẫu từ API</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
