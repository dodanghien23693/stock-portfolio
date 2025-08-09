import { NextRequest, NextResponse } from 'next/server';
import { STRATEGY_DETAILS } from '@/lib/strategy-details';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const strategy = STRATEGY_DETAILS[slug as keyof typeof STRATEGY_DETAILS];
    
    if (!strategy) {
      return NextResponse.json(
        { error: 'Không tìm thấy chiến lược' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Error fetching strategy details:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}
