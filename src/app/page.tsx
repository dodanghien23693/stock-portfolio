'use client'

import { useEffect } from 'react'
import { useStockStore } from '@/store/stockStore'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

const mockStats = {
  vnIndex: { value: 1234.56, change: 12.34, changePercent: 1.01 },
  hnxIndex: { value: 234.56, change: -2.34, changePercent: -0.98 },
  upcomIndex: { value: 89.12, change: 0.45, changePercent: 0.51 },
  totalValue: 125000000000,
}

export default function HomePage() {
  const { stocks, fetchStocks, isLoadingStocks } = useStockStore()

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tổng quan thị trường chứng khoán Việt Nam
        </h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và phân tích thị trường chứng khoán Việt Nam
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">VN-Index</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.vnIndex.value.toFixed(2)}
              </div>
              <div className={`text-sm ${mockStats.vnIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mockStats.vnIndex.change >= 0 ? '+' : ''}{mockStats.vnIndex.change.toFixed(2)}
                ({formatPercent(mockStats.vnIndex.changePercent)})
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">HNX-Index</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.hnxIndex.value.toFixed(2)}
              </div>
              <div className={`text-sm ${mockStats.hnxIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mockStats.hnxIndex.change >= 0 ? '+' : ''}{mockStats.hnxIndex.change.toFixed(2)}
                ({formatPercent(mockStats.hnxIndex.changePercent)})
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">UPCOM-Index</div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.upcomIndex.value.toFixed(2)}
              </div>
              <div className={`text-sm ${mockStats.upcomIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mockStats.upcomIndex.change >= 0 ? '+' : ''}{mockStats.upcomIndex.change.toFixed(2)}
                ({formatPercent(mockStats.upcomIndex.changePercent)})
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Tổng giá trị GD</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(mockStats.totalValue)}
              </div>
              <div className="text-sm text-gray-500">Hôm nay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stocks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Cổ phiếu giao dịch gần đây
          </h2>
        </div>
        <div className="p-6">
          {isLoadingStocks ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã CK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên công ty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sàn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thay đổi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.slice(0, 10).map((stock) => (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.exchange}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stock.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                          ({formatPercent(stock.changePercent)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có dữ liệu cổ phiếu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
