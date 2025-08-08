'use client'

import { Calendar } from 'lucide-react'

export default function EventsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lịch sự kiện
        </h1>
        <p className="text-gray-600 mb-4">
          Hệ thống theo dõi các sự kiện quan trọng đang được phát triển
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-sm font-medium text-purple-800 mb-2">
            Tính năng sẽ bao gồm:
          </h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Lịch báo cáo kết quả kinh doanh</li>
            <li>• Ngày chia cổ tức, cổ phiếu thưởng</li>
            <li>• Đại hội cổ đông</li>
            <li>• Các sự kiện quan trọng khác</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
