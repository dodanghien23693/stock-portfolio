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
  'Cơ bản': ['smaStrategy', 'buyAndHold', 'tripleMA'],
  'Động lượng': ['rsiStrategy', 'macdStrategy', 'momentumContinuation'],
  'Hồi quy trung bình': ['bollingerBands', 'contrarian'],
  'Đột phá': ['breakoutStrategy', 'volatilityBreakout'],
  'Đa yếu tố': ['multiFactorStrategy'],
  'Giá trị': ['defensiveValue']
} as const;

export const STRATEGY_DESCRIPTIONS = {
  smaStrategy: 'Chiến lược cắt đường trung bình động đơn giản để bắt xu hướng',
  buyAndHold: 'Chiến lược mua và nắm giữ dài hạn cho đầu tư bền vững',
  rsiStrategy: 'Chiến lược RSI dựa trên vùng quá mua/quá bán',
  macdStrategy: 'Chiến lược MACD với tín hiệu cắt đường tín hiệu',
  tripleMA: 'Chiến lược ba đường trung bình để xác nhận xu hướng mạnh',
  momentumContinuation: 'Theo đuổi xu hướng mạnh với xác nhận khối lượng',
  bollingerBands: 'Chiến lược Bollinger Bands dựa trên hồi quy trung bình',
  contrarian: 'Mua khi quá bán gần hỗ trợ, bán khi quá mua gần kháng cự',
  breakoutStrategy: 'Chiến lược đột phá giá qua vùng kháng cự/hỗ trợ',
  volatilityBreakout: 'Đột phá với khối lượng cao qua dải Bollinger trên',
  multiFactorStrategy: 'Chiến lược nâng cao kết hợp nhiều chỉ báo kỹ thuật',
  defensiveValue: 'Mua bảo thủ khi giá yếu với khối lượng tích lũy thấp'
} as const;
