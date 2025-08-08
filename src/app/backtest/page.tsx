'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useStockStore } from '@/store/stockStore'
import { PlusIcon, PlayIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface Backtest {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  initialCash: number
  finalCash?: number
  totalReturn?: number
  maxDrawdown?: number
  sharpeRatio?: number
  winRate?: number
  status: string
  createdAt: string
  trades: BacktestTrade[]
}

interface BacktestTrade {
  id: string
  type: string
  quantity: number
  price: number
  date: string
  commission: number
  stock: {
    symbol: string
    name: string
  }
}

const tradingStrategies = {
  smaStrategy: 'Simple Moving Average Strategy',
  buyAndHold: 'Buy and Hold Strategy'
}

export default function BacktestPage() {
  const { data: session } = useSession()
  const { stocks, fetchStocks } = useStockStore()
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [selectedBacktest, setSelectedBacktest] = useState<Backtest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showRunForm, setShowRunForm] = useState(false)
  const [newBacktest, setNewBacktest] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    initialCash: 1000000000 // 1 tỷ VND
  })
  const [runConfig, setRunConfig] = useState({
    strategy: 'smaStrategy',
    symbols: [] as string[]
  })

  useEffect(() => {
    if (session) {
      loadBacktests()
      fetchStocks()
    }
  }, [session])

  const loadBacktests = async () => {
    try {
      const response = await fetch('/api/backtests')
      if (response.ok) {
        const data = await response.json()
        setBacktests(data)
      }
    } catch (error) {
      console.error('Error loading backtests:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBacktest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBacktest)
      })

      if (response.ok) {
        await loadBacktests()
        setShowCreateForm(false)
        setNewBacktest({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          initialCash: 1000000000
        })
      }
    } catch (error) {
      console.error('Error creating backtest:', error)
    }
  }

  const runBacktest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBacktest) return

    try {
      const response = await fetch(`/api/backtests/${selectedBacktest.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runConfig)
      })

      if (response.ok) {
        await loadBacktests()
        setShowRunForm(false)
        setRunConfig({ strategy: 'smaStrategy', symbols: [] })
      }
    } catch (error) {
      console.error('Error running backtest:', error)
    }
  }

  const deleteBacktest = async (backtestId: string) => {
    if (!confirm('Bạn có chắc muốn xóa backtest này?')) return

    try {
      const response = await fetch(`/api/backtests/${backtestId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBacktests()
        if (selectedBacktest?.id === backtestId) {
          setSelectedBacktest(null)
        }
      }
    } catch (error) {
      console.error('Error deleting backtest:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case 'running':
        return <ClockIcon className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ chạy'
      case 'running':
        return 'Đang chạy'
      case 'completed':
        return 'Hoàn thành'
      case 'failed':
        return 'Thất bại'
      default:
        return status
    }
  }

  if (!session) {
    return (
      <div className="p-6">
        <p>Vui lòng đăng nhập để xem backtest</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Backtest Chiến lược</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Tạo Backtest
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backtest List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Danh sách Backtest</h2>
          <div className="space-y-3">
            {backtests.map((backtest) => {
              const isSelected = selectedBacktest?.id === backtest.id
              
              return (
                <div
                  key={backtest.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBacktest(backtest)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{backtest.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(backtest.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(backtest.status)}
                        </span>
                      </div>
                      {backtest.totalReturn !== null && backtest.totalReturn !== undefined && (
                        <p className={`text-sm font-medium mt-2 ${backtest.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {backtest.totalReturn >= 0 ? '+' : ''}{backtest.totalReturn.toFixed(2)}% return
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(backtest.startDate).toLocaleDateString('vi-VN')} - {new Date(backtest.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {backtest.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedBacktest(backtest)
                            setShowRunForm(true)
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBacktest(backtest.id)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Backtest Details */}
        <div className="lg:col-span-2">
          {selectedBacktest ? (
            <>
              {/* Backtest Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedBacktest.name}</h2>
                    {selectedBacktest.description && (
                      <p className="text-gray-600 mt-1">{selectedBacktest.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(selectedBacktest.status)}
                      <span className="text-sm text-gray-600">
                        {getStatusText(selectedBacktest.status)}
                      </span>
                    </div>
                  </div>
                  {selectedBacktest.status === 'pending' && (
                    <button
                      onClick={() => setShowRunForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                      <PlayIcon className="h-4 w-4" />
                      Chạy Backtest
                    </button>
                  )}
                </div>

                {selectedBacktest.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Vốn ban đầu</p>
                      <p className="text-xl font-bold">
                        {selectedBacktest.initialCash.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Vốn cuối</p>
                      <p className="text-xl font-bold">
                        {(selectedBacktest.finalCash || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Tổng lợi nhuận</p>
                      <p className={`text-xl font-bold ${(selectedBacktest.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(selectedBacktest.totalReturn || 0) >= 0 ? '+' : ''}{(selectedBacktest.totalReturn || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Tỷ lệ thắng</p>
                      <p className="text-xl font-bold">
                        {(selectedBacktest.winRate || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {selectedBacktest.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Max Drawdown</p>
                      <p className="text-lg font-bold text-red-600">
                        -{(selectedBacktest.maxDrawdown || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Sharpe Ratio</p>
                      <p className="text-lg font-bold">
                        {(selectedBacktest.sharpeRatio || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trades History */}
              {selectedBacktest.trades && selectedBacktest.trades.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Lịch sử giao dịch ({selectedBacktest.trades.length} giao dịch)</h3>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã CK
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tổng giá trị
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBacktest.trades.map((trade) => (
                          <tr key={trade.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(trade.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {trade.stock.symbol}
                              </div>
                              <div className="text-sm text-gray-500">
                                {trade.stock.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.type === 'BUY' ? 'Mua' : 'Bán'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trade.quantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trade.price.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(trade.price * trade.quantity).toLocaleString('vi-VN')} ₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có backtest nào</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Tạo Backtest đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Backtest Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tạo Backtest mới</h2>
            <form onSubmit={createBacktest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Backtest
                </label>
                <input
                  type="text"
                  value={newBacktest.name}
                  onChange={(e) => setNewBacktest({ ...newBacktest, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newBacktest.description}
                  onChange={(e) => setNewBacktest({ ...newBacktest, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={newBacktest.startDate}
                    onChange={(e) => setNewBacktest({ ...newBacktest, startDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={newBacktest.endDate}
                    onChange={(e) => setNewBacktest({ ...newBacktest, endDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vốn ban đầu (VND)
                </label>
                <input
                  type="number"
                  value={newBacktest.initialCash}
                  onChange={(e) => setNewBacktest({ ...newBacktest, initialCash: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="0"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Tạo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Run Backtest Modal */}
      {showRunForm && selectedBacktest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Chạy Backtest: {selectedBacktest.name}</h2>
            <form onSubmit={runBacktest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiến lược trading
                </label>
                <select
                  value={runConfig.strategy}
                  onChange={(e) => setRunConfig({ ...runConfig, strategy: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  {Object.entries(tradingStrategies).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn cổ phiếu (tối đa 5 mã)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {stocks.slice(0, 10).map((stock) => (
                    <label key={stock.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={runConfig.symbols.includes(stock.symbol)}
                        onChange={(e) => {
                          if (e.target.checked && runConfig.symbols.length < 5) {
                            setRunConfig({
                              ...runConfig,
                              symbols: [...runConfig.symbols, stock.symbol]
                            })
                          } else if (!e.target.checked) {
                            setRunConfig({
                              ...runConfig,
                              symbols: runConfig.symbols.filter(s => s !== stock.symbol)
                            })
                          }
                        }}
                        disabled={!runConfig.symbols.includes(stock.symbol) && runConfig.symbols.length >= 5}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {stock.symbol} - {stock.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Đã chọn: {runConfig.symbols.length}/5
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={runConfig.symbols.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Chạy Backtest
                </button>
                <button
                  type="button"
                  onClick={() => setShowRunForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
