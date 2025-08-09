export interface StockPrice {
  date: Date;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
}

export interface Trade {
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: Date;
  commission?: number;
  reason?: string; // Lý do thực hiện giao dịch
}

export interface TradingStrategy {
  name: string;
  description?: string;
  parameters?: { [key: string]: any };
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[],
    historicalPrices?: Map<string, StockPrice[]>
  ) => Trade[];
}

export interface BacktestResult {
  initialCash: number;
  finalCash: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  trades: Trade[];
  dailyReturns: number[];
  portfolioValues: number[];
}

export interface StrategyConfig {
  strategyKey: string;
  parameters?: { [key: string]: any };
}

export interface BacktestConfig {
  symbols: string[];
  startDate: Date;
  endDate: Date;
  initialCash: number;
  strategies: StrategyConfig[];
  commission: number;
  slippage: number;
}
