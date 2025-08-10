"use client";

import { useState } from "react";
import { StockSelector } from "@/components/ui/stock-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function StockSelectorDemo() {
  const [singleStock, setSingleStock] = useState<string>("");
  const [multipleStocks, setMultipleStocks] = useState<string[]>([]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Selector Demo</h1>
        <p className="text-gray-600 mt-2">
          Demo các tính năng của Stock Selector component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Select */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn một mã cổ phiếu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mã cổ phiếu (Single Select)</Label>
              <StockSelector
                value={singleStock}
                onValueChange={(value) => setSingleStock(value as string)}
                placeholder="Chọn một mã cổ phiếu..."
                multiple={false}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Giá trị được chọn:</Label>
              <div className="p-3 bg-gray-50 rounded">
                {singleStock ? (
                  <Badge variant="secondary">{singleStock}</Badge>
                ) : (
                  <span className="text-gray-500">Chưa có mã nào được chọn</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Select */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn nhiều mã cổ phiếu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Danh mục cổ phiếu (Multiple Select)</Label>
              <StockSelector
                value={multipleStocks}
                onValueChange={(value) => setMultipleStocks(value as string[])}
                placeholder="Chọn các mã cổ phiếu..."
                multiple={true}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Các mã được chọn ({multipleStocks.length}):</Label>
              <div className="p-3 bg-gray-50 rounded min-h-[60px]">
                {multipleStocks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {multipleStocks.map((symbol) => (
                      <Badge key={symbol} variant="secondary">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Chưa có mã nào được chọn</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>JSON Output:</Label>
              <div className="p-3 bg-gray-50 rounded text-sm font-mono">
                {JSON.stringify(multipleStocks, null, 2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Tính năng của Stock Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Tìm kiếm theo mã cổ phiếu và tên công ty</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Hỗ trợ chọn một hoặc nhiều mã cổ phiếu</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Hiển thị thông tin giá và % thay đổi</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Debounced search (tìm kiếm với độ trễ 300ms)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Loading state và skeleton</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Click outside để đóng dropdown</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Responsive design</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Badge hiển thị sàn giao dịch (HOSE, HNX, UPCOM)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Dễ dàng remove các mã đã chọn</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
