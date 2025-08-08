#!/usr/bin/env node

const { execSync } = require('child_process');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
const STOCK_SYMBOL = process.argv[2] || 'VCB';
const PERIOD = process.argv[3] || '1Y';

console.log('🐍 Python Service API Tester');
console.log('================================');
console.log(`Service URL: ${PYTHON_SERVICE_URL}`);
console.log(`Test Symbol: ${STOCK_SYMBOL}`);
console.log(`Test Period: ${PERIOD}`);
console.log('');

const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `${PYTHON_SERVICE_URL}/health`
  },
  {
    name: 'Stock Price',
    method: 'GET', 
    url: `${PYTHON_SERVICE_URL}/stocks/${STOCK_SYMBOL}/price`
  },
  {
    name: 'Stock Info',
    method: 'GET',
    url: `${PYTHON_SERVICE_URL}/stocks/${STOCK_SYMBOL}/info`
  },
  {
    name: 'Stock History',
    method: 'GET',
    url: `${PYTHON_SERVICE_URL}/stocks/${STOCK_SYMBOL}/history?period=${PERIOD}`
  },
  {
    name: 'Market Indices',
    method: 'GET',
    url: `${PYTHON_SERVICE_URL}/market/indices`
  },
  {
    name: 'Search Stocks',
    method: 'GET',
    url: `${PYTHON_SERVICE_URL}/stocks/search?q=${STOCK_SYMBOL}`
  }
];

async function runTest(test) {
  const startTime = Date.now();
  
  try {
    console.log(`⏳ Testing: ${test.name}`);
    
    const curlCommand = `curl -s -w "HTTP_CODE:%{http_code}" -X ${test.method} "${test.url}"`;
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 10000 });
    
    const httpCodeMatch = result.match(/HTTP_CODE:(\d+)$/);
    const httpCode = httpCodeMatch ? parseInt(httpCodeMatch[1]) : 0;
    const responseBody = result.replace(/HTTP_CODE:\d+$/, '');
    
    const duration = Date.now() - startTime;
    
    if (httpCode >= 200 && httpCode < 300) {
      console.log(`✅ ${test.name}: ${httpCode} (${duration}ms)`);
      
      try {
        const json = JSON.parse(responseBody);
        if (typeof json === 'object' && json !== null) {
          if (Array.isArray(json)) {
            console.log(`   📊 Response: Array with ${json.length} items`);
          } else if (json.message) {
            console.log(`   📝 Message: ${json.message}`);
          } else {
            const keys = Object.keys(json);
            console.log(`   📋 Fields: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
          }
        }
      } catch (e) {
        console.log(`   📄 Response: ${responseBody.substring(0, 50)}${responseBody.length > 50 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ ${test.name}: ${httpCode} (${duration}ms)`);
      console.log(`   🚨 Error: ${responseBody.substring(0, 100)}`);
    }
    
    return { success: httpCode >= 200 && httpCode < 300, httpCode, duration };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`💥 ${test.name}: Connection failed (${duration}ms)`);
    console.log(`   🚨 Error: ${error.message}`);
    return { success: false, httpCode: 0, duration };
  }
}

async function runAllTests() {
  console.log('🚀 Starting tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('================');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = Math.round(results.reduce((acc, r) => acc + r.duration, 0) / results.length);
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  console.log(`⏱️  Avg Time: ${avgTime}ms`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Python service is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check if Python service is running on port 8001.');
    console.log('💡 Try: cd python-service && python main.py');
  }
}

// POST tests
async function runPostTests() {
  console.log('\n🔄 Testing POST endpoints...\n');
  
  const postTests = [
    {
      name: 'Sync Stocks',
      method: 'POST',
      url: `${PYTHON_SERVICE_URL}/sync/stocks`,
      data: JSON.stringify({ symbols: [STOCK_SYMBOL], period: PERIOD })
    },
    {
      name: 'Sync Tracked Stocks',
      method: 'POST', 
      url: `${PYTHON_SERVICE_URL}/sync/tracked-stocks`,
      data: '{}'
    }
  ];
  
  for (const test of postTests) {
    const startTime = Date.now();
    
    try {
      console.log(`⏳ Testing: ${test.name}`);
      
      const curlCommand = `curl -s -w "HTTP_CODE:%{http_code}" -X ${test.method} -H "Content-Type: application/json" -d '${test.data}' "${test.url}"`;
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 15000 });
      
      const httpCodeMatch = result.match(/HTTP_CODE:(\d+)$/);
      const httpCode = httpCodeMatch ? parseInt(httpCodeMatch[1]) : 0;
      const responseBody = result.replace(/HTTP_CODE:\d+$/, '');
      
      const duration = Date.now() - startTime;
      
      if (httpCode >= 200 && httpCode < 300) {
        console.log(`✅ ${test.name}: ${httpCode} (${duration}ms)`);
        console.log(`   📝 Response: ${responseBody.substring(0, 100)}${responseBody.length > 100 ? '...' : ''}`);
      } else {
        console.log(`❌ ${test.name}: ${httpCode} (${duration}ms)`);
        console.log(`   🚨 Error: ${responseBody.substring(0, 100)}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${test.name}: Connection failed (${duration}ms)`);
      console.log(`   🚨 Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Main execution
async function main() {
  await runAllTests();
  
  if (process.argv.includes('--include-post')) {
    await runPostTests();
  } else {
    console.log('\n💡 Use --include-post flag to test POST endpoints (sync operations)');
  }
  
  console.log('\n🔗 Web UI: http://localhost:3000/python-service/test');
}

main().catch(console.error);
