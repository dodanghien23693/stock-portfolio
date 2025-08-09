import { TradingStrategy, StockPrice, Position, Trade } from './types';
import { calculateSMA, calculateRSI, calculateBollingerBands, calculateATR } from './indicators/technical-indicators';
import { groupPricesBySymbol, checkRiskManagement, calculateVolatility } from './utils/trading-utils';

/**
 * Volatility Breakout Strategy
 * Mua khi giá vượt qua upper Bollinger Band với volume cao
 */
export const volatilityBreakoutStrategy: TradingStrategy = {
  name: "Chiến lược Volatility Breakout",
  description: "Mua khi có breakout khối lượng cao vượt dải Bollinger trên",
  parameters: {
    bbPeriod: 20,
    bbDeviation: 2,
    volumeMultiplier: 1.5, // Volume phải cao hơn 1.5x trung bình
    atrPeriod: 14
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
      if (symbolPrices.length < 25) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const volumes = symbolPrices.map((p: StockPrice) => p.volume);
      const bands = calculateBollingerBands(closes, 20, 2);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      // Calculate average volume
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
      const currentVolume = volumes[currentIdx];
      
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
        
        // Exit on volume drop below Bollinger middle
        if (currentPrice.close < bands.middle[currentIdx] && currentVolume < avgVolume) {
          trades.push({
            symbol,
            type: "SELL",
            quantity: currentPosition.quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Volume Decline Exit"
          });
          return;
        }
      }
      
      // Buy signal: Price above upper band with high volume
      if (
        currentPrice.close > bands.upper[currentIdx] &&
        currentVolume > avgVolume * 1.5 &&
        !currentPosition
      ) {
        const quantity = Math.floor((cash * 0.08) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: `Volatility Breakout (Vol: ${(currentVolume/avgVolume).toFixed(1)}x)`
          });
        }
      }
    });
    
    return trades;
  }
};

/**
 * Mean Reversion Strategy with Contrarian Approach
 * Mua khi RSI quá bán và giá gần support, bán khi RSI quá mua
 */
export const contrarianStrategy: TradingStrategy = {
  name: "Chiến lược Contrarian",
  description: "Mua khi quá bán gần hỗ trợ, bán khi quá mua gần kháng cự",
  parameters: {
    rsiPeriod: 14,
    supportResistancePeriod: 20,
    oversoldLevel: 25,
    overboughtLevel: 75
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
      if (symbolPrices.length < 25) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const highs = symbolPrices.map((p: StockPrice) => p.high);
      const lows = symbolPrices.map((p: StockPrice) => p.low);
      
      const rsi = calculateRSI(closes, 14);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      const currentRSI = rsi[currentIdx];
      
      if (isNaN(currentRSI)) return;
      
      // Calculate support and resistance
      const recentLows = lows.slice(-20);
      const recentHighs = highs.slice(-20);
      const support = Math.min(...recentLows);
      const resistance = Math.max(...recentHighs);
      const supportResistanceRange = resistance - support;
      
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
      
      // Buy signal: RSI oversold near support
      const distanceFromSupport = (currentPrice.close - support) / supportResistanceRange;
      if (
        currentRSI < 25 &&
        distanceFromSupport < 0.3 && // Within 30% of support-resistance range from support
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
            reason: `Contrarian Buy (RSI: ${currentRSI.toFixed(1)}, Near Support)`
          });
        }
      }
      
      // Sell signal: RSI overbought near resistance  
      const distanceFromResistance = (resistance - currentPrice.close) / supportResistanceRange;
      if (
        currentRSI > 75 &&
        distanceFromResistance < 0.3 && // Within 30% of resistance
        currentPosition
      ) {
        trades.push({
          symbol,
          type: "SELL",
          quantity: currentPosition.quantity,
          price: currentPrice.close,
          date: currentPrice.date,
          reason: `Contrarian Sell (RSI: ${currentRSI.toFixed(1)}, Near Resistance)`
        });
      }
    });
    
    return trades;
  }
};

/**
 * Momentum Continuation Strategy
 * Theo trend khi có momentum mạnh
 */
export const momentumContinuationStrategy: TradingStrategy = {
  name: "Chiến lược Momentum Continuation", 
  description: "Theo đuổi xu hướng momentum mạnh với xác nhận khối lượng",
  parameters: {
    smaPeriod: 21,
    momentumPeriod: 10,
    volumePeriod: 20,
    minMomentumThreshold: 0.02 // 2% momentum minimum
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
      if (symbolPrices.length < 30) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const volumes = symbolPrices.map((p: StockPrice) => p.volume);
      const sma = calculateSMA(closes, 21);
      
      const currentIdx = closes.length - 1;
      const momentumIdx = currentIdx - 10;
      
      if (momentumIdx < 0) return;
      
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      // Calculate momentum (10-day price change)
      const momentum = (closes[currentIdx] - closes[momentumIdx]) / closes[momentumIdx];
      
      // Calculate volume trend
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
      const currentVolume = volumes[currentIdx];
      const volumeRatio = currentVolume / avgVolume;
      
      // Price above SMA (trend confirmation)
      const aboveSMA = currentPrice.close > sma[currentIdx];
      
      // Risk management
      if (currentPosition) {
        const riskCheck = checkRiskManagement(currentPosition, currentPrice.close, 0.08, 0.20);
        
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
        
        // Exit if momentum weakens
        if (momentum < 0 || !aboveSMA) {
          trades.push({
            symbol,
            type: "SELL",
            quantity: currentPosition.quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: "Momentum Weakening"
          });
          return;
        }
      }
      
      // Buy signal: Strong positive momentum with volume confirmation
      if (
        momentum > 0.02 && // At least 2% momentum
        aboveSMA &&
        volumeRatio > 1.2 && // Volume 20% above average
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
            reason: `Momentum Buy (${(momentum*100).toFixed(1)}%, Vol: ${volumeRatio.toFixed(1)}x)`
          });
        }
      }
    });
    
    return trades;
  }
};

/**
 * Defensive Value Strategy
 * Chiến thuật thận trọng, mua khi giảm sâu với volume thấp (accumulation)
 */
export const defensiveValueStrategy: TradingStrategy = {
  name: "Chiến lược Defensive Value",
  description: "Mua bảo thủ khi giá yếu với khối lượng tích lũy thấp",
  parameters: {
    smaPeriod: 50,
    maxDrawdownFromPeak: 0.15, // Mua khi giá giảm 15% từ đỉnh
    lowVolumeThreshold: 0.7 // Volume dưới 70% trung bình
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
      if (symbolPrices.length < 60) return;
      
      const closes = symbolPrices.map((p: StockPrice) => p.close);
      const volumes = symbolPrices.map((p: StockPrice) => p.volume);
      const sma = calculateSMA(closes, 50);
      
      const currentIdx = closes.length - 1;
      const currentPrice = symbolPrices[currentIdx];
      const currentPosition = positions.find(p => p.symbol === symbol);
      
      // Find recent peak (highest price in last 30 days)
      const recentPrices = closes.slice(-30);
      const recentPeak = Math.max(...recentPrices);
      const drawdownFromPeak = (recentPeak - currentPrice.close) / recentPeak;
      
      // Volume analysis
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
      const currentVolume = volumes[currentIdx];
      const volumeRatio = currentVolume / avgVolume;
      
      // Risk management - more conservative
      if (currentPosition) {
        const riskCheck = checkRiskManagement(currentPosition, currentPrice.close, 0.12, 0.25);
        
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
      
      // Buy signal: Significant drawdown with low volume (potential accumulation)
      if (
        drawdownFromPeak > 0.15 && // 15% drawdown from recent peak
        volumeRatio < 0.7 && // Low volume suggests less panic selling
        currentPrice.close > sma[currentIdx] * 0.95 && // Still near long-term trend
        !currentPosition
      ) {
        // Conservative position sizing
        const quantity = Math.floor((cash * 0.06) / currentPrice.close);
        if (quantity > 0) {
          trades.push({
            symbol,
            type: "BUY",
            quantity,
            price: currentPrice.close,
            date: currentPrice.date,
            reason: `Value Buy (${(drawdownFromPeak*100).toFixed(1)}% down, Low Vol)`
          });
        }
      }
    });
    
    return trades;
  }
};
