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

    // Tạo dữ liệu giá mẫu cho 30 ngày gần đây
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    let currentPrice = Math.random() * 100 + 20 // Giá từ 20-120k
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      // Biến động giá ngẫu nhiên
      const change = (Math.random() - 0.5) * 0.1 // ±5%
      currentPrice = currentPrice * (1 + change)
      
      const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02)
      const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.03)
      const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.03)
      const volume = Math.floor(Math.random() * 10000000) + 1000000
      const value = currentPrice * volume
      
      await prisma.stockData.upsert({
        where: {
          stockId_date: {
            stockId: createdStock.id,
            date: date,
          },
        },
        update: {
          open: open,
          high: high,
          low: low,
          close: currentPrice,
          volume: volume,
          value: value,
        },
        create: {
          stockId: createdStock.id,
          date: date,
          open: open,
          high: high,
          low: low,
          close: currentPrice,
          volume: volume,
          value: value,
        },
      })
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
