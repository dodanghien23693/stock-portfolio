# VietnamStockAPI Integration Guide

Dự án đã được tích hợp thành công với VietnamStockAPI để lấy dữ liệu cổ phiếu thật từ thị trường chứng khoán Việt Nam.

## 🚀 Các API đã cập nhật

### 1. Stock Data API - `/api/stocks/[symbol]/data`

**Mô tả:** Lấy dữ liệu lịch sử của một cổ phiếu cụ thể

**Parameters:**
- `symbol`: Mã cổ phiếu (VD: VNM, VCB, HPG)
- `period`: Khoảng thời gian (1D, 1W, 1M, 3M, 6M, 1Y, 5Y)
- `refresh`: true/false - Có tự động cập nhật từ API không

**Example:**
```
GET /api/stocks/VNM/data?period=1M&refresh=true
```

**Response:**
```json
{
  "stock": {
    "id": "...",
    "symbol": "VNM",
    "name": "Công ty Cổ phần Sữa Việt Nam",
    "exchange": "HOSE",
    "currentPrice": 52500,
    "change": 500,
    "changePercent": 0.96,
    "volume": 1234567
  },
  "data": [
    {
      "date": "2025-01-01",
      "open": 52000,
      "high": 53000,
      "low": 51500,
      "close": 52500,
      "volume": 1234567,
      "value": 64567890000
    }
  ],
  "dataSource": "api" // hoặc "cache"
}
```

### 2. Stocks List API - `/api/stocks`

**Mô tả:** Lấy danh sách tất cả cổ phiếu

**Parameters:**
- `refresh`: true/false - Có cập nhật giá từ API không

**Example:**
```
GET /api/stocks?refresh=true
```

### 3. Stock Sync API - `/api/stocks/sync`

**Mô tả:** Đồng bộ dữ liệu cổ phiếu từ VietnamStockAPI

#### GET Method - Sync đơn lẻ hoặc batch
```
GET /api/stocks/sync?symbol=VNM          // Sync 1 cổ phiếu
GET /api/stocks/sync?symbols=VNM,VCB,HPG // Sync nhiều cổ phiếu
GET /api/stocks/sync                      // Sync 10 cổ phiếu phổ biến
```

#### POST Method - Sync với dữ liệu tùy chỉnh
```json
POST /api/stocks/sync
{
  "symbol": "VNM",
  // Hoặc batch sync:
  "symbols": ["VNM", "VCB", "HPG"]
}
```

## 🔧 VietnamStockAPI Service

File `src/lib/vnstock-api.ts` chứa service tích hợp với nhiều nguồn API:

### Các API được sử dụng:
1. **VNStock API** - API chính thức của VietStock
2. **TCBS API** - API của Chứng khoán TCBS (backup)

### Các method có sẵn:
```typescript
// Lấy giá cổ phiếu hiện tại
await vietnamStockAPI.getStockPrice("VNM")

// Lấy thông tin công ty
await vietnamStockAPI.getStockInfo("VNM")

// Lấy dữ liệu lịch sử
await vietnamStockAPI.getStockHistory("VNM", "1Y")

// Lấy chỉ số thị trường
await vietnamStockAPI.getMarketIndices()

// Cập nhật dữ liệu vào database
await vietnamStockAPI.updateStockData("VNM")
```

## 🎯 Cách sử dụng

### 1. Test API
Truy cập: `http://localhost:3000/api-test`

### 2. Sync dữ liệu cổ phiếu mới
```bash
# Sync 1 cổ phiếu
curl "http://localhost:3000/api/stocks/sync?symbol=VNM"

# Sync nhiều cổ phiếu
curl "http://localhost:3000/api/stocks/sync?symbols=VNM,VCB,HPG,VHM,TCB"
```

### 3. Lấy dữ liệu với refresh
```bash
# Lấy dữ liệu VNM với refresh từ API
curl "http://localhost:3000/api/stocks/VNM/data?period=1M&refresh=true"

# Lấy danh sách cổ phiếu với refresh
curl "http://localhost:3000/api/stocks?refresh=true"
```

## 🗃️ Database Schema

Các field mới đã được thêm vào model `Stock`:
- `currentPrice`: Giá hiện tại
- `change`: Thay đổi giá (VND)
- `changePercent`: Thay đổi giá (%)
- `volume`: Khối lượng giao dịch
- `marketCap`: Vốn hóa thị trường
- `listedShares`: Số cổ phiếu niêm yết

## ⚡ Auto Caching

- Dữ liệu được cache trong database
- Cache expire sau 1 giờ cho dữ liệu realtime
- Sử dụng parameter `refresh=true` để force update
- Fallback sang cache nếu API fail

## 📊 Supported Stocks

API hỗ trợ tất cả cổ phiếu niêm yết trên các sàn:
- **HOSE** (Ho Chi Minh Stock Exchange)
- **HNX** (Hanoi Stock Exchange) 
- **UPCOM** (Unlisted Public Company Market)

Một số cổ phiếu phổ biến: VNM, VCB, HPG, VHM, TCB, BID, CTG, VIC, MSN, POW, etc.

## 🚨 Rate Limiting

Để tránh bị rate limit:
- Không sync quá 10 cổ phiếu cùng lúc
- Có delay giữa các request
- Sử dụng cache thay vì gọi API liên tục

## 🔍 Error Handling

- API tự động fallback giữa các data source
- Trả về error message chi tiết
- Log errors để debug
- Graceful degradation khi API fail
