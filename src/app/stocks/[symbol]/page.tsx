'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import Link from 'next/link'

interface StockInfo {
  id: string
  symbol: string
  name: string
  exchange: string
  sector?: string
  industry?: string
}

interface StockDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  value: number
}

interface StockDetailData {
  stock: StockInfo
  data: StockDataPoint[]
}

export default function StockDetailPage() {
  const params = useParams()
  const symbol = params.symbol as string
  const [stockData, setStockData] = useState<StockDetailData | null>(null)
  const [period, setPeriod] = useState('1M')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/stocks/${symbol.toUpperCase()}/data?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch stock data')
        }
        const data = await response.json()
        setStockData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [symbol, period])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !stockData) {
    return (
      <div className="space-y-6">
        <Link href="/stocks" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Không tìm thấy dữ liệu cổ phiếu'}</p>
        </div>
      </div>
    )
  }

  const { stock, data } = stockData
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]
  
  const currentPrice = latestData?.close || 0
  const previousPrice = previousData?.close || latestData?.open || 0
  const change = currentPrice - previousPrice
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0

  const periods = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: '5Y', value: '5Y' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/stocks" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
      </div>

      {/* Stock Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
            <p className="text-lg text-gray-600">{stock.name}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                stock.exchange === 'HOSE' ? 'bg-red-100 text-red-800' :
                stock.exchange === 'HNX' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {stock.exchange}
              </span>
              {stock.sector && (
                <span className="text-sm text-gray-500">{stock.sector}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(currentPrice)}
            </div>
            <div className={`flex items-center justify-end mt-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-lg font-semibold">
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({formatPercent(changePercent)})
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2 mb-4">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded-md ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ giá</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  formatCurrency(value),
                  name === 'close' ? 'Giá đóng cửa' : name
                ]}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('vi-VN')
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                name="Giá đóng cửa"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Giá mở cửa</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(latestData?.open || 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Giá cao nhất</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(latestData?.high || 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Giá thấp nhất</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(latestData?.low || 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Khối lượng</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(latestData?.volume || 0)}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lịch sử giá</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mở cửa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cao nhất
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thấp nhất
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đóng cửa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khối lượng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice().reverse().slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.open)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    {formatCurrency(item.high)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    {formatCurrency(item.low)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(item.close)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatNumber(item.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
