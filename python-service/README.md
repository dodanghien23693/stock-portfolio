# VNStock Python Service

Dịch vụ Python sử dụng thư viện vnstock để truy cập dữ liệu thị trường chứng khoán Việt Nam.

## Cấu trúc thư mục

```
python-service/
├── app/                     # Core application logic
│   ├── __init__.py
│   ├── main.py             # FastAPI app
│   ├── config.py           # Configuration
│   ├── models.py           # Data models
│   ├── api/                # API routes
│   │   ├── __init__.py
│   │   └── routes.py       # All routes
│   ├── services/           # Business logic
│   │   ├── __init__.py
│   │   ├── vnstock_service.py
│   │   └── database.py
│   └── utils/              # Utility functions
│       └── __init__.py
├── tests/                  # All test files
│   ├── __init__.py
│   ├── test_api.py         # API unit tests
│   ├── test_database.py    # Database unit tests
│   ├── test_vnstock.py     # VNStock service tests
│   ├── integration/        # Integration tests
│   │   ├── __init__.py
│   │   ├── test_api_integration.py
│   │   └── test_database_integration.py
│   └── scripts/            # Test scripts
│       ├── advanced_test.py
│       ├── quick_test.py
│       ├── simple_test.py
│       └── run_all_tests.py
├── .env
├── .env.example
├── requirements.txt
├── README.md
└── run.py                  # Entry point
```

## Cài đặt

1. Tạo virtual environment:
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Tạo file `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/stock_portfolio
API_HOST=0.0.0.0
API_PORT=8001
SYNC_INTERVAL_MINUTES=15
```

## Chạy service

```bash
python run.py
```

Hoặc với uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Chạy tests

### Unit tests
```bash
pytest tests/test_*.py -v
```

### Integration tests
```bash
pytest tests/integration/ -v -m integration
```

### Tất cả tests
```bash
pytest tests/ -v
```

### Test scripts (legacy)
```bash
# Quick test
python tests/scripts/quick_test.py

# Advanced test
python tests/scripts/advanced_test.py

# Run all legacy tests
python tests/scripts/run_all_tests.py
```

## API Endpoints

### Stock Data
- `GET /stocks/{symbol}/price` - Lấy giá hiện tại
- `GET /stocks/{symbol}/info` - Thông tin công ty
- `GET /stocks/{symbol}/history?period=1Y` - Dữ liệu lịch sử
- `GET /stocks/search?q=VCB&limit=10` - Tìm kiếm cổ phiếu

### Market Data
- `GET /market/indices` - Chỉ số thị trường

### Sync Operations
- `POST /sync/stocks` - Đồng bộ danh sách cổ phiếu
- `POST /sync/tracked-stocks` - Đồng bộ cổ phiếu trong portfolio

### Health Check
- `GET /` - Thông tin service
- `GET /health` - Kiểm tra sức khỏe

## Ví dụ sử dụng

```python
import requests

# Lấy giá VCB
response = requests.get("http://localhost:8001/stocks/VCB/price")
data = response.json()

# Đồng bộ dữ liệu
sync_data = {
    "symbols": ["VCB", "VIC", "FPT"],
    "period": "1Y"
}
response = requests.post("http://localhost:8001/sync/stocks", json=sync_data)
```

## Features

- ✅ Truy cập dữ liệu real-time từ vnstock
- ✅ Đồng bộ tự động vào PostgreSQL
- ✅ RESTful API
- ✅ Background tasks
- ✅ Error handling & logging
- ✅ CORS support
- ✅ Tìm kiếm cổ phiếu
- ✅ Chỉ số thị trường

## Database Schema

Service này sẽ cập nhật các bảng sau trong PostgreSQL:
- `Stock` - Thông tin cơ bản và giá hiện tại
- `StockHistory` - Dữ liệu lịch sử
- `PortfolioStock` - Liên kết với portfolio (đọc only)
