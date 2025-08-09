import { TradingStrategy, StockPrice, Position, Trade } from './types';
import { calculateSMA, calculateEMA, calculateStochastic } from './indicators/technical-indicators';
import { groupPricesBySymbol, detectMarketTrend, checkRiskManagement } from './utils/trading-utils';

/**
 * Triple Moving Average Strategy
 */
export const tripleMAStrategy: TradingStrategy = {
  name: "Chiến lược Triple Moving Average",
  description: "Sử dụng 3 đường MA để xác nhận xu hướng",
  parameters: {
    fastPeriod: 5,
    mediumPeriod: 15,
    slowPeriod: 30
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[]
  ): Trade[] => {
    const trades: Trade[] = [];
    const pricesBySymbol = groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 35) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const fastMA = calculateSMA(closes, 5);
      const mediumMA = calculateSMA(closes, 15);
      const slowMA = calculateSMA(closes, 30);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      const currentFast = fastMA[currentIdx];
      const currentMedium = mediumMA[currentIdx];
      const currentSlow = slowMA[currentIdx];
      
      if (isNaN(currentFast) || isNaN(currentMedium) || isNaN(currentSlow)) return;
      
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
      
      // Strong bullish signal: Fast > Medium > Slow
      if (
        currentFast > currentMedium &&
        currentMedium > currentSlow &&
        !currentPosition
      ) {
        const quantity = Math.floor((cash * 0.15) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Triple MA Bullish Alignment"
          });
        }
      }
      
      // Strong bearish signal: Fast < Medium < Slow
      if (
        currentFast < currentMedium &&
        currentMedium < currentSlow &&
        currentPosition
      ) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: "Triple MA Bearish Alignment"
        });
      }
    });
    
    return trades;
  }
};

/**
 * Breakout Strategy
 */
export const breakoutStrategy: TradingStrategy = {
  name: "Chiến lược Breakout",
  description: "Mua khi giá vượt kháng cự, bán khi thủng hỗ trợ",
  parameters: {
    lookbackPeriod: 20,
    breakoutConfirmation: 0.02 // 2% breakout confirmation
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
      
      const recentPrices = symbolPrices.slice(-20);
      const currentPrice = symbolPrices[symbolPrices.length - 1];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      // Calculate support and resistance levels
      const highs = recentPrices.map((p: StockPrice) => p.high);
      const lows = recentPrices.map((p: StockPrice) => p.low);
      
      const resistance = Math.max(...highs);
      const support = Math.min(...lows);
      
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
      
      // Breakout above resistance
      if (
        currentPrice.high > resistance * 1.02 && // 2% confirmation
        !currentPosition
      ) {
        const quantity = Math.floor((cash * 0.12) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: `Breakout above ${resistance.toFixed(2)}`
          });
        }
      }
      
      // Breakdown below support
      if (
        currentPrice.low < support * 0.98 && // 2% confirmation
        currentPosition
      ) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: `Breakdown below ${support.toFixed(2)}`
        });
      }
    });
    
    return trades;
  }
};

/**
 * Multi-factor Strategy - Kết hợp nhiều chỉ báo
 */
export const multiFactorStrategy: TradingStrategy = {
  name: "Chiến lược Multi-Factor",
  description: "Kết hợp nhiều chỉ báo kỹ thuật để xác nhận tín hiệu",
  parameters: {
    smaShort: 10,
    smaLong: 30,
    rsiPeriod: 14,
    stochPeriod: 14
  },
  execute: (
    prices: StockPrice[],
    cash: number,
    positions: Position[]
  ): Trade[] => {
    const trades: Trade[] = [];
    const pricesBySymbol = groupPricesBySymbol(prices);
    
    pricesBySymbol.forEach((symbolPrices: StockPrice[], symbol: string) => {
      if (symbolPrices.length < 40) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const highs = symbolPrices.map((p: StockPrice) => p.high);
      const lows = symbolPrices.map((p: StockPrice) => p.low);
      
      const shortSMA = calculateSMA(closes, 10);
      const longSMA = calculateSMA(closes, 30);
      const stoch = calculateStochastic(highs, lows, closes, 14);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      const trend = detectMarketTrend(closes);
      const isUptrend = trend === 'UPTREND';
      const isDowntrend = trend === 'DOWNTREND';
      
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
      
      // Multi-factor buy signal
      const bullishSignals = [
        shortSMA[currentIdx] > longSMA[currentIdx], // SMA trend
        isUptrend, // Market trend
        stoch.k[currentIdx] < 80 && stoch.k[currentIdx] > 20, // Stoch not extreme
        currentPrice.close > shortSMA[currentIdx] // Price above short MA
      ];
      
      const bullishCount = bullishSignals.filter(Boolean).length;
      
      if (bullishCount >= 3 && !currentPosition) {
        const quantity = Math.floor((cash * 0.1) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: `Multi-factor bullish (${bullishCount}/4 signals)`
          });
        }
      }
      
      // Multi-factor sell signal
      const bearishSignals = [
        shortSMA[currentIdx] < longSMA[currentIdx], // SMA trend
        isDowntrend, // Market trend
        stoch.k[currentIdx] > 80, // Stoch overbought
        currentPrice.close < shortSMA[currentIdx] // Price below short MA
      ];
      
      const bearishCount = bearishSignals.filter(Boolean).length;
      
      if (bearishCount >= 3 && currentPosition) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: `Multi-factor bearish (${bearishCount}/4 signals)`
        });
      }
    });
    
    return trades;
  }
};
