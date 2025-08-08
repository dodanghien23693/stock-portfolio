'use client'

import { Construction } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Construction className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Trang Portfolio
        </h1>
        <p className="text-gray-600 mb-4">
          Tính năng quản lý portfolio đang được phát triển
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Tính năng sẽ bao gồm:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Tạo và quản lý danh mục đầu tư</li>
            <li>• Theo dõi P&L realtime</li>
            <li>• Phân tích hiệu suất portfolio</li>
            <li>• Báo cáo chi tiết</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
