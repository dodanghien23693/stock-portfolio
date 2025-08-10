"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsArticle, NewsFilter, type NewsStats } from "@/types";
import { newsApiService } from "@/lib/news-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Newspaper, AlertCircle } from "lucide-react";
import NewsFilters from "@/components/news/NewsFilters";
import NewsList from "@/components/news/NewsList";
import { NewsStats as NewsStatsComponent } from "@/components/news/NewsStats";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NewsFilter>({ limit: 20, page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsStats, setNewsStats] = useState<NewsStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Load all news
  const loadNews = useCallback(
    async (newFilters: NewsFilter = filters, resetPage = false) => {
      try {
        setLoading(true);
        setError(null);

        const targetPage = resetPage ? 1 : newFilters.page || 1;
        const finalFilters = { ...newFilters, page: targetPage };

        const response = await newsApiService.getNews(finalFilters);

        if (resetPage || targetPage === 1) {
          setArticles(response.articles);
        } else {
          setArticles((prev) => [...prev, ...response.articles]);
        }

        setTotalPages(Math.ceil(response.total / response.perPage));
        setCurrentPage(targetPage);

        // Generate stats for all articles
        if (response.articles.length > 0) {
          const stats = newsApiService.generateNewsStats(response.articles);
          setNewsStats(stats);
        }
      } catch (err) {
        console.error("Error loading news:", err);
        setError("Không thể tải tin tức. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Load specific source news
  const loadSourceNews = useCallback(
    async (source: "cafef" | "vnexpress" | "vnstock", symbol?: string) => {
      try {
        setLoading(true);
        setError(null);

        let sourceArticles: NewsArticle[] = [];

        if (source === "cafef") {
          sourceArticles = await newsApiService.getCafefNews(50);
        } else if (source === "vnexpress") {
          sourceArticles = await newsApiService.getVnexpressNews(50);
        } else if (source === "vnstock") {
          sourceArticles = await newsApiService.getVnstockNews(symbol);
        }

        setArticles(sourceArticles);

        if (sourceArticles.length > 0) {
          const stats = newsApiService.generateNewsStats(sourceArticles);
          setNewsStats(stats);
        }
      } catch (err) {
        console.error(`Error loading ${source} news:`, err);
        setError(`Không thể tải tin tức từ ${source}. Vui lòng thử lại.`);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (activeTab === "all") {
      loadNews(filters, true);
    } else if (activeTab === "cafef") {
      loadSourceNews("cafef");
    } else if (activeTab === "vnexpress") {
      loadSourceNews("vnexpress");
    } else if (activeTab === "vnstock") {
      loadSourceNews("vnstock");
    }
  }, [activeTab]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: NewsFilter) => {
    setFilters(newFilters);
    if (activeTab === "all") {
      loadNews(newFilters, true);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    const clearedFilters: NewsFilter = { limit: 20, page: 1 };
    setFilters(clearedFilters);
    if (activeTab === "all") {
      loadNews(clearedFilters, true);
    }
  };

  // Load more articles
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading && activeTab === "all") {
      const nextPage = currentPage + 1;
      loadNews({ ...filters, page: nextPage }, false);
    }
  };

  // Refresh current view
  const handleRefresh = () => {
    if (activeTab === "all") {
      loadNews(filters, true);
    } else if (activeTab === "cafef") {
      loadSourceNews("cafef");
    } else if (activeTab === "vnexpress") {
      loadSourceNews("vnexpress");
    } else if (activeTab === "vnstock") {
      loadSourceNews("vnstock");
    }
  };

  // Handle symbol click
  const handleSymbolClick = (symbol: string) => {
    const symbolFilters: NewsFilter = {
      ...filters,
      symbols: [symbol],
      page: 1,
    };
    setFilters(symbolFilters);
    setActiveTab("all");
    loadNews(symbolFilters, true);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Tin tức chứng khoán
          </h1>
        </div>
        <p className="text-gray-600">
          Cập nhật tin tức thị trường realtime với phân tích tác động và phân
          loại thông minh
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* News Stats */}
      {newsStats && (
        <NewsStatsComponent
          stats={newsStats}
          onSymbolClick={handleSymbolClick}
        />
      )}

      {/* News Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            📰 Tất cả tin tức
          </TabsTrigger>
          <TabsTrigger value="cafef" className="flex items-center gap-2">
            🌐 CafeF RSS
          </TabsTrigger>
          <TabsTrigger value="vnexpress" className="flex items-center gap-2">
            📰 VnExpress RSS
          </TabsTrigger>
          <TabsTrigger value="vnstock" className="flex items-center gap-2">
            📊 VNStock
          </TabsTrigger>
        </TabsList>

        {/* All News Tab */}
        <TabsContent value="all" className="space-y-6">
          <NewsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <NewsList
            articles={articles}
            loading={loading}
            hasMore={currentPage < totalPages}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            onSymbolClick={handleSymbolClick}
            emptyMessage="Không có tin tức nào phù hợp với bộ lọc đã chọn."
          />
        </TabsContent>

        {/* CafeF News Tab */}
        <TabsContent value="cafef" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-800 mb-1">
              🌐 Tin tức từ CafeF RSS Feed
            </h3>
            <p className="text-sm text-blue-700">
              Tin tức thời sự kinh tế và chứng khoán từ nguồn uy tín CafeF.vn
            </p>
          </div>

          <NewsList
            articles={articles}
            loading={loading}
            onRefresh={handleRefresh}
            onSymbolClick={handleSymbolClick}
            showLoadMoreButton={false}
            emptyMessage="Không thể tải tin tức từ CafeF RSS."
          />
        </TabsContent>

        {/* VnExpress News Tab */}
        <TabsContent value="vnexpress" className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-orange-800 mb-1">
              📰 Tin tức từ VnExpress RSS Feed
            </h3>
            <p className="text-sm text-orange-700">
              Tin tức kinh tế và chứng khoán từ trang tin tức hàng đầu VnExpress.net
            </p>
          </div>

          <NewsList
            articles={articles}
            loading={loading}
            onRefresh={handleRefresh}
            onSymbolClick={handleSymbolClick}
            showLoadMoreButton={false}
            emptyMessage="Không thể tải tin tức từ VnExpress RSS."
          />
        </TabsContent>

        {/* VNStock News Tab */}
        <TabsContent value="vnstock" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-green-800 mb-1">
              📊 Tin tức từ VNStock API
            </h3>
            <p className="text-sm text-green-700">
              Tin tức chứng khoán chuyên sâu từ thư viện VNStock
            </p>
          </div>

          <NewsList
            articles={articles}
            loading={loading}
            onRefresh={handleRefresh}
            onSymbolClick={handleSymbolClick}
            showLoadMoreButton={false}
            emptyMessage="Không thể tải tin tức từ VNStock API."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
