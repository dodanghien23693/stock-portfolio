'use client'

import { Newspaper } from 'lucide-react'

export default function NewsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tin tức chứng khoán
        </h1>
        <p className="text-gray-600 mb-4">
          Hệ thống tin tức và phân tích thị trường đang được phát triển
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Tính năng sẽ bao gồm:
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Tin tức realtime từ các nguồn uy tín</li>
            <li>• Phân tích tác động đến giá cổ phiếu</li>
            <li>• Alerts cho tin tức quan trọng</li>
            <li>• Phân loại tin theo ngành và mã CK</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
