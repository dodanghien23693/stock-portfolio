// Test script for VietnamStockAPI integration
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing VietnamStockAPI integration...\n');

  try {
    // Test 1: Sync a popular Vietnamese stock
    console.log('1️⃣ Testing sync API with VNM (Vinamilk)...');
    const syncResponse = await fetch(`${BASE_URL}/stocks/sync?symbol=VNM`);
    const syncResult = await syncResponse.json();
    console.log('Sync result:', syncResult);
    console.log('');

    // Test 2: Get stock data with fresh API data
    console.log('2️⃣ Testing stock data API with refresh...');
    const dataResponse = await fetch(`${BASE_URL}/stocks/VNM/data?period=1M&refresh=true`);
    const dataResult = await dataResponse.json();
    console.log('Stock data result:');
    console.log('- Stock info:', dataResult.stock);
    console.log('- Data points:', dataResult.data?.length || 0);
    console.log('- Data source:', dataResult.dataSource);
    console.log('');

    // Test 3: Get all stocks with refresh
    console.log('3️⃣ Testing stocks list API with refresh...');
    const stocksResponse = await fetch(`${BASE_URL}/stocks?refresh=true`);
    const stocksResult = await stocksResponse.json();
    console.log('Stocks list result:');
    console.log('- Total stocks:', stocksResult.length);
    if (stocksResult.length > 0) {
      console.log('- First stock:', stocksResult[0]);
    }
    console.log('');

    // Test 4: Sync multiple popular stocks
    console.log('4️⃣ Testing batch sync of popular stocks...');
    const batchSyncResponse = await fetch(`${BASE_URL}/stocks/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: ['VCB', 'HPG', 'VHM', 'TCB']
      })
    });
    const batchSyncResult = await batchSyncResponse.json();
    console.log('Batch sync result:');
    console.log('- Results:', batchSyncResult.results);
    console.log('');

    console.log('✅ All API tests completed!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  }
}

// Run the test
testAPI();
