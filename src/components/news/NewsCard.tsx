import React from "react";
import { NewsArticle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { newsApiService } from "@/lib/news-api";

interface NewsCardProps {
  article: NewsArticle;
  showFullContent?: boolean;
  onSymbolClick?: (symbol: string) => void;
}

export function NewsCard({
  article,
  showFullContent = false,
  onSymbolClick,
}: NewsCardProps) {
  const sentimentColor = newsApiService.getSentimentColor(article.sentiment);
  const sentimentIcon = newsApiService.getSentimentIcon(article.sentiment);
  const categoryIcon = newsApiService.getCategoryIcon(article.category);
  const categoryName = newsApiService.getCategoryName(article.category);
  const impactColor = newsApiService.getImpactScoreColor(article.impact_score);
  const timeAgo = newsApiService.formatPublishDate(article.publish_date);
  
  // Clean summary to remove HTML tags
  const cleanSummary = newsApiService.extractCleanSummary(article.summary, 200);

  const handleSymbolClick = (symbol: string) => {
    if (onSymbolClick) {
      onSymbolClick(symbol);
    }
  };

  const handleOpenLink = () => {
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenOriginalLink = () => {
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            {article.url && (
              <button
                onClick={handleOpenOriginalLink}
                className="p-1 hover:bg-gray-100 rounded"
                title="Đọc bài viết gốc"
              >
                <ExternalLink className="h-4 w-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span>{categoryIcon}</span>
            {categoryName}
          </span>
          <span>•</span>
          <span className="font-medium">{article.source}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {cleanSummary}
        </p>

        {showFullContent && article.content && (
          <div
            className="text-gray-700 text-sm leading-relaxed mb-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {/* Sentiment and Impact Score */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {article.sentiment && (
              <div className="flex items-center gap-1">
                <span>{sentimentIcon}</span>
                <span className={`text-xs font-medium ${sentimentColor}`}>
                  {article.sentiment === "positive"
                    ? "Tích cực"
                    : article.sentiment === "negative"
                    ? "Tiêu cực"
                    : "Trung tính"}
                </span>
              </div>
            )}

            {article.impact_score && (
              <div className="flex items-center gap-1">
                {article.sentiment === "positive" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className={`text-xs font-medium ${impactColor}`}>
                  Tác động: {Math.round(article.impact_score)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Related Symbols */}
        {article.relatedSymbols?.length && (
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs text-gray-500 mr-1">Liên quan:</span>
            {article.relatedSymbols.slice(0, 5).map((symbol) => (
              <Badge
                key={symbol}
                variant="secondary"
                className="text-xs px-2 py-0 cursor-pointer hover:bg-blue-100"
                onClick={() => handleSymbolClick(symbol)}
              >
                {symbol}
              </Badge>
            ))}
            {article.relatedSymbols.length > 5 && (
              <span className="text-xs text-gray-500">
                +{article.relatedSymbols.length - 5} khác
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {article.tags?.length && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NewsCard;
