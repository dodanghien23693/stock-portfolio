import { TRADING_STRATEGIES } from './src/lib/trading-strategies';
import { BacktestEngine } from './src/lib/improved-backtest-engine';
import { prisma } from './src/lib/prisma';

async function testAllStrategies() {
  console.log('🚀 Testing All 12 Trading Strategies\n');
  
  const engine = new BacktestEngine();
  
  // Get sample data  
  const stocks = await prisma.stock.findMany({
    where: { 
      symbol: { in: ['VIC', 'VHM', 'VCB', 'GAS', 'MSN'] }
    },
    take: 5
  });
  
  // Get first user for temp backtest
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found. Please create a user first.');
    return;
  }
  
  const results: any[] = [];
  
  for (const [strategyName, strategy] of Object.entries(TRADING_STRATEGIES)) {
    console.log(`\n📊 Testing: ${strategy.name}`);
    console.log(`📝 Description: ${strategy.description}`);
    
    try {
      // Create temp backtest record
      const backtest = await prisma.backtest.create({
        data: {
          userId: user.id,
          name: `Test ${strategy.name}`,
          description: strategy.description,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          initialCash: 100000000,
          status: 'pending'
        }
      });
      
      const result = await engine.runBacktest(
        backtest.id,
        strategy,
        stocks.map(s => s.symbol),
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        100000000 // 100M VND
      );
      
      results.push({
        strategyName,
        strategyDisplayName: strategy.name,
        totalReturn: result.totalReturnPercent / 100,
        totalTrades: result.totalTrades,
        winRate: result.winRate,
        profitFactor: result.profitFactor,
        maxDrawdown: result.maxDrawdown
      });
      
      console.log(`📈 Total Return: ${result.totalReturnPercent.toFixed(2)}%`);
      console.log(`📊 Total Trades: ${result.totalTrades}`);
      console.log(`🎯 Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
      console.log(`💰 Profit Factor: ${result.profitFactor?.toFixed(2) || 'N/A'}`);
      console.log(`📉 Max Drawdown: ${((result.maxDrawdown || 0) * 100).toFixed(2)}%`);
      
      // Clean up temp record
      await prisma.backtestTrade.deleteMany({ where: { backtestId: backtest.id } });
      await prisma.backtest.delete({ where: { id: backtest.id } });
      
    } catch (error) {
      console.error(`❌ Error testing ${strategyName}:`, error);
      results.push({
        strategyName,
        strategyDisplayName: strategy.name,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Performance ranking
  console.log('\n🏆 STRATEGY PERFORMANCE RANKING\n');
  console.log('=' .repeat(80));
  
  const validResults = results.filter(r => !r.error && typeof r.totalReturn === 'number');
  const rankedResults = validResults.sort((a, b) => b.totalReturn - a.totalReturn);
  
  rankedResults.forEach((result, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    console.log(`${medal} ${result.strategyDisplayName}`);
    console.log(`   Return: ${(result.totalReturn * 100).toFixed(2)}% | Trades: ${result.totalTrades} | Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
    if (result.profitFactor) {
      console.log(`   Profit Factor: ${result.profitFactor.toFixed(2)} | Max DD: ${((result.maxDrawdown || 0) * 100).toFixed(2)}%`);
    }
    console.log('');
  });
  
  // Error summary
  const errorResults = results.filter(r => r.error);
  if (errorResults.length > 0) {
    console.log('\n❌ STRATEGIES WITH ERRORS\n');
    errorResults.forEach(result => {
      console.log(`${result.strategyDisplayName}: ${result.error}`);
    });
  }
  
  // Strategy categories performance
  console.log('\n📊 PERFORMANCE BY CATEGORY\n');
  const { STRATEGY_CATEGORIES } = await import('./src/lib/trading-strategies');
  
  for (const [category, strategyKeys] of Object.entries(STRATEGY_CATEGORIES)) {
    const categoryResults = validResults.filter((r: any) => (strategyKeys as readonly string[]).includes(r.strategyName));
    if (categoryResults.length > 0) {
      const avgReturn = categoryResults.reduce((sum: number, r: any) => sum + r.totalReturn, 0) / categoryResults.length;
      const avgWinRate = categoryResults.reduce((sum: number, r: any) => sum + r.winRate, 0) / categoryResults.length;
      
      console.log(`${category}:`);
      console.log(`  Average Return: ${(avgReturn * 100).toFixed(2)}%`);
      console.log(`  Average Win Rate: ${(avgWinRate * 100).toFixed(1)}%`);
      console.log(`  Strategies: ${categoryResults.length}`);
      console.log('');
    }
  }
  
  await prisma.$disconnect();
  console.log('✅ Strategy testing completed!');
}

// Run the test
testAllStrategies().catch(console.error);
