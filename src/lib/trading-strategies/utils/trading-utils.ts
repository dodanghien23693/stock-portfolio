import { StockPrice, Position, Trade } from '../types';

/**
 * Nhóm giá cổ phiếu theo symbol
 */
export function groupPricesBySymbol(prices: StockPrice[]): Map<string, StockPrice[]> {
  const grouped = new Map<string, StockPrice[]>();
  
  prices.forEach(price => {
    if (!grouped.has(price.symbol)) {
      grouped.set(price.symbol, []);
    }
    grouped.get(price.symbol)!.push(price);
  });
  
  // Sort by date for each symbol
  grouped.forEach((symbolPrices, symbol) => {
    symbolPrices.sort((a, b) => a.date.getTime() - b.date.getTime());
  });
  
  return grouped;
}

/**
 * Lấy lịch sử giá của một symbol cụ thể
 */
export function getHistoricalPrices(
  allPrices: StockPrice[],
  symbol: string,
  lookbackDays: number
): StockPrice[] {
  const symbolPrices = allPrices
    .filter(p => p.symbol === symbol)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return symbolPrices.slice(-lookbackDays);
}

/**
 * Tính toán position size dựa trên phần trăm rủi ro
 */
export function calculatePositionSize(
  cash: number,
  price: number,
  riskPercentage: number = 0.02, // 2% risk per trade
  stopLossPercentage: number = 0.05 // 5% stop loss
): number {
  const riskAmount = cash * riskPercentage;
  const riskPerShare = price * stopLossPercentage;
  
  if (riskPerShare === 0) return 0;
  
  const shares = Math.floor(riskAmount / riskPerShare);
  const maxAffordableShares = Math.floor(cash / price);
  
  return Math.min(shares, maxAffordableShares);
}

/**
 * Kiểm tra điều kiện risk management
 */
export function checkRiskManagement(
  position: Position,
  currentPrice: number,
  stopLossPercentage: number = 0.05,
  takeProfitPercentage: number = 0.15
): {
  shouldStopLoss: boolean;
  shouldTakeProfit: boolean;
  pnlPercentage: number;
} {
  const pnlPercentage = (currentPrice - position.avgPrice) / position.avgPrice;
  
  return {
    shouldStopLoss: pnlPercentage <= -stopLossPercentage,
    shouldTakeProfit: pnlPercentage >= takeProfitPercentage,
    pnlPercentage
  };
}

/**
 * Validate trade trước khi thực hiện
 */
export function validateTrade(
  trade: Trade,
  cash: number,
  positions: Position[],
  commission: number = 0.0015
): {
  isValid: boolean;
  reason?: string;
} {
  const currentPosition = positions.find(p => p.symbol === trade.symbol);
  
  if (trade.type === 'BUY') {
    const totalCost = trade.price * trade.quantity * (1 + commission);
    
    if (totalCost > cash) {
      return { isValid: false, reason: 'Insufficient cash' };
    }
    
    if (trade.quantity <= 0) {
      return { isValid: false, reason: 'Invalid quantity' };
    }
  } else {
    // SELL
    if (!currentPosition || currentPosition.quantity < trade.quantity) {
      return { isValid: false, reason: 'Insufficient shares to sell' };
    }
    
    if (trade.quantity <= 0) {
      return { isValid: false, reason: 'Invalid quantity' };
    }
  }
  
  return { isValid: true };
}

/**
 * Tính toán correlation giữa các stocks
 */
export function calculateCorrelation(prices1: number[], prices2: number[]): number {
  if (prices1.length !== prices2.length || prices1.length === 0) {
    return 0;
  }
  
  const mean1 = prices1.reduce((a, b) => a + b) / prices1.length;
  const mean2 = prices2.reduce((a, b) => a + b) / prices2.length;
  
  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;
  
  for (let i = 0; i < prices1.length; i++) {
    const diff1 = prices1[i] - mean1;
    const diff2 = prices2[i] - mean2;
    
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(sumSq1 * sumSq2);
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Format number thành currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Tính volatility của một chuỗi giá
 */
export function calculateVolatility(prices: number[], period: number = 20): number {
  if (prices.length < period + 1) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const recentReturns = returns.slice(-period);
  const mean = recentReturns.reduce((a, b) => a + b) / recentReturns.length;
  const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / recentReturns.length;
  
  return Math.sqrt(variance * 252); // Annualized volatility
}

/**
 * Kiểm tra market trend
 */
export function detectMarketTrend(prices: number[], shortPeriod: number = 10, longPeriod: number = 50): 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' {
  if (prices.length < longPeriod) return 'SIDEWAYS';
  
  const recentPrices = prices.slice(-longPeriod);
  const shortMA = recentPrices.slice(-shortPeriod).reduce((a, b) => a + b) / shortPeriod;
  const longMA = recentPrices.reduce((a, b) => a + b) / longPeriod;
  
  const trendStrength = (shortMA - longMA) / longMA;
  
  if (trendStrength > 0.02) return 'UPTREND';
  if (trendStrength < -0.02) return 'DOWNTREND';
  return 'SIDEWAYS';
}

/**
 * Tính toán Kelly Criterion cho position sizing
 */
export function calculateKellyCriterion(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  if (avgLoss === 0) return 0;
  
  const winLossRatio = avgWin / Math.abs(avgLoss);
  const kelly = (winRate * winLossRatio - (1 - winRate)) / winLossRatio;
  
  // Cap at 25% for safety
  return Math.max(0, Math.min(0.25, kelly));
}
