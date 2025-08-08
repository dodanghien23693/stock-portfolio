#!/bin/bash

echo "🚀 Testing Stock Portfolio System..."
echo "=================================="

# Test database connection
echo "1. Testing database connection..."
curl -s http://localhost:3000/api/test | jq '.'

echo -e "\n2. Testing stocks API..."
curl -s http://localhost:3000/api/stocks | jq '. | length'

echo -e "\n3. Creating sample data if needed..."
curl -s -X POST http://localhost:3000/api/stocks/sample | jq '.'

echo -e "\n4. Testing stocks after sample data..."
curl -s http://localhost:3000/api/stocks | jq '. | length'

echo -e "\n5. Testing individual stock data..."
curl -s "http://localhost:3000/api/stocks/VCB/data?period=1M" | jq '.stock.symbol'

echo -e "\n6. Testing Python service health..."
curl -s http://localhost:3000/api/python-service | jq '.'

echo -e "\n✅ System test completed!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Python Service: http://localhost:8001"
echo "📊 Stocks page: http://localhost:3000/stocks"
echo "⚙️  Python Service page: http://localhost:3000/python-service"
