import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sampleStocks = [
  {
    symbol: "VCB",
    name: "Ngân hàng Ngoại thương Việt Nam",
    exchange: "HOSE",
    sector: "Ngân hàng",
    industry: "Dịch vụ tài chính",
    currentPrice: 67500,
    changePercent: 2.5,
    volume: 1234567
  },
  {
    symbol: "VNM", 
    name: "Công ty Cổ phần Sữa Việt Nam",
    exchange: "HOSE",
    sector: "Thực phẩm & Đồ uống",
    industry: "Sản xuất thực phẩm",
    currentPrice: 58200,
    changePercent: -1.2,
    volume: 987654
  },
  {
    symbol: "HPG",
    name: "Tập đoàn Hòa Phát",
    exchange: "HOSE", 
    sector: "Vật liệu xây dựng",
    industry: "Thép",
    currentPrice: 19150,
    changePercent: 3.1,
    volume: 2345678
  },
  {
    symbol: "VHM",
    name: "Vinhomes",
    exchange: "HOSE",
    sector: "Bất động sản",
    industry: "Phát triển BĐS",
    currentPrice: 45800,
    changePercent: 0.8,
    volume: 1567890
  },
  {
    symbol: "TCB",
    name: "Ngân hàng Kỹ thương Việt Nam",
    exchange: "HOSE",
    sector: "Ngân hàng", 
    industry: "Dịch vụ tài chính",
    currentPrice: 23400,
    changePercent: 1.7,
    volume: 3456789
  }
];

export async function POST() {
  try {
    // Check if stocks already exist
    const existingCount = await prisma.stock.count();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: "Sample data already exists",
        count: existingCount 
      });
    }

    // Create sample stocks
    const createdStocks = await Promise.all(
      sampleStocks.map(stock => 
        prisma.stock.create({
          data: stock
        })
      )
    );

    return NextResponse.json({ 
      message: "Sample data created successfully",
      count: createdStocks.length,
      stocks: createdStocks.map(s => ({ symbol: s.symbol, name: s.name }))
    });

  } catch (error) {
    console.error("Error creating sample data:", error);
    return NextResponse.json(
      { error: "Failed to create sample data" },
      { status: 500 }
    );
  }
}
