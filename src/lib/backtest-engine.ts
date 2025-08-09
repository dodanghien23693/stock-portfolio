import { prisma } from '@/lib/prisma'

export interface Trade {
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Date
  commission?: number
}

export interface BacktestResult {
  initialCash: number
  finalCash: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  trades: Trade[]
}

export interface TradingStrategy {
  name: string
  description?: string
  execute: (prices: StockPrice[], cash: number, positions: Position[]) => Trade[]
}

export interface StockPrice {
  date: Date
  symbol: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  unrealizedPnL: number
}

export class BacktestEngine {
  private commission = 0.0015 // 0.15% commission
  private slippage = 0.001 // 0.1% slippage

  async runBacktest(
    backtestId: string,
    strategy: TradingStrategy,
    symbols: string[],
    startDate: Date,
    endDate: Date,
    initialCash: number
  ): Promise<BacktestResult> {
    try {
      // Update backtest status
      await prisma.backtest.update({
        where: { id: backtestId },
        data: { status: 'running' }
      })

      // Get historical data for all symbols
      const stocksData = await this.getHistoricalData(symbols, startDate, endDate)
      
      if (stocksData.length === 0) {
        throw new Error('No historical data found')
      }

      // Run simulation
      const result = await this.simulate(strategy, stocksData, initialCash)

      // Save trades to database
      await this.saveTrades(backtestId, result.trades)

      // Update backtest with results
      await prisma.backtest.update({
        where: { id: backtestId },
        data: {
          finalCash: result.finalCash,
          totalReturn: result.totalReturnPercent,
          maxDrawdown: result.maxDrawdown,
          sharpeRatio: result.sharpeRatio,
          winRate: result.winRate,
          status: 'completed'
        }
      })

      return result
    } catch (error) {
      console.error('Backtest error:', error)
      
      // Update backtest status to failed
      await prisma.backtest.update({
        where: { id: backtestId },
        data: { status: 'failed' }
      })
      
      throw error
    }
  }

  private async getHistoricalData(
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): Promise<StockPrice[]> {
    // Convert dates to string format used in StockHistory
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const stockHistories = await prisma.stockHistory.findMany({
      where: {
        symbol: { in: symbols },
        date: {
          gte: startDateStr,
          lte: endDateStr
        }
      },
      orderBy: { date: 'asc' }
    })

    const stockPrices: StockPrice[] = stockHistories.map(history => ({
      date: new Date(history.date),
      symbol: history.symbol,
      open: history.open,
      high: history.high,
      low: history.low,
      close: history.close,
      volume: history.volume
    }))

    return stockPrices.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  private async simulate(
    strategy: TradingStrategy,
    stocksData: StockPrice[],
    initialCash: number
  ): Promise<BacktestResult> {
    let cash = initialCash
    const positions: { [symbol: string]: Position } = {}
    const allTrades: Trade[] = []
    const portfolioValues: number[] = []
    const dailyReturns: number[] = []

    // Group prices by date
    const pricesByDate = new Map<string, StockPrice[]>()
    stocksData.forEach(price => {
      const dateKey = price.date.toISOString().split('T')[0]
      if (!pricesByDate.has(dateKey)) {
        pricesByDate.set(dateKey, [])
      }
      pricesByDate.get(dateKey)!.push(price)
    })

    const dates = Array.from(pricesByDate.keys()).sort()
    let previousPortfolioValue = initialCash

    for (const date of dates) {
      const dayPrices = pricesByDate.get(date) || []
      
      // Update current prices for positions
      const currentPositions = Object.values(positions)
      dayPrices.forEach(price => {
        if (positions[price.symbol]) {
          positions[price.symbol].currentPrice = price.close
          positions[price.symbol].unrealizedPnL = 
            (price.close - positions[price.symbol].avgPrice) * positions[price.symbol].quantity
        }
      })

      // Execute strategy
      const trades = strategy.execute(dayPrices, cash, currentPositions)

      // Process trades
      for (const trade of trades) {
        const executed = this.executeTrade(trade, cash, positions)
        if (executed) {
          cash = executed.newCash
          allTrades.push(executed.trade)
        }
      }

      // Calculate portfolio value
      const positionsValue = Object.values(positions).reduce(
        (sum, pos) => sum + (pos.currentPrice * pos.quantity), 0
      )
      const portfolioValue = cash + positionsValue
      portfolioValues.push(portfolioValue)

      // Calculate daily return
      if (previousPortfolioValue > 0) {
        const dailyReturn = (portfolioValue - previousPortfolioValue) / previousPortfolioValue
        dailyReturns.push(dailyReturn)
      }
      previousPortfolioValue = portfolioValue
    }

    // Calculate metrics
    const finalPortfolioValue = portfolioValues[portfolioValues.length - 1] || initialCash
    const totalReturn = finalPortfolioValue - initialCash
    const totalReturnPercent = (totalReturn / initialCash) * 100

    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues)
    const sharpeRatio = this.calculateSharpeRatio(dailyReturns)
    const { winRate, winningTrades, losingTrades } = this.calculateWinRate(allTrades)

    return {
      initialCash,
      finalCash: cash,
      totalReturn,
      totalReturnPercent,
      maxDrawdown,
      sharpeRatio,
      winRate,
      totalTrades: allTrades.length,
      winningTrades,
      losingTrades,
      trades: allTrades
    }
  }

  private executeTrade(
    trade: Trade,
    cash: number,
    positions: { [symbol: string]: Position }
  ): { trade: Trade; newCash: number } | null {
    const commission = trade.price * trade.quantity * this.commission
    const slippageAdjustment = trade.type === 'BUY' ? 1 + this.slippage : 1 - this.slippage
    const adjustedPrice = trade.price * slippageAdjustment

    if (trade.type === 'BUY') {
      const totalCost = adjustedPrice * trade.quantity + commission
      if (totalCost > cash) {
        return null // Not enough cash
      }

      // Update or create position
      if (positions[trade.symbol]) {
        const existing = positions[trade.symbol]
        const totalQuantity = existing.quantity + trade.quantity
        const totalCost = existing.avgPrice * existing.quantity + adjustedPrice * trade.quantity
        existing.avgPrice = totalCost / totalQuantity
        existing.quantity = totalQuantity
      } else {
        positions[trade.symbol] = {
          symbol: trade.symbol,
          quantity: trade.quantity,
          avgPrice: adjustedPrice,
          currentPrice: adjustedPrice,
          unrealizedPnL: 0
        }
      }

      return {
        trade: { ...trade, price: adjustedPrice, commission },
        newCash: cash - totalCost
      }
    } else { // SELL
      if (!positions[trade.symbol] || positions[trade.symbol].quantity < trade.quantity) {
        return null // Not enough shares
      }

      const totalRevenue = adjustedPrice * trade.quantity - commission
      
      // Update position
      positions[trade.symbol].quantity -= trade.quantity
      if (positions[trade.symbol].quantity === 0) {
        delete positions[trade.symbol]
      }

      return {
        trade: { ...trade, price: adjustedPrice, commission },
        newCash: cash + totalRevenue
      }
    }
  }

  private calculateMaxDrawdown(portfolioValues: number[]): number {
    let maxDrawdown = 0
    let peak = portfolioValues[0] || 0

    for (const value of portfolioValues) {
      if (value > peak) {
        peak = value
      }
      const drawdown = (peak - value) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown * 100
  }

  private calculateSharpeRatio(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0
    
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    const volatility = Math.sqrt(variance)
    
    return volatility === 0 ? 0 : (avgReturn / volatility) * Math.sqrt(252) // Annualized
  }

  private calculateWinRate(trades: Trade[]): { winRate: number; winningTrades: number; losingTrades: number } {
    if (trades.length === 0) return { winRate: 0, winningTrades: 0, losingTrades: 0 }

    // Group trades by symbol to calculate P&L per round trip
    const roundTrips: { [symbol: string]: { buyPrice: number; sellPrice: number; quantity: number }[] } = {}
    const positions: { [symbol: string]: { quantity: number; avgPrice: number } } = {}

    let winningTrades = 0
    let losingTrades = 0

    for (const trade of trades) {
      if (trade.type === 'BUY') {
        if (positions[trade.symbol]) {
          const existing = positions[trade.symbol]
          const totalQuantity = existing.quantity + trade.quantity
          const totalCost = existing.avgPrice * existing.quantity + trade.price * trade.quantity
          existing.avgPrice = totalCost / totalQuantity
          existing.quantity = totalQuantity
        } else {
          positions[trade.symbol] = {
            quantity: trade.quantity,
            avgPrice: trade.price
          }
        }
      } else { // SELL
        if (positions[trade.symbol]) {
          const position = positions[trade.symbol]
          const sellQuantity = Math.min(trade.quantity, position.quantity)
          const pnl = (trade.price - position.avgPrice) * sellQuantity
          
          if (pnl > 0) {
            winningTrades++
          } else if (pnl < 0) {
            losingTrades++
          }

          position.quantity -= sellQuantity
          if (position.quantity <= 0) {
            delete positions[trade.symbol]
          }
        }
      }
    }

    const totalCompletedTrades = winningTrades + losingTrades
    const winRate = totalCompletedTrades === 0 ? 0 : (winningTrades / totalCompletedTrades) * 100

    return { winRate, winningTrades, losingTrades }
  }

  private async saveTrades(backtestId: string, trades: Trade[]): Promise<void> {
    for (const trade of trades) {
      const stock = await prisma.stock.findUnique({
        where: { symbol: trade.symbol }
      })

      if (stock) {
        await prisma.backtestTrade.create({
          data: {
            backtestId,
            stockId: stock.id,
            type: trade.type,
            quantity: trade.quantity,
            price: trade.price,
            date: trade.date,
            commission: trade.commission || 0
          }
        })
      }
    }
  }
}

// Sample trading strategies
export const TRADING_STRATEGIES: { [key: string]: TradingStrategy } = {
  smaStrategy: {
    name: 'Simple Moving Average Strategy',
    description: 'Buy when price crosses above SMA, sell when below',
    execute: (prices: StockPrice[], cash: number, positions: Position[]): Trade[] => {
      const trades: Trade[] = []
      const smaWindow = 20
      
      // Group prices by symbol
      const pricesBySymbol = new Map<string, StockPrice[]>()
      prices.forEach(price => {
        if (!pricesBySymbol.has(price.symbol)) {
          pricesBySymbol.set(price.symbol, [])
        }
        pricesBySymbol.get(price.symbol)!.push(price)
      })

      pricesBySymbol.forEach((symbolPrices, symbol) => {
        if (symbolPrices.length < smaWindow) return

        const recentPrices = symbolPrices.slice(-smaWindow)
        const sma = recentPrices.reduce((sum, p) => sum + p.close, 0) / smaWindow
        const currentPrice = symbolPrices[symbolPrices.length - 1].close
        const currentPosition = positions.find(p => p.symbol === symbol)

        // Buy signal: price above SMA and no position
        if (currentPrice > sma && !currentPosition) {
          const quantity = Math.floor((cash * 0.1) / currentPrice) // Use 10% of cash
          if (quantity > 0) {
            trades.push({
              symbol,
              type: 'BUY',
              quantity,
              price: currentPrice,
              date: symbolPrices[symbolPrices.length - 1].date
            })
          }
        }
        
        // Sell signal: price below SMA and have position
        if (currentPrice < sma && currentPosition && currentPosition.quantity > 0) {
          trades.push({
            symbol,
            type: 'SELL',
            quantity: currentPosition.quantity,
            price: currentPrice,
            date: symbolPrices[symbolPrices.length - 1].date
          })
        }
      })

      return trades
    }
  },

  buyAndHold: {
    name: 'Buy and Hold Strategy',
    description: 'Buy equal amounts of each stock and hold',
    execute: (prices: StockPrice[], cash: number, positions: Position[]): Trade[] => {
      const trades: Trade[] = []
      
      // Only execute on first day (no existing positions)
      if (positions.length > 0) return trades

      const uniqueSymbols = [...new Set(prices.map(p => p.symbol))]
      const cashPerStock = cash / uniqueSymbols.length

      uniqueSymbols.forEach(symbol => {
        const price = prices.find(p => p.symbol === symbol)
        if (price) {
          const quantity = Math.floor(cashPerStock / price.close)
          if (quantity > 0) {
            trades.push({
              symbol,
              type: 'BUY',
              quantity,
              price: price.close,
              date: price.date
            })
          }
        }
      })

      return trades
    }
  }
}

export const backtestEngine = new BacktestEngine()
