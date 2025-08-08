# 🧪 Python Service API Testing Guide

## 📖 Tổng quan

Trang test API Python Service giúp bạn kiểm tra và debug các endpoint của vnstock service một cách trực quan và dễ dàng.

## 🌐 Truy cập trang test

### Web Interface:
- **URL**: http://localhost:3000/python-service/test
- **Yêu cầu**: Next.js dev server đang chạy

### Command Line:
```bash
# Windows
test-python-api.bat [SYMBOL] [PERIOD] [--include-post]

# Linux/Mac  
./test-python-api.sh [SYMBOL] [PERIOD] [--include-post]

# Node.js directly
node test-python-api.js VCB 1Y --include-post
```

## 🎯 Tính năng chính

### 1. **Service Configuration**
- ⚙️ Thiết lập URL của Python service (mặc định: http://localhost:8001)
- 📊 Chọn mã cổ phiếu để test (mặc định: VCB)
- ⏱️ Chọn period cho historical data (1M, 3M, 6M, 1Y, 2Y, 5Y)

### 2. **Automated Tests**
Tự động test tất cả endpoints chính:
- ✅ Health Check (`/health`)
- 💰 Stock Price (`/stocks/{symbol}/price`)
- ℹ️ Stock Info (`/stocks/{symbol}/info`)
- 📈 Stock History (`/stocks/{symbol}/history?period=1Y`)
- 📊 Market Indices (`/market/indices`)
- 🔍 Search Stocks (`/stocks/search?q={symbol}`)
- 🔄 Sync Operations (`/sync/stocks`, `/sync/tracked-stocks`)

### 3. **Custom Tests**
- 🛠️ Test bất kỳ endpoint nào với method tùy chọn (GET, POST, PUT, DELETE)
- 📝 Gửi custom JSON body cho POST requests
- ⚡ Real-time response hiển thị

### 4. **Detailed Results**
- 🎯 Status codes và success/failure indicators
- ⏱️ Response times cho mỗi request
- 📄 Full response data với JSON formatting
- 📊 Test summary với statistics

## 🚀 Hướng dẫn sử dụng

### Bước 1: Khởi động services
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Python service
cd python-service
python main.py
```

### Bước 2: Mở trang test
- Truy cập: http://localhost:3000/python-service/test

### Bước 3: Kiểm tra cấu hình
- Đảm bảo Service URL đúng (http://localhost:8001)
- Chọn mã cổ phiếu muốn test
- Chọn period phù hợp

### Bước 4: Chạy tests
- **Quick Health Check**: Test nhanh xem service có hoạt động không
- **Run All Tests**: Chạy toàn bộ automated tests
- **Custom Test**: Test specific endpoint với parameters tùy chọn

## 🧪 Test Cases chi tiết

### GET Endpoints:
```
✅ /health                           → Service status
💰 /stocks/VCB/price                → Current price data  
ℹ️ /stocks/VCB/info                 → Company information
📈 /stocks/VCB/history?period=1Y    → Historical data
📊 /market/indices                  → Market indices (VN-Index, HNX-Index)
🔍 /stocks/search?q=VCB             → Search stocks by symbol/name
📋 /stocks/tracked                  → List tracked stocks
```

### POST Endpoints:
```
🔄 /sync/stocks                     → Sync specific stocks to database
     Body: {"symbols": ["VCB"], "period": "1Y"}
     
🔄 /sync/tracked-stocks             → Sync all tracked stocks  
     Body: {}
```

## 📊 Đọc kết quả test

### Status Badges:
- 🟢 **✓ 200**: Thành công
- 🔴 **✗ 404**: Endpoint không tồn tại  
- 🔴 **✗ 500**: Lỗi server
- ⚫ **✗ Error**: Không kết nối được

### Response Analysis:
- **Duration**: Thời gian response (ms)
- **Data**: Full JSON response
- **Error**: Chi tiết lỗi nếu có

### Test Summary:
- **Passed**: Số tests thành công
- **Failed**: Số tests thất bại  
- **Total**: Tổng số tests
- **Avg. Time**: Thời gian trung bình

## 🔧 Troubleshooting

### ❌ Service Unreachable
```
Lỗi: "Connection failed" hoặc "unreachable"
Giải pháp:
1. Kiểm tra Python service có chạy không: http://localhost:8001/health
2. Khởi động service: cd python-service && python main.py
3. Kiểm tra port 8001 có bị block không
```

### ❌ Tests Failed (4xx/5xx)
```
Lỗi: HTTP 404, 500, etc.
Giải pháp:  
1. Kiểm tra logs trong Python service
2. Verify mã cổ phiếu có tồn tại không (VCB, VNM, HPG...)
3. Check database connection trong Python service
```

### ❌ Slow Response Times
```
Lỗi: Response > 5000ms
Giải pháp:
1. vnstock API có thể chậm → bình thường
2. Kiểm tra internet connection
3. Thử với period ngắn hơn (1M thay vì 1Y)
```

## 💡 Tips & Best Practices

### 📋 Workflow đề xuất:
1. **Health Check** → Đảm bảo service hoạt động
2. **Stock Price** → Test endpoint đơn giản nhất
3. **Stock Info** → Verify mã cổ phiếu valid
4. **History Data** → Test với periods khác nhau
5. **Sync Operations** → Test database integration

### 🎯 Debugging hiệu quả:
- Bắt đầu với Quick Health Check
- Test từng endpoint riêng lẻ trước khi run all
- Kiểm tra response data để hiểu cấu trúc
- Sử dụng Custom Test cho debugging specific issues

### ⚡ Performance tips:
- History data với period dài sẽ chậm hơn
- Sync operations có thể mất vài phút
- Market indices thường nhanh nhất

## 🔗 Related URLs

- 🏠 **Main App**: http://localhost:3000
- 📊 **Stocks Page**: http://localhost:3000/stocks
- ⚙️ **Python Service UI**: http://localhost:3000/python-service
- 🧪 **API Tester**: http://localhost:3000/python-service/test
- 🐍 **Direct Python API**: http://localhost:8001

Trang test này giúp bạn debug và validate Python service một cách comprehensive! 🎉
