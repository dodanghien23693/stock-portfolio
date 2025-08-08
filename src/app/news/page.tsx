'use client'

import { Newspaper } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Tin tức chứng khoán
          </CardTitle>
          <CardDescription className="mb-4">
            Hệ thống tin tức và phân tích thị trường đang được phát triển
          </CardDescription>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Tính năng sẽ bao gồm:
              </h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Tin tức realtime từ các nguồn uy tín</li>
                <li>• Phân tích tác động đến giá cổ phiếu</li>
                <li>• Alerts cho tin tức quan trọng</li>
                <li>• Phân loại tin theo ngành và mã CK</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
