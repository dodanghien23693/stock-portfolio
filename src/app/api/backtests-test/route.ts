import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple test without authentication
    return NextResponse.json({ 
      message: "Backtests API is working",
      timestamp: new Date().toISOString(),
      backtests: []
    })
  } catch (error) {
    console.error('Error in backtests test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backtests', details: String(error) },
      { status: 500 }
    )
  }
}
