@echo off
echo 🚀 Testing Stock Portfolio System...
echo ==================================

echo 1. Testing database connection...
curl -s http://localhost:3000/api/test

echo.
echo 2. Testing stocks API...
curl -s http://localhost:3000/api/stocks

echo.
echo 3. Creating sample data if needed...
curl -s -X POST http://localhost:3000/api/stocks/sample

echo.
echo 4. Testing stocks after sample data...
curl -s http://localhost:3000/api/stocks

echo.
echo 5. Testing individual stock data...
curl -s "http://localhost:3000/api/stocks/VCB/data?period=1M"

echo.
echo 6. Testing Python service health...
curl -s http://localhost:3000/api/python-service

echo.
echo ✅ System test completed!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Python Service: http://localhost:8001
echo 📊 Stocks page: http://localhost:3000/stocks
echo ⚙️  Python Service page: http://localhost:3000/python-service

pause
