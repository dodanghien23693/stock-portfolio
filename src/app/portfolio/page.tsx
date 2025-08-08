"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  PlusIcon,
  TrashIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";

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
      <div className="p-6">
        <p>Vui lòng đăng nhập để xem portfolio</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Portfolio</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Tạo Portfolio
        </button>
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
                <div
                  key={portfolio.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{portfolio.name}</h3>
                      {portfolio.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Mặc định
                        </span>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePortfolio(portfolio.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Details */}
        <div className="lg:col-span-3">
          {selectedPortfolio ? (
            <>
              {/* Portfolio Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedPortfolio.name}
                    </h2>
                    {selectedPortfolio.description && (
                      <p className="text-gray-600 mt-1">
                        {selectedPortfolio.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddStockForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Thêm mã CK
                  </button>
                </div>

                {(() => {
                  const { pnl, pnlPercent, totalCost, currentValue } =
                    calculatePortfolioPnL(selectedPortfolio);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng giá trị</p>
                        <p className="text-2xl font-bold">
                          {currentValue.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Vốn đầu tư</p>
                        <p className="text-2xl font-bold">
                          {totalCost.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">P&L</p>
                        <p
                          className={`text-2xl font-bold ${
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {pnl.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">% P&L</p>
                        <p
                          className={`text-2xl font-bold ${
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {pnlPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Stocks Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Danh sách cổ phiếu</h3>
                </div>

                {selectedPortfolio.stocks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>Chưa có cổ phiếu nào trong portfolio</p>
                    <button
                      onClick={() => setShowAddStockForm(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Thêm cổ phiếu đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã CK
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá TB
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá hiện tại
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá trị
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
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
                            <tr key={stock.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {stock.stock.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {stock.stock.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stock.quantity.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(stock.avgPrice || 0).toLocaleString("vi-VN")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {currentPrice.toLocaleString("vi-VN")}
                                </div>
                                {stock.stock.changePercent && (
                                  <div
                                    className={`text-xs ${
                                      stock.stock.changePercent >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {stock.stock.changePercent >= 0 ? "+" : ""}
                                    {stock.stock.changePercent.toFixed(2)}%
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {totalValue.toLocaleString("vi-VN")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`text-sm font-medium ${
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
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() =>
                                    removeStockFromPortfolio(stock.stock.id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có portfolio nào</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Tạo Portfolio đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Portfolio Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tạo Portfolio mới</h2>
            <form onSubmit={createPortfolio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Portfolio
                </label>
                <input
                  type="text"
                  value={newPortfolio.name}
                  onChange={(e) =>
                    setNewPortfolio({ ...newPortfolio, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newPortfolio.description}
                  onChange={(e) =>
                    setNewPortfolio({
                      ...newPortfolio,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPortfolio.isDefault}
                    onChange={(e) =>
                      setNewPortfolio({
                        ...newPortfolio,
                        isDefault: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Đặt làm portfolio mặc định
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Tạo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm cổ phiếu</h2>
            <form onSubmit={addStockToPortfolio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã cổ phiếu
                </label>
                <input
                  type="text"
                  value={newStock.symbol}
                  onChange={(e) =>
                    setNewStock({
                      ...newStock,
                      symbol: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="VD: VNM, VCB, HPG..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={newStock.quantity}
                  onChange={(e) =>
                    setNewStock({
                      ...newStock,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trung bình
                </label>
                <input
                  type="number"
                  value={newStock.avgPrice}
                  onChange={(e) =>
                    setNewStock({
                      ...newStock,
                      avgPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStockForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
