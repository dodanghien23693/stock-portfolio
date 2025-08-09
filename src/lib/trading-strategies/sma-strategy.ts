import { TradingStrategy, StockPrice, Position, Trade } from './types';
import { calculateSMA } from './indicators/technical-indicators';
import { groupPricesBySymbol, calculatePositionSize, checkRiskManagement } from './utils/trading-utils';

/**
 * Simple Moving Average Crossover Strategy
 * Mua khi SMA ngắn hạn cắt lên SMA dài hạn, bán khi ngược lại
 */
export const smaStrategy: TradingStrategy = {
  name: "Chiến lược SMA Crossover",
  description: "Mua khi SMA ngắn hạn cắt lên SMA dài hạn, bán khi cắt xuống",
  parameters: {
    shortPeriod: 10,
    longPeriod: 30,
    riskPercentage: 0.1, // 10% of cash per position
    stopLossPercentage: 0.05, // 5% stop loss
    takeProfitPercentage: 0.15 // 15% take profit
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[],
    historicalPrices?: Map<string, StockPrice[]>
  ): Trade[] => {
    const trades: Trade[] = [];
    
    // Use historical prices if available, otherwise use current prices
    const pricesBySymbol = historicalPrices || groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 35) return; // Need at least 35 days for 30-day SMA + buffer
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const shortSMA = calculateSMA(closes, 10);
      const longSMA = calculateSMA(closes, 30);
      
      const currentIdx = closes.length - 1;
      const prevIdx = currentIdx - 1;
      
      if (prevIdx < 0 || isNaN(shortSMA[currentIdx]) || isNaN(longSMA[currentIdx]) || 
          isNaN(shortSMA[prevIdx]) || isNaN(longSMA[prevIdx])) return;
      
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      // Check risk management for existing positions
      if (currentPosition) {
        const riskCheck = checkRiskManagement(
          currentPosition,
          currentPrice.close,
          0.05, // 5% stop loss
          0.15  // 15% take profit
        );
        
        if (riskCheck.shouldStopLoss) {
          trades.push({
            symbol,
            type: "SELL",
            quantity: currentPosition.quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Stop Loss"
          });
          return;
        }
        
        if (riskCheck.shouldTakeProfit) {
          trades.push({
            symbol,
            type: "SELL",
            quantity: currentPosition.quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Take Profit"
          });
          return;
        }
      }
      
      // Buy signal: short SMA crosses above long SMA
      if (
        shortSMA[currentIdx] > longSMA[currentIdx] &&
        shortSMA[prevIdx] <= longSMA[prevIdx] &&
        !currentPosition
      ) {
        const quantity = Math.floor((cash * 0.1) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "SMA Golden Cross"
          });
        }
      }
      
      // Sell signal: short SMA crosses below long SMA
      if (
        shortSMA[currentIdx] < longSMA[currentIdx] &&
        shortSMA[prevIdx] >= longSMA[prevIdx] &&
        currentPosition
      ) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: "SMA Death Cross"
        });
      }
    });
    
    return trades;
  }
};
