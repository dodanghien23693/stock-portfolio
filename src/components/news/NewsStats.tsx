import React from 'react'
import { type NewsStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, BarChart3, Users } from 'lucide-react'

interface NewsStatsProps {
  stats: NewsStats
  onSymbolClick?: (symbol: string) => void
}

export function NewsStats({ stats, onSymbolClick }: NewsStatsProps) {
  const handleSymbolClick = (symbol: string) => {
    if (onSymbolClick) {
      onSymbolClick(symbol)
    }
  }

  const sentimentPercentage = {
    positive: stats.totalArticles > 0 ? (stats.positiveNews / stats.totalArticles) * 100 : 0,
    negative: stats.totalArticles > 0 ? (stats.negativeNews / stats.totalArticles) * 100 : 0,
    neutral: stats.totalArticles > 0 ? (stats.neutralNews / stats.totalArticles) * 100 : 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Sentiment Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tổng quan tâm lý thị trường
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{stats.totalArticles}</div>
              <div className="text-sm text-gray-500">Tổng số tin tức</div>
            </div>
            
            <div className="space-y-3">
              {/* Positive Sentiment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Tích cực</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600">
                    {stats.positiveNews}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sentimentPercentage.positive.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${sentimentPercentage.positive}%` }}
                />
              </div>

              {/* Negative Sentiment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Tiêu cực</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600">
                    {stats.negativeNews}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sentimentPercentage.negative.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${sentimentPercentage.negative}%` }}
                />
              </div>

              {/* Neutral Sentiment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Trung tính</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-600">
                    {stats.neutralNews}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sentimentPercentage.neutral.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-600 h-2 rounded-full"
                  style={{ width: `${sentimentPercentage.neutral}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Symbols and Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mã cổ phiếu & nguồn tin nổi bật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Top Symbols */}
            <div>
              <h4 className="text-sm font-medium mb-2">Mã được nhắc đến nhiều nhất</h4>
              <div className="space-y-2">
                {stats.topSymbols.slice(0, 5).map((item, index) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSymbolClick(item.symbol)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {item.symbol}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.count} tin</div>
                      <div className="text-xs text-gray-500">
                        Tác động TB: {item.avgImpact.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sources */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Nguồn tin hàng đầu</h4>
              <div className="space-y-2">
                {stats.topSources.slice(0, 3).map((item, index) => (
                  <div
                    key={item.source}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{item.source}</span>
                    </div>
                    <Badge variant="outline">{item.count} tin</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewsStats
