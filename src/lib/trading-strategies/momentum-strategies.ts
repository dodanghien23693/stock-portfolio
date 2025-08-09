import { TradingStrategy, StockPrice, Position, Trade } from './types';
import { calculateRSI, calculateMACD } from './indicators/technical-indicators';
import { groupPricesBySymbol, checkRiskManagement } from './utils/trading-utils';

/**
 * RSI Strategy - Mua khi RSI quá bán, bán khi RSI quá mua
 */
export const rsiStrategy: TradingStrategy = {
  name: "RSI Mean Reversion Strategy",
  description: "Buy when RSI oversold (<30), sell when RSI overbought (>70)",
  parameters: {
    rsiPeriod: 14,
    oversoldLevel: 30,
    overboughtLevel: 70,
    riskPercentage: 0.08
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[],
    historicalPrices?: Map<string, StockPrice[]>
  ): Trade[] => {
    const trades: Trade[] = [];
    const pricesBySymbol = historicalPrices || groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 20) return; // Need at least 20 days for RSI
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const rsi = calculateRSI(closes, 14);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      const currentRSI = rsi[currentIdx];
      
      if (isNaN(currentRSI)) return;
      
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
      
      // Buy signal: RSI oversold
      if (currentRSI < 30 && !currentPosition) {
        const quantity = Math.floor((cash * 0.08) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: `RSI Oversold (${currentRSI.toFixed(2)})`
          });
        }
      }
      
      // Sell signal: RSI overbought
      if (currentRSI > 70 && currentPosition) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: `RSI Overbought (${currentRSI.toFixed(2)})`
        });
      }
    });
    
    return trades;
  }
};

/**
 * MACD Strategy
 */
export const macdStrategy: TradingStrategy = {
  name: "MACD Strategy",
  description: "Buy when MACD crosses above signal line, sell when crosses below",
  parameters: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[],
    historicalPrices?: Map<string, StockPrice[]>
  ): Trade[] => {
    const trades: Trade[] = [];
    const pricesBySymbol = historicalPrices || groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 35) return; // Need sufficient data for MACD
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const macd = calculateMACD(closes);
      
      const currentIdx = closes.length - 1;
      const prevIdx = currentIdx - 1;
      
      if (prevIdx < 0) return;
      
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      const currentMACD = macd.macd[currentIdx];
      const currentSignal = macd.signal[currentIdx];
      const prevMACD = macd.macd[prevIdx];
      const prevSignal = macd.signal[prevIdx];
      
      if (isNaN(currentMACD) || isNaN(currentSignal)) return;
      
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
      
      // Buy signal: MACD crosses above signal line
      if (
        currentMACD > currentSignal &&
        prevMACD <= prevSignal &&
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
            reason: "MACD Bullish Crossover"
          });
        }
      }
      
      // Sell signal: MACD crosses below signal line
      if (
        currentMACD < currentSignal &&
        prevMACD >= prevSignal &&
        currentPosition
      ) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: "MACD Bearish Crossover"
        });
      }
    });
    
    return trades;
  }
};
