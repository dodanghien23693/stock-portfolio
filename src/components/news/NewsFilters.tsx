import React, { useState, useEffect } from "react";
import { NewsFilter, NewsCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { newsApiService } from "@/lib/news-api";
import { MUIStockSelector } from "@/components/ui/mui-stock-selector";

interface NewsFiltersProps {
  filters: NewsFilter;
  onFiltersChange: (filters: NewsFilter) => void;
  onClearFilters: () => void;
}

export function NewsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: NewsFiltersProps) {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await newsApiService.getNewsCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === "all" ? undefined : category,
    });
  };

  const handleSentimentChange = (sentiment: string) => {
    onFiltersChange({
      ...filters,
      sentiment:
        sentiment === "all"
          ? undefined
          : (sentiment as "positive" | "negative" | "neutral"),
    });
  };

  const handleSymbolsChange = (selectedSymbols: string | string[]) => {
    onFiltersChange({
      ...filters,
      symbols: Array.isArray(selectedSymbols)
        ? selectedSymbols
        : [selectedSymbols],
    });
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.sentiment ||
    (filters.symbols && filters.symbols.length > 0)
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc tin tức
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Thu gọn" : "Mở rộng"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Danh mục</label>
            <Select
              value={filters.category || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {newsApiService.getCategoryIcon(category.id)}{" "}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tâm lý</label>
            <Select
              value={filters.sentiment || "all"}
              onValueChange={handleSentimentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tâm lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Tất cả
                  </div>
                </SelectItem>
                <SelectItem value="positive">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Tích cực
                  </div>
                </SelectItem>
                <SelectItem value="negative">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Tiêu cực
                  </div>
                </SelectItem>
                <SelectItem value="neutral">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-600" />
                    Trung tính
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Symbol Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mã cổ phiếu
            </label>
            <MUIStockSelector
              value={filters.symbols || []}
              onValueChange={handleSymbolsChange}
              placeholder="Chọn mã cổ phiếu..."
              multiple={true}
              className="text-sm"
            />
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Bộ lọc nâng cao</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range - Can be added later */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Từ ngày
                </label>
                <Input
                  type="date"
                  className="text-sm"
                  // Add date handling later
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Đến ngày
                </label>
                <Input
                  type="date"
                  className="text-sm"
                  // Add date handling later
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>Bộ lọc đang áp dụng:</strong>
              <ul className="mt-1 space-y-1">
                {filters.category && (
                  <li>
                    • Danh mục:{" "}
                    {newsApiService.getCategoryName(filters.category)}
                  </li>
                )}
                {filters.sentiment && (
                  <li>
                    • Tâm lý:{" "}
                    {filters.sentiment === "positive"
                      ? "Tích cực"
                      : filters.sentiment === "negative"
                      ? "Tiêu cực"
                      : "Trung tính"}
                  </li>
                )}
                {filters.symbols && filters.symbols.length > 0 && (
                  <li>• Mã cổ phiếu: {filters.symbols.join(", ")}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NewsFilters;
