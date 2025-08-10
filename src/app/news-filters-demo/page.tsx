"use client";

import { useState } from "react";
import { NewsFilters } from "@/components/news/NewsFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock NewsFilter type for demo
interface NewsFilter {
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  symbols?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export default function NewsFiltersDemo() {
  const [filters, setFilters] = useState<NewsFilter>({});

  const handleFiltersChange = (newFilters: NewsFilter) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">News Filters Demo</h1>
        <p className="text-gray-600 mt-2">
          Demo News Filters component với StockSelector tích hợp
        </p>
      </div>

      {/* News Filters Component */}
      <NewsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Current Filters Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Filters State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Filters Object:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Selected Symbols:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.symbols && filters.symbols.length > 0 ? (
                  filters.symbols.map((symbol) => (
                    <Badge key={symbol} variant="secondary">
                      {symbol}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Chưa chọn mã nào</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Category:</h4>
                <span className="text-sm text-gray-600">
                  {filters.category || "Tất cả"}
                </span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sentiment:</h4>
                <span className="text-sm text-gray-600">
                  {filters.sentiment === 'positive' ? 'Tích cực' :
                   filters.sentiment === 'negative' ? 'Tiêu cực' :
                   filters.sentiment === 'neutral' ? 'Trung tính' : 'Tất cả'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Notes */}
      <Card>
        <CardHeader>
          <CardTitle>StockSelector Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Thay thế Input + Button bằng StockSelector</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Hỗ trợ chọn nhiều mã cổ phiếu (multiple=true)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Tìm kiếm thông minh với debounced search</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Hiển thị thông tin giá và % thay đổi</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ UI/UX cải thiện với dropdown trực quan</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Loại bỏ section "Mã đã chọn" riêng biệt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>✅ Badge removal trực tiếp trong selector</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
