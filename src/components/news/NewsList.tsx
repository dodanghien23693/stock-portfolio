import React, { useState } from "react";
import { NewsArticle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import NewsCard from "./NewsCard";

interface NewsListProps {
  articles: NewsArticle[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onSymbolClick?: (symbol: string) => void;
  showLoadMoreButton?: boolean;
  emptyMessage?: string;
}

export function NewsList({
  articles,
  loading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onSymbolClick,
  showLoadMoreButton = true,
  emptyMessage = "Không có tin tức nào được tìm thấy.",
}: NewsListProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Tin tức chứng khoán</h2>
          {articles.length > 0 && (
            <Badge variant="secondary">{articles.length} tin</Badge>
          )}
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && articles.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có tin tức
            </h3>
            <p className="text-gray-500">{emptyMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      {articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="relative">
              <NewsCard
                article={article}
                showFullContent={expandedArticles.has(article.id)}
                onSymbolClick={onSymbolClick}
              />

              {/* Expand/Collapse Button for articles with content */}
              {article.content && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(article.id)}
                    className="text-xs gap-1"
                  >
                    {expandedArticles.has(article.id) ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Xem thêm
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {showLoadMoreButton && hasMore && articles.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Tải thêm tin tức
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for more articles */}
      {loading && articles.length > 0 && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`loading-${index}`}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsList;
