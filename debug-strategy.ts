import { TRADING_STRATEGIES } from './src/lib/trading-strategies';
import { StockPrice } from './src/lib/trading-strategies/types';
import { prisma } from './src/lib/prisma';

async function debugStrategy() {
  console.log('🔍 Debugging SMA Strategy...\n');

  try {
    // Get sample data for VNM
    const vnmData = await prisma.stockHistory.findMany({
      where: { symbol: 'VNM' },
      orderBy: { date: 'asc' },
      take: 50
    });

    console.log(`📊 VNM sample data (${vnmData.length} records):`);
    console.log('Date       | Close  | SMA10 | SMA30 | Signal');
    console.log('-----------|--------|-------|-------|--------');

    const prices = vnmData.map(d => ({
      date: new Date(d.date),
      symbol: d.symbol,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }));

    // Calculate SMA manually to debug
    const closes = prices.map(p => p.close);
    const sma10: number[] = [];
    const sma30: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      // SMA 10
      if (i >= 9) {
        const sum10 = closes.slice(i - 9, i + 1).reduce((a, b) => a + b, 0);
        sma10[i] = sum10 / 10;
      } else {
        sma10[i] = NaN;
      }

      // SMA 30
      if (i >= 29) {
        const sum30 = closes.slice(i - 29, i + 1).reduce((a, b) => a + b, 0);
        sma30[i] = sum30 / 30;
      } else {
        sma30[i] = NaN;
      }

      // Show first few and last few records
      if (i < 5 || i >= closes.length - 5) {
        const signal = !isNaN(sma10[i]) && !isNaN(sma30[i]) ? 
          (sma10[i] > sma30[i] ? 'BUY' : 'SELL') : 'WAIT';
        
        console.log(
          `${prices[i].date.toISOString().split('T')[0]} | ${closes[i].toFixed(2).padStart(6)} | ${isNaN(sma10[i]) ? '  N/A' : sma10[i].toFixed(2).padStart(5)} | ${isNaN(sma30[i]) ? '  N/A' : sma30[i].toFixed(2).padStart(5)} | ${signal.padStart(4)}`
        );
      } else if (i === 5) {
        console.log('      ...       |   ...  |  ...  |  ...  |  ...');
      }
    }

    // Test strategy execution with sample data
    console.log('\n🧪 Testing strategy execution...');
    const strategy = TRADING_STRATEGIES.smaStrategy;
    
    // Simulate with just the last few days
    const lastFewPrices = prices.slice(-5);
    console.log(`\nUsing last ${lastFewPrices.length} prices for strategy test:`);
    lastFewPrices.forEach(p => {
      console.log(`${p.date.toISOString().split('T')[0]}: ${p.close}`);
    });

    const trades = strategy.execute(lastFewPrices, 1000000, []);
    console.log(`\nGenerated ${trades.length} trades:`);
    trades.forEach(trade => {
      console.log(`${trade.type} ${trade.quantity} ${trade.symbol} @ ${trade.price} (${trade.reason})`);
    });

    // Test with full data and historical context
    console.log('\n🔄 Testing with full historical context...');
    const historicalMap = new Map<string, StockPrice[]>();
    historicalMap.set('VNM', prices);
    
    const allTrades = strategy.execute([], 1000000, [], historicalMap);
    console.log(`Generated ${allTrades.length} trades with full data`);
    
    allTrades.forEach(trade => {
      console.log(`${trade.type} ${trade.quantity} ${trade.symbol} @ ${trade.price.toFixed(2)} on ${trade.date.toISOString().split('T')[0]} (${trade.reason})`);
    });

    // Look for crossover signals manually
    console.log('\n🔍 Looking for SMA crossover signals...');
    for (let i = 30; i < Math.min(50, closes.length - 1); i++) {
      const currentShort = sma10[i];
      const currentLong = sma30[i];
      const prevShort = sma10[i - 1];
      const prevLong = sma30[i - 1];
      
      if (!isNaN(currentShort) && !isNaN(currentLong) && !isNaN(prevShort) && !isNaN(prevLong)) {
        if (currentShort > currentLong && prevShort <= prevLong) {
          console.log(`📈 Golden Cross on ${prices[i].date.toISOString().split('T')[0]}: SMA10(${currentShort.toFixed(2)}) > SMA30(${currentLong.toFixed(2)})`);
        }
        if (currentShort < currentLong && prevShort >= prevLong) {
          console.log(`📉 Death Cross on ${prices[i].date.toISOString().split('T')[0]}: SMA10(${currentShort.toFixed(2)}) < SMA30(${currentLong.toFixed(2)})`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStrategy();
