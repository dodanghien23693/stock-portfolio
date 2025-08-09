import { prisma } from './src/lib/prisma';

async function checkData() {
  console.log('📊 Checking stock data quality...\n');

  try {
    // Check date range
    const dateRange = await prisma.stockHistory.aggregate({
      _min: { date: true },
      _max: { date: true },
    });

    console.log('Date range:');
    console.log(`- From: ${dateRange._min.date}`);
    console.log(`- To: ${dateRange._max.date}\n`);

    // Check price ranges for each symbol
    const symbols = ['VNM', 'VCB', 'HPG'];
    
    for (const symbol of symbols) {
      const data = await prisma.stockHistory.findMany({
        where: { symbol },
        orderBy: { date: 'asc' },
        take: 10
      });

      if (data.length > 0) {
        console.log(`${symbol} - First 10 records:`);
        data.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.date}: Close=${record.close.toFixed(2)}, Volume=${record.volume}`);
        });

        const priceStats = await prisma.stockHistory.aggregate({
          where: { symbol },
          _min: { close: true },
          _max: { close: true },
          _avg: { close: true }
        });

        console.log(`  Price stats: Min=${priceStats._min.close?.toFixed(2)}, Max=${priceStats._max.close?.toFixed(2)}, Avg=${priceStats._avg.close?.toFixed(2)}`);
        console.log('');
      }
    }

    // Check price changes
    console.log('📈 Analyzing price movements...\n');
    for (const symbol of symbols) {
      const prices = await prisma.stockHistory.findMany({
        where: { symbol },
        orderBy: { date: 'asc' },
        select: { date: true, close: true }
      });

      if (prices.length > 1) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
          const dailyReturn = (prices[i].close - prices[i-1].close) / prices[i-1].close;
          returns.push(dailyReturn);
        }

        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const maxReturn = Math.max(...returns);
        const minReturn = Math.min(...returns);

        console.log(`${symbol} daily returns:`);
        console.log(`  Average: ${(avgReturn * 100).toFixed(2)}%`);
        console.log(`  Max: ${(maxReturn * 100).toFixed(2)}%`);
        console.log(`  Min: ${(minReturn * 100).toFixed(2)}%`);
        console.log(`  Total records: ${prices.length}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
