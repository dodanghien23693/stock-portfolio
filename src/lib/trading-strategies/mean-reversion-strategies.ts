import { TradingStrategy, StockPrice, Position, Trade } from './types';
import { calculateBollingerBands } from './indicators/technical-indicators';
import { groupPricesBySymbol, checkRiskManagement } from './utils/trading-utils';

/**
 * Bollinger Bands Mean Reversion Strategy
 */
export const bollingerBandsStrategy: TradingStrategy = {
  name: "Chiến lược Bollinger Bands",
  description: "Mua khi giá chạm dải dưới, bán khi chạm dải trên",
  parameters: {
    period: 20,
    deviation: 2
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[]
  ): Trade[] => {
    const trades: Trade[] = [];
    const pricesBySymbol = groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 25) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const bands = calculateBollingerBands(closes, 20, 2);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      const currentClose = currentPrice.close;
      const upperBand = bands.upper[currentIdx];
      const lowerBand = bands.lower[currentIdx];
      
      if (isNaN(upperBand) || isNaN(lowerBand)) return;
      
      // Risk management
      if (currentPosition) {
        const riskCheck = checkRiskManagement(currentPosition, currentPrice.close);
        
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
      }
      
      // Buy signal: price touches lower band
      if (currentClose <= lowerBand && !currentPosition) {
        const quantity = Math.floor((cash * 0.1) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Price at Lower Bollinger Band"
          });
        }
      }
      
      // Sell signal: price touches upper band
      if (currentClose >= upperBand && currentPosition) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: "Price at Upper Bollinger Band"
        });
      }
    });
    
    return trades;
  }
};

/**
 * Buy and Hold Strategy - Cải tiến
 */
export const buyAndHoldStrategy: TradingStrategy = {
  name: "Chiến lược Mua và Nắm giữ",
  description: "Mua số lượng bằng nhau cho mỗi cổ phiếu và nắm giữ dài hạn",
  parameters: {
    rebalanceFrequency: 30 // Rebalance every 30 days
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[]
  ): Trade[] => {
    const trades: Trade[] = [];
    
    // Only execute on first day (no existing positions) or rebalancing day
    if (positions.length > 0) return trades;
    
    const uniqueSymbols = [...new Set(prices.map(p => p.symbol))];
    const cashPerStock = cash / uniqueSymbols.length;
    
    uniqueSymbols.forEach(symbol => {
      const price = prices.find(p => p.symbol === symbol);
      if (price) {
        const quantity = Math.floor(cashPerStock / price.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: price.close,
            date: price.date,
            reason: "Initial Buy and Hold Position"
          });
        }
      }
    });
    
    return trades;
  }
};
