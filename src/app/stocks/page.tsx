'use client'

import { useEffect, useState } from 'react'
import { useStockStore } from '@/store/stockStore'
import { Search, Filter, BarChart3 } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import Link from 'next/link'

export default function StocksPage() {
  const { stocks, fetchStocks, isLoadingStocks } = useStockStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [exchangeFilter, setExchangeFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  const filteredStocks = stocks
    .filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExchange = exchangeFilter === 'ALL' || stock.exchange === exchangeFilter
      return matchesSearch && matchesExchange
    })
    .sort((a, b) => {
      let aVal: any, bVal: any
      switch (sortBy) {
        case 'symbol':
          aVal = a.symbol
          bVal = b.symbol
          break
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'currentPrice':
          aVal = a.currentPrice
          bVal = b.currentPrice
          break
        case 'change':
          aVal = a.change
          bVal = b.change
          break
        case 'volume':
          aVal = a.volume
          bVal = b.volume
          break
        case 'marketCap':
          aVal = a.marketCap || 0
          bVal = b.marketCap || 0
          break
        default:
          aVal = a.symbol
          bVal = b.symbol
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Danh sách mã chứng khoán
        </h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và phân tích các mã chứng khoán Việt Nam
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm mã hoặc tên công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={exchangeFilter}
              onChange={(e) => setExchangeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tất cả sàn</option>
              <option value="HOSE">HOSE</option>
              <option value="HNX">HNX</option>
              <option value="UPCOM">UPCOM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách cổ phiếu ({filteredStocks.length})
          </h2>
        </div>
        
        {isLoadingStocks ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('symbol')}
                  >
                    Mã CK {getSortIcon('symbol')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Tên công ty {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sàn
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('currentPrice')}
                  >
                    Giá {getSortIcon('currentPrice')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('change')}
                  >
                    Thay đổi {getSortIcon('change')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('volume')}
                  >
                    KL {getSortIcon('volume')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('marketCap')}
                  >
                    Vốn hóa {getSortIcon('marketCap')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/stocks/${stock.symbol}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {stock.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stock.name}</div>
                      {stock.sector && (
                        <div className="text-xs text-gray-500">{stock.sector}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stock.exchange === 'HOSE' ? 'bg-red-100 text-red-800' :
                        stock.exchange === 'HNX' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {stock.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </div>
                      <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({formatPercent(stock.changePercent)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatNumber(stock.volume)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stock.marketCap ? formatCurrency(stock.marketCap) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-center"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoadingStocks && filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy cổ phiếu nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
