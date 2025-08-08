# Hướng dẫn tích hợp Python VNStock Service

## Tổng quan

Hệ thống đã được tích hợp với Python service sử dụng thư viện `vnstock` để truy cập dữ liệu chứng khoán Việt Nam real-time và đồng bộ về database PostgreSQL.

## Kiến trúc

```
├── Next.js Frontend (Port 3000)
│   ├── API Routes (/api/stocks/sync)
│   ├── VNStock API Client (src/lib/vnstock-api.ts)
│   └── Python Service Manager (/python-service)
│
├── Python VNStock Service (Port 8001)
│   ├── FastAPI + vnstock
│   ├── PostgreSQL Integration
│   └── Background Sync Tasks
│
└── PostgreSQL Database
    ├── Stock (current prices & info)
    └── StockHistory (historical data)
```

## Cài đặt và chạy

### 1. Cài đặt Python Service

#### Windows:
```bash
# Chạy script tự động
start-python-service.bat

# Hoặc thủ công
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Cập nhật DATABASE_URL trong .env
python main.py
```

#### Linux/Mac:
```bash
# Chạy script tự động
./start-python-service.sh

# Hoặc thủ công
cd python-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Cập nhật DATABASE_URL trong .env
python main.py
```

### 2. Cấu hình Database

Cập nhật file `python-service/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/stock-analysis
API_HOST=0.0.0.0
API_PORT=8001
```

### 3. Chạy Next.js

```bash
npm run dev
```

## Sử dụng

### 1. Kiểm tra trạng thái service

Truy cập: `http://localhost:3000/python-service`

### 2. Đồng bộ dữ liệu

#### Qua giao diện:
- Vào trang Python Service
- Nhập mã cổ phiếu (VD: VCB,VNM,HPG)
- Chọn period và nhấn "Sync"

#### Qua API:
```bash
# Đồng bộ cổ phiếu cụ thể
curl -X POST http://localhost:3000/api/stocks/sync \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["VCB", "VNM", "HPG"]}'

# Đồng bộ tất cả cổ phiếu trong portfolio
curl -X POST http://localhost:8001/sync/tracked-stocks
```

### 3. Truy cập dữ liệu

#### Python Service API:
```bash
# Giá hiện tại
GET http://localhost:8001/stocks/VCB/price

# Thông tin công ty
GET http://localhost:8001/stocks/VCB/info

# Dữ liệu lịch sử
GET http://localhost:8001/stocks/VCB/history?period=1Y

# Tìm kiếm cổ phiếu
GET http://localhost:8001/stocks/search?q=VCB&limit=10

# Chỉ số thị trường
GET http://localhost:8001/market/indices
```

#### Next.js API:
```javascript
import { vietnamStockAPI } from '@/lib/vnstock-api';

// Sử dụng trong component
const stockPrice = await vietnamStockAPI.getStockPrice('VCB');
const stockInfo = await vietnamStockAPI.getStockInfo('VCB');
const stockHistory = await vietnamStockAPI.getStockHistory('VCB', '1Y');
```

## Features

### ✅ Đã hoàn thành:
- Python FastAPI service với vnstock
- RESTful API endpoints
- Database sync (PostgreSQL)
- Next.js integration
- Admin interface
- Background sync tasks
- Error handling & fallback
- Real-time data access

### 🔄 Đang phát triển:
- Automated scheduling
- Performance monitoring
- Data validation
- Caching layer

## Troubleshooting

### Python Service không khởi động:
1. Kiểm tra Python version (3.8+)
2. Kiểm tra virtual environment
3. Kiểm tra dependencies trong requirements.txt
4. Kiểm tra DATABASE_URL trong .env

### Database connection error:
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra credentials trong .env
3. Kiểm tra database tồn tại
4. Chạy Prisma migration nếu cần

### Không thể đồng bộ dữ liệu:
1. Kiểm tra Python service health
2. Kiểm tra network connectivity
3. Kiểm tra vnstock API limits
4. Xem logs trong console

## API Documentation

Chi tiết API endpoints có thể xem tại:
- Python Service: `http://localhost:8001/docs` (Swagger UI)
- Health Check: `http://localhost:8001/health`

## Logs và Monitoring

Logs được hiển thị trong:
- Python service console
- Browser developer tools
- Next.js server logs

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request
