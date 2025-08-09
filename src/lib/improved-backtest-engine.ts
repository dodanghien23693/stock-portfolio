import { prisma } from "@/lib/prisma";
import { 
  StockPrice, 
  Position, 
  Trade, 
  TradingStrategy, 
  BacktestResult, 
  BacktestConfig 
} from './trading-strategies/types';
import { validateTrade } from './trading-strategies/utils/trading-utils';

export class BacktestEngine {
  private commission: number = 0.0015; // 0.15% commission
  private slippage: number = 0.001; // 0.1% slippage

  constructor(commission?: number, slippage?: number) {
    if (commission !== undefined) this.commission = commission;
    if (slippage !== undefined) this.slippage = slippage;
  }

  async runBacktest(
    backtestId: string,
    strategy: TradingStrategy,
    symbols: string[],
    startDate: Date,
    endDate: Date,
    initialCash: number
  ): Promise<BacktestResult> {
    try {
      console.log(`Starting backtest ${backtestId} with strategy: ${strategy.name}`);
      
      // Update backtest status
      await prisma.backtest.update({
        where: { id: backtestId },
        data: { status: "running" },
      });

      // Get historical data for all symbols
      const stocksData = await this.getHistoricalData(symbols, startDate, endDate);
      console.log(`Loaded ${stocksData.length} price records for ${symbols.length} symbols`);

      if (stocksData.length === 0) {
        throw new Error("No historical data found for the specified symbols and date range");
      }

      // Run simulation
      const result = await this.simulate(strategy, stocksData, initialCash);
      console.log(`Backtest completed. Total trades: ${result.totalTrades}, Final return: ${result.totalReturnPercent.toFixed(2)}%`);

      // Save trades to database
      if (result.trades.length > 0) {
        await this.saveTrades(backtestId, result.trades);
      }

      // Update backtest with results
      await prisma.backtest.update({
        where: { id: backtestId },
        data: {
          finalCash: result.finalCash,
          totalReturn: result.totalReturnPercent,
          maxDrawdown: result.maxDrawdown,
          sharpeRatio: result.sharpeRatio,
          winRate: result.winRate,
          status: "completed",
        },
      });

      return result;
    } catch (error) {
      console.error("Backtest error:", error);

      // Update backtest status to failed
      await prisma.backtest.update({
        where: { id: backtestId },
        data: { 
          status: "failed",
          // Store error message in description field if available
        },
      });

      throw error;
    }
  }

  private async getHistoricalData(
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): Promise<StockPrice[]> {
    // Convert dates to string format used in StockHistory
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(`Fetching data for symbols: ${symbols.join(', ')} from ${startDateStr} to ${endDateStr}`);

    const stockHistories = await prisma.stockHistory.findMany({
      where: {
        symbol: { in: symbols },
        date: {
          gte: startDateStr,
          lte: endDateStr,
        },
      },
      orderBy: [
        { date: "asc" },
        { symbol: "asc" }
      ],
    });

    const stockPrices: StockPrice[] = stockHistories.map((history) => ({
      date: new Date(history.date + 'T00:00:00'), // Ensure proper date parsing
      symbol: history.symbol,
      open: history.open,
      high: history.high,
      low: history.low,
      close: history.close,
      volume: history.volume,
    }));

    // Group by symbol to check data quality
    const dataBySymbol = new Map<string, number>();
    stockPrices.forEach(price => {
      dataBySymbol.set(price.symbol, (dataBySymbol.get(price.symbol) || 0) + 1);
    });

    console.log('Data summary by symbol:');
    dataBySymbol.forEach((count, symbol) => {
      console.log(`  ${symbol}: ${count} records`);
    });

    return stockPrices.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private async simulate(
    strategy: TradingStrategy,
    stocksData: StockPrice[],
    initialCash: number
  ): Promise<BacktestResult> {
    let cash = initialCash;
    const positions: { [symbol: string]: Position } = {};
    const allTrades: Trade[] = [];
    const portfolioValues: number[] = [];
    const dailyReturns: number[] = [];

    // Group prices by date for day-by-day simulation
    const pricesByDate = new Map<string, StockPrice[]>();
    stocksData.forEach((price) => {
      const dateKey = price.date.toISOString().split("T")[0];
      if (!pricesByDate.has(dateKey)) {
        pricesByDate.set(dateKey, []);
      }
      pricesByDate.get(dateKey)!.push(price);
    });

    const dates = Array.from(pricesByDate.keys()).sort();
    let previousPortfolioValue = initialCash;

    console.log(`Simulating ${dates.length} trading days...`);

    // Build historical price map for strategy access
    const historicalPrices = new Map<string, StockPrice[]>();
    
    for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
      const currentDate = dates[dayIndex];
      const dayPrices = pricesByDate.get(currentDate) || [];

      // Update historical prices up to current date
      dayPrices.forEach(price => {
        if (!historicalPrices.has(price.symbol)) {
          historicalPrices.set(price.symbol, []);
        }
        historicalPrices.get(price.symbol)!.push(price);
      });

      // Update current prices for positions
      const currentPositions = Object.values(positions);
      dayPrices.forEach((price) => {
        if (positions[price.symbol]) {
          positions[price.symbol].currentPrice = price.close;
          positions[price.symbol].unrealizedPnL =
            (price.close - positions[price.symbol].avgPrice) *
            positions[price.symbol].quantity;
        }
      });

      // Execute strategy with historical context
      try {
        const trades = strategy.execute(
          dayPrices, 
          cash, 
          currentPositions, 
          historicalPrices
        );

        // Process trades
        for (const trade of trades) {
          const validation = validateTrade(trade, cash, currentPositions, this.commission);
          
          if (!validation.isValid) {
            console.log(`Trade rejected for ${trade.symbol}: ${validation.reason}`);
            continue;
          }

          const executed = this.executeTrade(trade, cash, positions);
          if (executed) {
            cash = executed.newCash;
            allTrades.push(executed.trade);
            console.log(`Executed ${executed.trade.type} ${executed.trade.quantity} ${executed.trade.symbol} at ${executed.trade.price.toFixed(2)} on ${executed.trade.date.toISOString().split('T')[0]}`);
          }
        }
      } catch (strategyError) {
        console.error(`Strategy execution error on ${currentDate}:`, strategyError);
        // Continue execution on strategy errors
      }

      // Calculate portfolio value
      const positionsValue = Object.values(positions).reduce(
        (sum, pos) => sum + pos.currentPrice * pos.quantity,
        0
      );
      const portfolioValue = cash + positionsValue;
      portfolioValues.push(portfolioValue);

      // Calculate daily return
      if (previousPortfolioValue > 0) {
        const dailyReturn =
          (portfolioValue - previousPortfolioValue) / previousPortfolioValue;
        dailyReturns.push(dailyReturn);
      }
      previousPortfolioValue = portfolioValue;

      // Log progress every 50 days
      if ((dayIndex + 1) % 50 === 0) {
        console.log(`Day ${dayIndex + 1}/${dates.length}: Portfolio value: ${portfolioValue.toFixed(2)}, Cash: ${cash.toFixed(2)}, Positions: ${Object.keys(positions).length}`);
      }
    }

    // Calculate final metrics
    const finalPortfolioValue = portfolioValues[portfolioValues.length - 1] || initialCash;
    const totalReturn = finalPortfolioValue - initialCash;
    const totalReturnPercent = (totalReturn / initialCash) * 100;

    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues);
    const sharpeRatio = this.calculateSharpeRatio(dailyReturns);
    const winLossStats = this.calculateWinLossStats(allTrades, positions);

    return {
      initialCash,
      finalCash: cash,
      totalReturn,
      totalReturnPercent,
      maxDrawdown,
      sharpeRatio,
      winRate: winLossStats.winRate,
      totalTrades: allTrades.length,
      winningTrades: winLossStats.winningTrades,
      losingTrades: winLossStats.losingTrades,
      avgWin: winLossStats.avgWin,
      avgLoss: winLossStats.avgLoss,
      profitFactor: winLossStats.profitFactor,
      trades: allTrades,
      dailyReturns,
      portfolioValues
    };
  }

  private executeTrade(
    trade: Trade,
    cash: number,
    positions: { [symbol: string]: Position }
  ): { trade: Trade; newCash: number } | null {
    const commission = trade.price * trade.quantity * this.commission;
    const slippageAdjustment = trade.type === "BUY" ? 1 + this.slippage : 1 - this.slippage;
    const adjustedPrice = trade.price * slippageAdjustment;

    if (trade.type === "BUY") {
      const totalCost = adjustedPrice * trade.quantity + commission;
      if (totalCost > cash) {
        return null; // Not enough cash
      }

      // Update or create position
      if (positions[trade.symbol]) {
        const existing = positions[trade.symbol];
        const totalQuantity = existing.quantity + trade.quantity;
        const totalCost = existing.avgPrice * existing.quantity + adjustedPrice * trade.quantity;
        existing.avgPrice = totalCost / totalQuantity;
        existing.quantity = totalQuantity;
      } else {
        positions[trade.symbol] = {
          symbol: trade.symbol,
          quantity: trade.quantity,
          avgPrice: adjustedPrice,
          currentPrice: adjustedPrice,
          unrealizedPnL: 0,
        };
      }

      return {
        trade: { ...trade, price: adjustedPrice, commission },
        newCash: cash - totalCost,
      };
    } else {
      // SELL
      if (!positions[trade.symbol] || positions[trade.symbol].quantity < trade.quantity) {
        return null; // Not enough shares
      }

      const totalRevenue = adjustedPrice * trade.quantity - commission;

      // Update position
      positions[trade.symbol].quantity -= trade.quantity;
      if (positions[trade.symbol].quantity === 0) {
        delete positions[trade.symbol];
      }

      return {
        trade: { ...trade, price: adjustedPrice, commission },
        newCash: cash + totalRevenue,
      };
    }
  }

  private calculateMaxDrawdown(portfolioValues: number[]): number {
    if (portfolioValues.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = portfolioValues[0];

    for (const value of portfolioValues) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown * 100;
  }

  private calculateSharpeRatio(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0;

    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance);

    return volatility === 0 ? 0 : (avgReturn / volatility) * Math.sqrt(252); // Annualized
  }

  private calculateWinLossStats(trades: Trade[], positions: { [symbol: string]: Position }): {
    winRate: number;
    winningTrades: number;
    losingTrades: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  } {
    if (trades.length === 0) {
      return { winRate: 0, winningTrades: 0, losingTrades: 0, avgWin: 0, avgLoss: 0, profitFactor: 0 };
    }

    // Track positions for round-trip calculations
    const tempPositions: { [symbol: string]: { quantity: number; avgPrice: number } } = {};
    const roundTripPnLs: number[] = [];

    for (const trade of trades) {
      if (trade.type === "BUY") {
        if (tempPositions[trade.symbol]) {
          const existing = tempPositions[trade.symbol];
          const totalQuantity = existing.quantity + trade.quantity;
          const totalCost = existing.avgPrice * existing.quantity + trade.price * trade.quantity;
          existing.avgPrice = totalCost / totalQuantity;
          existing.quantity = totalQuantity;
        } else {
          tempPositions[trade.symbol] = {
            quantity: trade.quantity,
            avgPrice: trade.price,
          };
        }
      } else {
        // SELL
        if (tempPositions[trade.symbol]) {
          const position = tempPositions[trade.symbol];
          const sellQuantity = Math.min(trade.quantity, position.quantity);
          const pnl = (trade.price - position.avgPrice) * sellQuantity;
          
          // Include commission costs
          const totalCommission = (trade.commission || 0) + (position.avgPrice * sellQuantity * this.commission);
          const netPnL = pnl - totalCommission;
          
          roundTripPnLs.push(netPnL);

          position.quantity -= sellQuantity;
          if (position.quantity <= 0) {
            delete tempPositions[trade.symbol];
          }
        }
      }
    }

    const wins = roundTripPnLs.filter(pnl => pnl > 0);
    const losses = roundTripPnLs.filter(pnl => pnl < 0);

    const winningTrades = wins.length;
    const losingTrades = losses.length;
    const totalCompletedTrades = winningTrades + losingTrades;

    const winRate = totalCompletedTrades === 0 ? 0 : (winningTrades / totalCompletedTrades) * 100;
    const avgWin = winningTrades === 0 ? 0 : wins.reduce((a, b) => a + b, 0) / winningTrades;
    const avgLoss = losingTrades === 0 ? 0 : Math.abs(losses.reduce((a, b) => a + b, 0) / losingTrades);
    
    const totalWins = wins.reduce((a, b) => a + b, 0);
    const totalLosses = Math.abs(losses.reduce((a, b) => a + b, 0));
    const profitFactor = totalLosses === 0 ? (totalWins > 0 ? Infinity : 0) : totalWins / totalLosses;

    return {
      winRate,
      winningTrades,
      losingTrades,
      avgWin,
      avgLoss,
      profitFactor
    };
  }

  private async saveTrades(backtestId: string, trades: Trade[]): Promise<void> {
    console.log(`Saving ${trades.length} trades to database...`);
    
    for (const trade of trades) {
      try {
        const stock = await prisma.stock.findUnique({
          where: { symbol: trade.symbol },
        });

        if (stock) {
          await prisma.backtestTrade.create({
            data: {
              backtestId,
              stockId: stock.id,
              type: trade.type,
              quantity: trade.quantity,
              price: trade.price,
              date: trade.date,
              commission: trade.commission || 0,
            },
          });
        } else {
          console.warn(`Stock not found for symbol: ${trade.symbol}`);
        }
      } catch (error) {
        console.error(`Error saving trade for ${trade.symbol}:`, error);
      }
    }
  }
}

export const backtestEngine = new BacktestEngine();
