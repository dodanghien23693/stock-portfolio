// Export types
export * from './types';

// Export indicators
export * from './indicators/technical-indicators';

// Export utilities
export * from './utils/trading-utils';

// Export individual strategies
export { smaStrategy } from './sma-strategy';
export { rsiStrategy, macdStrategy } from './momentum-strategies';
export { bollingerBandsStrategy, buyAndHoldStrategy } from './mean-reversion-strategies';
export { tripleMAStrategy, breakoutStrategy, multiFactorStrategy } from './advanced-strategies';
export { 
  volatilityBreakoutStrategy, 
  contrarianStrategy, 
  momentumContinuationStrategy, 
  defensiveValueStrategy 
} from './specialized-strategies';

// Export all strategies as a collection
import { smaStrategy } from './sma-strategy';
import { rsiStrategy, macdStrategy } from './momentum-strategies';
import { bollingerBandsStrategy, buyAndHoldStrategy } from './mean-reversion-strategies';
import { tripleMAStrategy, breakoutStrategy, multiFactorStrategy } from './advanced-strategies';
import { 
  volatilityBreakoutStrategy, 
  contrarianStrategy, 
  momentumContinuationStrategy, 
  defensiveValueStrategy 
} from './specialized-strategies';
import { TradingStrategy } from './types';

export const TRADING_STRATEGIES: { [key: string]: TradingStrategy } = {
  // Basic Strategies
  smaStrategy: smaStrategy,
  buyAndHold: buyAndHoldStrategy,
  
  // Momentum Strategies
  rsiStrategy: rsiStrategy,
  macdStrategy: macdStrategy,
  tripleMA: tripleMAStrategy,
  momentumContinuation: momentumContinuationStrategy,
  
  // Mean Reversion Strategies
  bollingerBands: bollingerBandsStrategy,
  contrarian: contrarianStrategy,
  
  // Breakout Strategies
  breakoutStrategy: breakoutStrategy,
  volatilityBreakout: volatilityBreakoutStrategy,
  
  // Advanced Strategies
  multiFactorStrategy: multiFactorStrategy,
  
  // Conservative Strategies
  defensiveValue: defensiveValueStrategy,
};

export const STRATEGY_CATEGORIES = {
  'Basic': ['smaStrategy', 'buyAndHold'],
  'Momentum': ['rsiStrategy', 'macdStrategy', 'tripleMA', 'momentumContinuation'],
  'Mean Reversion': ['bollingerBands', 'contrarian'],
  'Breakout': ['breakoutStrategy', 'volatilityBreakout'],
  'Advanced': ['multiFactorStrategy'],
  'Conservative': ['defensiveValue']
} as const;

export const STRATEGY_DESCRIPTIONS = {
  smaStrategy: 'Simple Moving Average crossover strategy for trend following',
  buyAndHold: 'Simple buy and hold strategy for long-term investing',
  rsiStrategy: 'RSI mean reversion strategy for oversold/overbought conditions',
  macdStrategy: 'MACD momentum strategy with signal line crossovers',
  tripleMA: 'Triple moving average strategy with enhanced trend confirmation',
  momentumContinuation: 'Follow strong momentum trends with volume confirmation',
  bollingerBands: 'Bollinger Bands mean reversion strategy',
  contrarian: 'Buy oversold near support, sell overbought near resistance',
  breakoutStrategy: 'Price breakout strategy above resistance/below support',
  volatilityBreakout: 'High volume breakouts above Bollinger upper band',
  multiFactorStrategy: 'Advanced strategy combining multiple technical indicators',
  defensiveValue: 'Conservative buying on price weakness with low volume accumulation'
} as const;
