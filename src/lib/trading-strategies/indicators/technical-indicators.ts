import { StockPrice } from '../types';

/**
 * Tính toán Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

/**
 * Tính toán Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[0]);
    } else {
      ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }
  }
  
  return ema;
}

/**
 * Tính toán RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      rsi.push(NaN);
    } else {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return [NaN, ...rsi]; // Add NaN at beginning to match prices length
}

/**
 * Tính toán MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);
  const histogram = macdLine.slice(slowPeriod - 1).map((macd, i) => 
    i < signalLine.length ? macd - signalLine[i] : NaN
  );
  
  // Pad with NaN to match original length
  const paddedSignalLine = new Array(slowPeriod - 1).fill(NaN).concat(signalLine);
  const paddedHistogram = new Array(slowPeriod - 1).fill(NaN).concat(histogram);
  
  return {
    macd: macdLine,
    signal: paddedSignalLine,
    histogram: paddedHistogram
  };
}

/**
 * Tính toán Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period: number = 20, deviation: number = 2) {
  const sma = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upperBand.push(NaN);
      lowerBand.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upperBand.push(mean + (stdDev * deviation));
      lowerBand.push(mean - (stdDev * deviation));
    }
  }
  
  return {
    middle: sma,
    upper: upperBand,
    lower: lowerBand
  };
}

/**
 * Tính toán Stochastic Oscillator
 */
export function calculateStochastic(
  highs: number[], 
  lows: number[], 
  closes: number[], 
  kPeriod: number = 14,
  dPeriod: number = 3
) {
  const k: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
    } else {
      const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
      const periodLows = lows.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...periodHighs);
      const lowestLow = Math.min(...periodLows);
      
      if (highestHigh === lowestLow) {
        k.push(50);
      } else {
        k.push(((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
      }
    }
  }
  
  const d = calculateSMA(k.filter(val => !isNaN(val)), dPeriod);
  const paddedD = new Array(k.length - d.length).fill(NaN).concat(d);
  
  return {
    k,
    d: paddedD
  };
}

/**
 * Tính toán Average True Range (ATR)
 */
export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const trueRanges: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  const atr = calculateSMA(trueRanges, period);
  return [NaN, ...atr]; // Add NaN at beginning to match original length
}

/**
 * Detect price patterns (support/resistance levels)
 */
export function findSupportResistance(prices: StockPrice[], lookback: number = 20): {
  support: number[];
  resistance: number[];
} {
  const support: number[] = [];
  const resistance: number[] = [];
  
  for (let i = lookback; i < prices.length - lookback; i++) {
    const currentLow = prices[i].low;
    const currentHigh = prices[i].high;
    
    // Check for support (local minimum)
    let isSupport = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && prices[j].low < currentLow) {
        isSupport = false;
        break;
      }
    }
    
    // Check for resistance (local maximum)
    let isResistance = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && prices[j].high > currentHigh) {
        isResistance = false;
        break;
      }
    }
    
    support.push(isSupport ? currentLow : NaN);
    resistance.push(isResistance ? currentHigh : NaN);
  }
  
  // Pad with NaN
  const paddedSupport = new Array(lookback).fill(NaN)
    .concat(support)
    .concat(new Array(lookback).fill(NaN));
  const paddedResistance = new Array(lookback).fill(NaN)
    .concat(resistance)
    .concat(new Array(lookback).fill(NaN));
  
  return {
    support: paddedSupport,
    resistance: paddedResistance
  };
}

/**
 * Phát hiện divergence giữa giá và indicator
 */
export function detectDivergence(
  prices: number[],
  indicator: number[],
  lookback: number = 5
): {
  bullishDivergence: boolean[];
  bearishDivergence: boolean[];
} {
  const bullish: boolean[] = new Array(prices.length).fill(false);
  const bearish: boolean[] = new Array(prices.length).fill(false);
  
  for (let i = lookback * 2; i < prices.length; i++) {
    // Find recent peaks and troughs
    const recentPrices = prices.slice(i - lookback * 2, i);
    const recentIndicator = indicator.slice(i - lookback * 2, i);
    
    // Simplified divergence detection
    const priceChange = prices[i] - prices[i - lookback];
    const indicatorChange = indicator[i] - indicator[i - lookback];
    
    // Bullish divergence: price making lower lows, indicator making higher lows
    if (priceChange < 0 && indicatorChange > 0) {
      bullish[i] = true;
    }
    
    // Bearish divergence: price making higher highs, indicator making lower highs
    if (priceChange > 0 && indicatorChange < 0) {
      bearish[i] = true;
    }
  }
  
  return {
    bullishDivergence: bullish,
    bearishDivergence: bearish
  };
}
