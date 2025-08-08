import { Session as NextAuthSession } from 'next-auth'

export interface Stock {
  id: string
  symbol: string
  name: string
  exchange: string
  sector?: string
  industry?: string
  marketCap?: number
  listedShares?: number
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  createdAt: Date
  updatedAt: Date
}

export interface StockData {
  id: string
  stockId: string
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  value: number
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  stocks: PortfolioStock[]
}

export interface PortfolioStock {
  id: string
  portfolioId: string
  stockId: string
  quantity: number
  avgPrice?: number
  createdAt: Date
  updatedAt: Date
  stock: Stock
}

export interface Backtest {
  id: string
  userId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  initialCash: number
  finalCash?: number
  totalReturn?: number
  maxDrawdown?: number
  sharpeRatio?: number
  winRate?: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  trades: BacktestTrade[]
}

export interface BacktestTrade {
  id: string
  backtestId: string
  stockId: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Date
  commission: number
  backtest: Backtest
  stock: Stock
}

export interface News {
  id: string
  stockId?: string
  title: string
  content?: string
  summary?: string
  url?: string
  source?: string
  publishedAt: Date
  createdAt: Date
  stock?: Stock
}

export interface Event {
  id: string
  stockId: string
  type: string
  title: string
  description?: string
  eventDate: Date
  createdAt: Date
  stock: Stock
}

export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
  portfolios: Portfolio[]
  backtests: Backtest[]
}

// Extend NextAuth Session
declare module 'next-auth' {
  interface Session extends NextAuthSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Chart data types
export interface ChartDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and Sort types
export interface StockFilter {
  exchange?: string
  sector?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minVolume?: number
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

// Backtest Strategy types
export interface TradingStrategy {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  rules: TradingRule[]
}

export interface TradingRule {
  id: string
  type: 'BUY' | 'SELL'
  condition: string
  parameters: Record<string, any>
}

export interface BacktestResult {
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
  profitableTrades: number
  averageWin: number
  averageLoss: number
  profitFactor: number
}
