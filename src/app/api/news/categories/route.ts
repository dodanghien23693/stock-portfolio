import { NextResponse } from 'next/server'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/news/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Python service responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching news categories:', error)
    
    // Return mock categories for development
    const mockCategories = [
      { id: 'market', name: 'Thị trường', description: 'Tin tức thị trường chung' },
      { id: 'stocks', name: 'Cổ phiếu', description: 'Tin tức về cổ phiếu cụ thể' },
      { id: 'analysis', name: 'Phân tích', description: 'Phân tích kỹ thuật và cơ bản' },
      { id: 'economy', name: 'Kinh tế', description: 'Tin tức kinh tế vĩ mô' },
      { id: 'international', name: 'Quốc tế', description: 'Tin tức thị trường quốc tế' },
      { id: 'corporate', name: 'Doanh nghiệp', description: 'Tin tức doanh nghiệp' }
    ]

    return NextResponse.json(mockCategories)
  }
}
