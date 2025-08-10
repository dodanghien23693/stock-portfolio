import { NextRequest, NextResponse } from 'next/server'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const symbols = searchParams.get('symbols')
    const sentiment = searchParams.get('sentiment')
    const limit = searchParams.get('limit') || '20'
    const page = searchParams.get('page') || '1'

    // Build query string for Python service
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (symbols) params.append('symbols', symbols)
    if (sentiment) params.append('sentiment', sentiment)
    params.append('limit', limit)
    params.append('page', page)

    const queryString = params.toString()
    const url = `${PYTHON_SERVICE_URL}/news${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
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
    console.error('Error fetching news:', error)
    
    // Return mock data for development
    const mockResponse = {
      articles: [
        {
          id: '1',
          title: 'VN-Index tăng mạnh phiên cuối tuần',
          summary: 'Thị trường chứng khoán Việt Nam đóng cửa tích cực với VN-Index tăng 1.2% lên 1,265 điểm.',
          url: 'https://example.com/news/1',
          source: 'CafeF',
          publishDate: new Date().toISOString(),
          category: 'market',
          relatedSymbols: ['VCB', 'VNM', 'HPG'],
          sentiment: 'positive',
          impactScore: 75,
          tags: ['thị trường', 'vn-index']
        },
        {
          id: '2',
          title: 'Ngân hàng VCB công bố kết quả kinh doanh quý 3',
          summary: 'VCB báo lãi trước thuế 7,800 tỷ đồng trong quý 3, tăng 15% so với cùng kỳ.',
          url: 'https://example.com/news/2',
          source: 'VNStock',
          publishDate: new Date(Date.now() - 3600000).toISOString(),
          category: 'stocks',
          relatedSymbols: ['VCB'],
          sentiment: 'positive',
          impactScore: 85,
          tags: ['vcb', 'ngân hàng', 'kết quả kinh doanh']
        }
      ],
      total: 2,
      page: 1,
      perPage: 20
    }

    return NextResponse.json(mockResponse)
  }
}
