import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Stock {
  id: string
  symbol: string
  name: string
  exchange: string
  sector?: string
  industry?: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
}

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Portfolio {
  id: string
  name: string
  description?: string
  stocks: Array<{
    stockId: string
    symbol: string
    quantity: number
    avgPrice: number
    currentPrice: number
    totalValue: number
    profit: number
    profitPercent: number
  }>
  totalValue: number
  totalProfit: number
  totalProfitPercent: number
}

interface Backtest {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  initialCash: number
  finalCash?: number
  totalReturn?: number
  status: 'pending' | 'running' | 'completed' | 'failed'
}

interface StockStore {
  // Stock data
  stocks: Stock[]
  selectedStock: Stock | null
  stockData: StockData[]
  isLoadingStocks: boolean
  
  // Portfolio
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  isLoadingPortfolios: boolean
  
  // Backtest
  backtests: Backtest[]
  selectedBacktest: Backtest | null
  isLoadingBacktests: boolean
  
  // Actions
  setStocks: (stocks: Stock[]) => void
  setSelectedStock: (stock: Stock | null) => void
  setStockData: (data: StockData[]) => void
  setIsLoadingStocks: (loading: boolean) => void
  
  setPortfolios: (portfolios: Portfolio[]) => void
  setSelectedPortfolio: (portfolio: Portfolio | null) => void
  setIsLoadingPortfolios: (loading: boolean) => void
  
  setBacktests: (backtests: Backtest[]) => void
  setSelectedBacktest: (backtest: Backtest | null) => void
  setIsLoadingBacktests: (loading: boolean) => void
  
  // Fetch functions
  fetchStocks: () => Promise<void>
  fetchStockData: (symbol: string, period?: string) => Promise<void>
  fetchPortfolios: () => Promise<void>
  fetchBacktests: () => Promise<void>
}

export const useStockStore = create<StockStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      stocks: [],
      selectedStock: null,
      stockData: [],
      isLoadingStocks: false,
      
      portfolios: [],
      selectedPortfolio: null,
      isLoadingPortfolios: false,
      
      backtests: [],
      selectedBacktest: null,
      isLoadingBacktests: false,
      
      // Actions
      setStocks: (stocks) => set({ stocks }),
      setSelectedStock: (stock) => set({ selectedStock: stock }),
      setStockData: (data) => set({ stockData: data }),
      setIsLoadingStocks: (loading) => set({ isLoadingStocks: loading }),
      
      setPortfolios: (portfolios) => set({ portfolios }),
      setSelectedPortfolio: (portfolio) => set({ selectedPortfolio: portfolio }),
      setIsLoadingPortfolios: (loading) => set({ isLoadingPortfolios: loading }),
      
      setBacktests: (backtests) => set({ backtests }),
      setSelectedBacktest: (backtest) => set({ selectedBacktest: backtest }),
      setIsLoadingBacktests: (loading) => set({ isLoadingBacktests: loading }),
      
      // Fetch functions
      fetchStocks: async () => {
        set({ isLoadingStocks: true })
        try {
          const response = await fetch('/api/stocks')
          const stocks = await response.json()
          set({ stocks })
        } catch (error) {
          console.error('Error fetching stocks:', error)
        } finally {
          set({ isLoadingStocks: false })
        }
      },
      
      fetchStockData: async (symbol: string, period = '1Y') => {
        try {
          const response = await fetch(`/api/stocks/${symbol}/data?period=${period}`)
          const data = await response.json()
          set({ stockData: data })
        } catch (error) {
          console.error('Error fetching stock data:', error)
        }
      },
      
      fetchPortfolios: async () => {
        set({ isLoadingPortfolios: true })
        try {
          const response = await fetch('/api/portfolios')
          const portfolios = await response.json()
          set({ portfolios })
        } catch (error) {
          console.error('Error fetching portfolios:', error)
        } finally {
          set({ isLoadingPortfolios: false })
        }
      },
      
      fetchBacktests: async () => {
        set({ isLoadingBacktests: true })
        try {
          const response = await fetch('/api/backtests')
          const backtests = await response.json()
          set({ backtests })
        } catch (error) {
          console.error('Error fetching backtests:', error)
        } finally {
          set({ isLoadingBacktests: false })
        }
      },
    }),
    {
      name: 'stock-store',
    }
  )
)
