'use client'

import { TestTube2 } from 'lucide-react'

export default function BacktestPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <TestTube2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Backtest Engine
        </h1>
        <p className="text-gray-600 mb-4">
          Hệ thống backtest chiến lược trading đang được phát triển
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Tính năng sẽ bao gồm:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Tạo chiến lược trading tự động</li>
            <li>• Backtest với dữ liệu lịch sử</li>
            <li>• Báo cáo hiệu suất chi tiết</li>
            <li>• Tính toán rủi ro và tỷ suất sinh lời</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
