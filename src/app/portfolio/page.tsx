"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  PlusIcon,
  TrashIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MUIStockSelector } from "@/components/ui/mui-stock-selector";
import { SimpleDialog } from "@/components/ui/compatible-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  stocks: Array<{
    id: string;
    stock: {
      id: string;
      symbol: string;
      name: string;
      currentPrice?: number;
      change?: number;
      changePercent?: number;
    };
    quantity: number;
    avgPrice?: number;
  }>;
}

export default function PortfolioPage() {
  const { data: session } = useSession();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
    isDefault: false,
  });
  const [newStock, setNewStock] = useState({
    symbol: "",
    quantity: 0,
    avgPrice: 0,
  });

  useEffect(() => {
    if (session) {
      loadPortfolios();
    }
  }, [session]);

  const loadPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolios");
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
        if (data.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(
            data.find((p: Portfolio) => p.isDefault) || data[0]
          );
        }
      }
    } catch (error) {
      console.error("Error loading portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPortfolio),
      });

      if (response.ok) {
        await loadPortfolios();
        setShowCreateForm(false);
        setNewPortfolio({ name: "", description: "", isDefault: false });
      }
    } catch (error) {
      console.error("Error creating portfolio:", error);
    }
  };

  const addStockToPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;

    try {
      const response = await fetch(
        `/api/portfolios/${selectedPortfolio.id}/stocks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStock),
        }
      );

      if (response.ok) {
        await loadPortfolios();
        setShowAddStockForm(false);
        setNewStock({ symbol: "", quantity: 0, avgPrice: 0 });
      }
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  const removeStockFromPortfolio = async (stockId: string) => {
    if (!selectedPortfolio) return;

    try {
      const response = await fetch(
        `/api/portfolios/${selectedPortfolio.id}/stocks`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockId }),
        }
      );

      if (response.ok) {
        await loadPortfolios();
      }
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm("Bạn có chắc muốn xóa portfolio này?")) return;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadPortfolios();
        if (selectedPortfolio?.id === portfolioId) {
          setSelectedPortfolio(null);
        }
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error);
    }
  };

  const calculatePortfolioValue = (portfolio: Portfolio) => {
    return portfolio.stocks.reduce((total, stock) => {
      const currentValue =
        (stock.stock.currentPrice || stock.avgPrice || 0) * stock.quantity;
      return total + currentValue;
    }, 0);
  };

  const calculatePortfolioPnL = (portfolio: Portfolio) => {
    const totalCost = portfolio.stocks.reduce((total, stock) => {
      return total + (stock.avgPrice || 0) * stock.quantity;
    }, 0);

    const currentValue = calculatePortfolioValue(portfolio);
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    return { pnl, pnlPercent, totalCost, currentValue };
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-gray-600">Vui lòng đăng nhập để xem portfolio</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Portfolio
          </h1>
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi danh mục đầu tư của bạn
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Tạo Portfolio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Danh sách Portfolio</h2>
          <div className="space-y-3">
            {portfolios.map((portfolio) => {
              const { pnl, pnlPercent } = calculatePortfolioPnL(portfolio);
              const isSelected = selectedPortfolio?.id === portfolio.id;

              return (
                <Card
                  key={portfolio.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{portfolio.name}</h3>
                        {portfolio.isDefault && (
                          <Badge className="mt-1" variant="secondary">
                            Mặc định
                          </Badge>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {portfolio.stocks.length} mã CK
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {pnl >= 0 ? (
                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDownIcon className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePortfolio(portfolio.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Portfolio Details */}
        <div className="lg:col-span-3">
          {selectedPortfolio ? (
            <>
              {/* Portfolio Summary */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {selectedPortfolio.name}
                      </CardTitle>
                      {selectedPortfolio.description && (
                        <CardDescription className="mt-1">
                          {selectedPortfolio.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => setShowAddStockForm(true)}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Thêm mã CK
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const { pnl, pnlPercent, totalCost, currentValue } =
                      calculatePortfolioPnL(selectedPortfolio);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">
                              Tổng giá trị
                            </p>
                            <p className="text-2xl font-bold">
                              {currentValue.toLocaleString("vi-VN")} ₫
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Vốn đầu tư</p>
                            <p className="text-2xl font-bold">
                              {totalCost.toLocaleString("vi-VN")} ₫
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">P&L</p>
                            <p
                              className={`text-2xl font-bold ${
                                pnl >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {pnl >= 0 ? "+" : ""}
                              {pnl.toLocaleString("vi-VN")} ₫
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">% P&L</p>
                            <p
                              className={`text-2xl font-bold ${
                                pnl >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {pnl >= 0 ? "+" : ""}
                              {pnlPercent.toFixed(2)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Stocks Table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Danh sách cổ phiếu</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPortfolio.stocks.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        Chưa có cổ phiếu nào trong portfolio
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddStockForm(true)}
                      >
                        Thêm cổ phiếu đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã CK</TableHead>
                          <TableHead>Số lượng</TableHead>
                          <TableHead>Giá TB</TableHead>
                          <TableHead>Giá hiện tại</TableHead>
                          <TableHead>Giá trị</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPortfolio.stocks.map((stock) => {
                          const currentPrice =
                            stock.stock.currentPrice || stock.avgPrice || 0;
                          const totalValue = currentPrice * stock.quantity;
                          const totalCost =
                            (stock.avgPrice || 0) * stock.quantity;
                          const pnl = totalValue - totalCost;
                          const pnlPercent =
                            totalCost > 0 ? (pnl / totalCost) * 100 : 0;

                          return (
                            <TableRow key={stock.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {stock.stock.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {stock.stock.name}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {stock.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {(stock.avgPrice || 0).toLocaleString("vi-VN")}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm text-gray-900">
                                    {currentPrice.toLocaleString("vi-VN")}
                                  </div>
                                  {stock.stock.changePercent && (
                                    <Badge
                                      variant={
                                        stock.stock.changePercent >= 0
                                          ? "secondary"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {stock.stock.changePercent >= 0
                                        ? "+"
                                        : ""}
                                      {stock.stock.changePercent.toFixed(2)}%
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {totalValue.toLocaleString("vi-VN")}
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`font-medium ${
                                    pnl >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {pnl >= 0 ? "+" : ""}
                                  {pnl.toLocaleString("vi-VN")}
                                </div>
                                <div
                                  className={`text-xs ${
                                    pnl >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {pnl >= 0 ? "+" : ""}
                                  {pnlPercent.toFixed(2)}%
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeStockFromPortfolio(stock.stock.id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Chưa có portfolio nào</p>
                <Button size="lg" onClick={() => setShowCreateForm(true)}>
                  Tạo Portfolio đầu tiên
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Portfolio Modal */}
      <SimpleDialog
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Tạo Portfolio mới"
        description="Tạo một portfolio mới để quản lý danh mục đầu tư của bạn."
        maxWidth="sm"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Hủy
            </Button>
            <Button type="submit" form="create-portfolio-form">
              Tạo
            </Button>
          </div>
        }
      >
        <form id="create-portfolio-form" onSubmit={createPortfolio}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="select-text cursor-text">
                Tên Portfolio
              </Label>
              <Input
                id="name"
                value={newPortfolio.name}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, name: e.target.value })
                }
                placeholder="Nhập tên portfolio..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="select-text cursor-text">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={newPortfolio.description}
                onChange={(e) =>
                  setNewPortfolio({
                    ...newPortfolio,
                    description: e.target.value,
                  })
                }
                placeholder="Mô tả về portfolio này..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isDefault" className="select-text cursor-text">
                Cài đặt
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={newPortfolio.isDefault}
                  onCheckedChange={(checked) =>
                    setNewPortfolio({
                      ...newPortfolio,
                      isDefault: checked === true,
                    })
                  }
                />
                <Label
                  htmlFor="isDefault"
                  className="text-sm font-normal select-text cursor-text"
                >
                  Đặt làm portfolio mặc định
                </Label>
              </div>
            </div>
          </div>
        </form>
      </SimpleDialog>

      {/* Add Stock Modal */}
      <SimpleDialog
        open={showAddStockForm}
        onClose={() => setShowAddStockForm(false)}
        title="Thêm cổ phiếu"
        description="Thêm một mã cổ phiếu mới vào portfolio của bạn."
        maxWidth="sm"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddStockForm(false)}
            >
              Hủy
            </Button>
            <Button type="submit" form="add-stock-form" variant="default">
              Thêm
            </Button>
          </div>
        }
      >
        <form id="add-stock-form" onSubmit={addStockToPortfolio}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="select-text cursor-text">
                Mã cổ phiếu
              </Label>
              <MUIStockSelector
                value={newStock.symbol}
                onValueChange={(value: string | string[]) =>
                  setNewStock({
                    ...newStock,
                    symbol: Array.isArray(value) ? value[0] || "" : value,
                  })
                }
                placeholder="VD: VNM, VCB, HPG..."
                multiple={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="select-text cursor-text">
                Số lượng
              </Label>
              <NumberInput
                id="quantity"
                value={newStock.quantity}
                onChange={(value) => {
                  setNewStock({
                    ...newStock,
                    quantity: value,
                  });
                }}
                placeholder="Nhập số lượng cổ phiếu..."
                formatWithCommas={true}
                allowFloat={false}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgPrice" className="select-text cursor-text">
                Giá trung bình (VND)
              </Label>
              <NumberInput
                id="avgPrice"
                value={newStock.avgPrice}
                onChange={(value) => {
                  setNewStock({
                    ...newStock,
                    avgPrice: value,
                  });
                }}
                placeholder="Nhập giá trung bình..."
                formatWithCommas={true}
                allowFloat={true}
                required
              />
            </div>
          </div>
        </form>
      </SimpleDialog>
    </div>
  );
}
