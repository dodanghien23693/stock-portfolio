'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useStockStore } from '@/store/stockStore'
import { PlusIcon, PlayIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-gray-600">Vui lòng đăng nhập để xem backtest</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Backtest Chiến lược</h1>
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Backtest Chiến lược</h1>
        <p className="text-gray-600 mt-2">
          Kiểm tra hiệu quả của các chiến lược đầu tư
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Tạo Backtest
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backtest List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Danh sách Backtest</h2>
          <div className="space-y-3">
            {backtests.map((backtest) => {
              const isSelected = selectedBacktest?.id === backtest.id
              
              return (
                <Card
                  key={backtest.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBacktest(backtest)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{backtest.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(backtest.status)}
                          <Badge variant="outline">
                            {getStatusText(backtest.status)}
                          </Badge>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBacktest(backtest)
                              setShowRunForm(true)
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBacktest(backtest.id)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Backtest Details */}
        <div className="lg:col-span-2">
          {selectedBacktest ? (
            <>
              {/* Backtest Summary */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedBacktest.name}</CardTitle>
                      {selectedBacktest.description && (
                        <CardDescription className="mt-1">
                          {selectedBacktest.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(selectedBacktest.status)}
                        <Badge variant="outline">
                          {getStatusText(selectedBacktest.status)}
                        </Badge>
                      </div>
                    </div>
                    {selectedBacktest.status === 'pending' && (
                      <Dialog open={showRunForm} onOpenChange={setShowRunForm}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <PlayIcon className="h-4 w-4" />
                            Chạy Backtest
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedBacktest.status === 'completed' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Vốn ban đầu</p>
                            <p className="text-xl font-bold">
                              {selectedBacktest.initialCash.toLocaleString('vi-VN')} ₫
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Vốn cuối</p>
                            <p className="text-xl font-bold">
                              {(selectedBacktest.finalCash || 0).toLocaleString('vi-VN')} ₫
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Tổng lợi nhuận</p>
                            <p className={`text-xl font-bold ${(selectedBacktest.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(selectedBacktest.totalReturn || 0) >= 0 ? '+' : ''}{(selectedBacktest.totalReturn || 0).toFixed(2)}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Tỷ lệ thắng</p>
                            <p className="text-xl font-bold">
                              {(selectedBacktest.winRate || 0).toFixed(1)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Max Drawdown</p>
                            <p className="text-lg font-bold text-red-600">
                              -{(selectedBacktest.maxDrawdown || 0).toFixed(2)}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Sharpe Ratio</p>
                            <p className="text-lg font-bold">
                              {(selectedBacktest.sharpeRatio || 0).toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Trades History */}
              {selectedBacktest.trades && selectedBacktest.trades.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử giao dịch ({selectedBacktest.trades.length} giao dịch)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Mã CK</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Tổng giá trị</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBacktest.trades.map((trade) => (
                            <TableRow key={trade.id}>
                              <TableCell>
                                {new Date(trade.date).toLocaleDateString('vi-VN')}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{trade.stock.symbol}</div>
                                  <div className="text-sm text-gray-500">{trade.stock.name}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={trade.type === 'BUY' ? 'secondary' : 'destructive'}>
                                  {trade.type === 'BUY' ? 'Mua' : 'Bán'}
                                </Badge>
                              </TableCell>
                              <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                              <TableCell>{trade.price.toLocaleString('vi-VN')}</TableCell>
                              <TableCell>
                                {(trade.price * trade.quantity).toLocaleString('vi-VN')} ₫
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Chưa có backtest nào</p>
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      Tạo Backtest đầu tiên
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Backtest Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo Backtest mới</DialogTitle>
            <DialogDescription>
              Tạo một backtest mới để kiểm tra chiến lược đầu tư của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createBacktest}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên Backtest
                </Label>
                <Input
                  id="name"
                  value={newBacktest.name}
                  onChange={(e) => setNewBacktest({ ...newBacktest, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  value={newBacktest.description}
                  onChange={(e) => setNewBacktest({ ...newBacktest, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBacktest.startDate}
                    onChange={(e) => setNewBacktest({ ...newBacktest, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newBacktest.endDate}
                    onChange={(e) => setNewBacktest({ ...newBacktest, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initialCash" className="text-right">
                  Vốn ban đầu (VND)
                </Label>
                <Input
                  id="initialCash"
                  type="number"
                  value={newBacktest.initialCash}
                  onChange={(e) => setNewBacktest({ ...newBacktest, initialCash: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  min="0"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Hủy
              </Button>
              <Button type="submit">Tạo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Run Backtest Modal */}
      <Dialog open={showRunForm} onOpenChange={setShowRunForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chạy Backtest: {selectedBacktest?.name}</DialogTitle>
            <DialogDescription>
              Cấu hình chiến lược và chọn cổ phiếu để chạy backtest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={runBacktest}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="strategy" className="text-right">
                  Chiến lược
                </Label>
                <Select value={runConfig.strategy} onValueChange={(value) => setRunConfig({ ...runConfig, strategy: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn chiến lược" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tradingStrategies).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chọn cổ phiếu (tối đa 5 mã)</Label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {stocks.slice(0, 10).map((stock) => (
                    <div key={stock.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={stock.id}
                        checked={runConfig.symbols.includes(stock.symbol)}
                        onCheckedChange={(checked) => {
                          if (checked && runConfig.symbols.length < 5) {
                            setRunConfig({
                              ...runConfig,
                              symbols: [...runConfig.symbols, stock.symbol]
                            })
                          } else if (!checked) {
                            setRunConfig({
                              ...runConfig,
                              symbols: runConfig.symbols.filter(s => s !== stock.symbol)
                            })
                          }
                        }}
                        disabled={!runConfig.symbols.includes(stock.symbol) && runConfig.symbols.length >= 5}
                      />
                      <Label htmlFor={stock.id} className="text-sm">
                        {stock.symbol} - {stock.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Đã chọn: {runConfig.symbols.length}/5
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRunForm(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={runConfig.symbols.length === 0}>
                Chạy Backtest
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
