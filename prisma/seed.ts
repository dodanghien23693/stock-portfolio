import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tạo dữ liệu mẫu cho cổ phiếu
  const stocks = [
    {
      symbol: 'VNM',
      name: 'Công ty Cổ phần Sữa Việt Nam',
      exchange: 'HOSE',
      sector: 'Thực phẩm & Đồ uống',
      industry: 'Sữa và sản phẩm sữa',
      marketCap: 150000000000,
      listedShares: 2500000000,
    },
    {
      symbol: 'VCB',
      name: 'Ngân hàng TMCP Ngoại thương Việt Nam',
      exchange: 'HOSE',
      sector: 'Ngân hàng',
      industry: 'Ngân hàng thương mại',
      marketCap: 800000000000,
      listedShares: 3600000000,
    },
    {
      symbol: 'HPG',
      name: 'Công ty Cổ phần Tập đoàn Hòa Phát',
      exchange: 'HOSE',
      sector: 'Vật liệu xây dựng',
      industry: 'Thép',
      marketCap: 200000000000,
      listedShares: 5000000000,
    },
    {
      symbol: 'VIC',
      name: 'Tập đoàn Vingroup',
      exchange: 'HOSE',
      sector: 'Bất động sản',
      industry: 'Phát triển bất động sản',
      marketCap: 300000000000,
      listedShares: 4500000000,
    },
    {
      symbol: 'GAS',
      name: 'Tổng Công ty Khí Việt Nam',
      exchange: 'HOSE',
      sector: 'Dầu khí',
      industry: 'Phân phối khí đốt',
      marketCap: 180000000000,
      listedShares: 1800000000,
    },
    {
      symbol: 'CTG',
      name: 'Ngân hàng TMCP Công Thương Việt Nam',
      exchange: 'HOSE',
      sector: 'Ngân hàng',
      industry: 'Ngân hàng thương mại',
      marketCap: 280000000000,
      listedShares: 15000000000,
    },
    {
      symbol: 'BID',
      name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
      exchange: 'HOSE',
      sector: 'Ngân hàng',
      industry: 'Ngân hàng thương mại',
      marketCap: 600000000000,
      listedShares: 12000000000,
    },
    {
      symbol: 'MSN',
      name: 'Công ty Cổ phần Tập đoàn Masan',
      exchange: 'HOSE',
      sector: 'Thực phẩm & Đồ uống',
      industry: 'Đa ngành',
      marketCap: 120000000000,
      listedShares: 2000000000,
    },
    {
      symbol: 'VRE',
      name: 'Công ty Cổ phần Vincom Retail',
      exchange: 'HOSE',
      sector: 'Bất động sản',
      industry: 'REIT',
      marketCap: 100000000000,
      listedShares: 3200000000,
    },
    {
      symbol: 'SAB',
      name: 'Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn',
      exchange: 'HOSE',
      sector: 'Thực phẩm & Đồ uống',
      industry: 'Bia và đồ uống có cồn',
      marketCap: 90000000000,
      listedShares: 800000000,
    },
  ]

  console.log('Creating stocks...')
  for (const stock of stocks) {
    const createdStock = await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: stock,
      create: stock,
    })
    console.log(`Created stock: ${createdStock.symbol}`)

    // Tạo dữ liệu giá mẫu cho 365 ngày gần đây để có đủ dữ liệu cho backtest
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 365)
    
    let currentPrice = Math.random() * 30 + 20 // Giá từ 20-50k (hợp lý hơn)
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0] // Format YYYY-MM-DD
      
      // Biến động giá thực tế hơn
      const weekday = date.getDay()
      const isWeekend = weekday === 0 || weekday === 6
      
      if (!isWeekend) { // Chỉ tạo dữ liệu cho ngày làm việc
        // Trend dài hạn nhẹ (±0.05% mỗi ngày)
        const longTermTrend = Math.sin(i / 100) * 0.0005 
        
        // Biến động ngẫu nhiên hàng ngày (±3%)
        const dailyVolatility = (Math.random() - 0.5) * 0.06
        
        // Một số ngày có volatility cao (5% khả năng)
        const highVolatility = Math.random() < 0.05 ? (Math.random() - 0.5) * 0.1 : 0
        
        // Áp dụng thay đổi giá
        const totalChange = longTermTrend + dailyVolatility + highVolatility
        currentPrice = currentPrice * (1 + totalChange)
        
        // Đảm bảo giá không âm và hợp lý
        currentPrice = Math.max(5, Math.min(200, currentPrice))
        
        const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02)
        const close = currentPrice
        const high = Math.max(open, close) * (1 + Math.random() * 0.02)
        const low = Math.min(open, close) * (1 - Math.random() * 0.02)
        const volume = Math.floor(Math.random() * 5000000) + 500000 // 500k - 5.5M shares
        const value = close * volume
        
        await prisma.stockHistory.upsert({
          where: {
            symbol_date: {
              symbol: stock.symbol,
              date: dateString,
            },
          },
          update: {
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: volume,
            value: Number(value.toFixed(2)),
          },
          create: {
            symbol: stock.symbol,
            date: dateString,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: volume,
            value: Number(value.toFixed(2)),
          },
        })
      }
    }
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
