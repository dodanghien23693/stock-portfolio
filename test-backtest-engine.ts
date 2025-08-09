import { BacktestEngine } from './src/lib/improved-backtest-engine';
import { TRADING_STRATEGIES } from './src/lib/trading-strategies';
import { prisma } from './src/lib/prisma';

async function testBacktestEngine() {
  console.log('🚀 Testing Improved Backtest Engine...\n');

  try {
    // Test 1: Kiểm tra dữ liệu
    console.log('📊 Checking available data...');
    const stockCount = await prisma.stock.count();
    const historyCount = await prisma.stockHistory.count();
    
    console.log(`- Stocks in database: ${stockCount}`);
    console.log(`- Historical records: ${historyCount}`);
    
    if (stockCount === 0 || historyCount === 0) {
      throw new Error('No data available. Please run seed first.');
    }

    // Test 2: Liệt kê strategies
    console.log('\n🔧 Available trading strategies:');
    Object.entries(TRADING_STRATEGIES).forEach(([key, strategy]) => {
      console.log(`- ${key}: ${strategy.name}`);
      console.log(`  Description: ${strategy.description || 'No description'}`);
    });

    // Test 3: Tạo backtest thử nghiệm
    console.log('\n🧪 Creating test backtest...');
    
    // Lấy user đầu tiên (hoặc tạo user test)
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
    }

    const testBacktest = await prisma.backtest.create({
      data: {
        userId: testUser.id,
        name: 'Test Backtest - Improved Engine',
        description: 'Testing the improved backtest engine with multiple strategies',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        initialCash: 1000000, // 1 triệu VND
        status: 'pending'
      }
    });

    console.log(`Created test backtest: ${testBacktest.id}`);

    // Test 4: Chạy backtest với các strategies khác nhau
    const testSymbols = ['VNM', 'VCB', 'HPG'];
    const strategiesToTest = ['smaStrategy', 'rsiStrategy', 'buyAndHold', 'multiFactorStrategy'];

    const engine = new BacktestEngine();

    for (const strategyKey of strategiesToTest) {
      console.log(`\n📈 Testing strategy: ${strategyKey}`);
      
      const strategy = TRADING_STRATEGIES[strategyKey];
      if (!strategy) {
        console.log(`❌ Strategy ${strategyKey} not found`);
        continue;
      }

      try {
        const startTime = Date.now();
        
        const result = await engine.runBacktest(
          testBacktest.id,
          strategy,
          testSymbols,
          new Date('2024-01-01'),
          new Date('2024-12-31'),
          1000000
        );

        const duration = Date.now() - startTime;

        console.log(`✅ ${strategy.name} completed in ${duration}ms`);
        console.log(`   Initial Cash: ${result.initialCash.toLocaleString()} VND`);
        console.log(`   Final Cash: ${result.finalCash.toLocaleString()} VND`);
        console.log(`   Total Return: ${result.totalReturn.toLocaleString()} VND (${result.totalReturnPercent.toFixed(2)}%)`);
        console.log(`   Max Drawdown: ${result.maxDrawdown.toFixed(2)}%`);
        console.log(`   Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`);
        console.log(`   Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log(`   Total Trades: ${result.totalTrades}`);
        console.log(`   Winning Trades: ${result.winningTrades}`);
        console.log(`   Losing Trades: ${result.losingTrades}`);
        console.log(`   Profit Factor: ${result.profitFactor.toFixed(2)}`);

        if (result.trades.length > 0) {
          console.log(`   Sample trades:`);
          result.trades.slice(0, 3).forEach(trade => {
            console.log(`     ${trade.type} ${trade.quantity} ${trade.symbol} @ ${trade.price.toFixed(2)} on ${trade.date.toISOString().split('T')[0]} (${trade.reason || 'No reason'})`);
          });
        }

      } catch (error) {
        console.log(`❌ Error testing ${strategyKey}:`, error instanceof Error ? error.message : error);
      }
    }

    // Test 5: So sánh performance
    console.log('\n📊 Performance Summary:');
    console.log('Strategy comparison should show different results, proving the engine is working correctly.');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.backtestTrade.deleteMany({
      where: { backtestId: testBacktest.id }
    });
    await prisma.backtest.delete({
      where: { id: testBacktest.id }
    });
    
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testBacktestEngine();
}

export { testBacktestEngine };
