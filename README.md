# Vietnam Stock Analysis Platform

Một nền tảng phân tích chứng khoán Việt Nam với khả năng backtest chiến lược trading.

## Tính năng chính

- 📊 **Hiển thị biểu đồ**: Xem biểu đồ giá cổ phiếu với các chỉ báo kỹ thuật
- 📰 **Tin tức & Sự kiện**: Theo dõi tin tức và các sự kiện quan trọng
- 💼 **Quản lý Portfolio**: Tạo và quản lý danh mục đầu tư
- 🔬 **Backtest**: Kiểm thử các chiến lược trading với dữ liệu lịch sử
- 🔐 **Xác thực**: Đăng nhập bằng Google OAuth

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

## Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 14+
- npm hoặc yarn

## Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd stock-porfolio
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
Cập nhật các giá trị trong `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stockporfolio"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vietnam Stock API (placeholder)
VNDIRECT_API_KEY="your-vndirect-api-key"
SSI_API_KEY="your-ssi-api-key"
```

4. **Thiết lập database**
```bash
# Tạo database
createdb stockporfolio

# Chạy migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

5. **Chạy ứng dụng**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc dự án

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API routes
│   ├── stocks/            # Trang cổ phiếu
│   ├── portfolio/         # Trang portfolio
│   ├── backtest/          # Trang backtest
│   └── page.tsx           # Trang chủ
├── components/            # React components
├── lib/                   # Utilities và cấu hình
├── store/                 # Zustand stores
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations
```

## Database Schema

### Các bảng chính:

- **User**: Thông tin người dùng
- **Stock**: Thông tin cổ phiếu
- **StockData**: Dữ liệu giá lịch sử
- **Portfolio**: Danh mục đầu tư
- **Backtest**: Kết quả backtest
- **News**: Tin tức
- **Event**: Sự kiện

## Tính năng chính

### 1. Trang chủ (Dashboard)
- Tổng quan thị trường (VN-Index, HNX-Index, UPCOM-Index)
- Danh sách cổ phiếu giao dịch gần đây
- Thống kê tổng quan

### 2. Danh sách cổ phiếu
- Hiển thị dạng bảng với khả năng sắp xếp, lọc
- Tìm kiếm theo mã hoặc tên công ty
- Lọc theo sàn giao dịch

### 3. Chi tiết cổ phiếu
- Biểu đồ giá với các chỉ báo kỹ thuật
- Thông tin cơ bản công ty
- Tin tức và sự kiện liên quan

### 4. Portfolio Management
- Tạo và quản lý nhiều portfolio
- Theo dõi P&L realtime
- Phân tích hiệu suất

### 5. Backtest Engine
- Thiết lập chiến lược trading
- Backtest với dữ liệu lịch sử
- Báo cáo kết quả chi tiết (ROI, Sharpe ratio, Max Drawdown)

## Deployment

### Sử dụng Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License
