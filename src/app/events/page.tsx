'use client'

import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Lịch sự kiện
          </CardTitle>
          <CardDescription className="mb-4">
            Hệ thống theo dõi các sự kiện quan trọng đang được phát triển
          </CardDescription>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2">
                Tính năng sẽ bao gồm:
              </h3>
              <ul className="text-sm text-purple-700 space-y-1 text-left">
                <li>• Lịch báo cáo kết quả kinh doanh</li>
                <li>• Ngày chia cổ tức, cổ phiếu thưởng</li>
                <li>• Đại hội cổ đông</li>
                <li>• Các sự kiện quan trọng khác</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
