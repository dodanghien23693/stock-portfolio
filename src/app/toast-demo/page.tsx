"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { showToast } from "@/lib/toast"

export default function ToastDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Toast Component Demo</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Toast Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => showToast.success("Thao tác thành công!")}
              className="bg-green-500 hover:bg-green-600"
            >
              Success Toast
            </Button>
            
            <Button 
              onClick={() => showToast.error("Có lỗi xảy ra!")}
              variant="destructive"
            >
              Error Toast
            </Button>
            
            <Button 
              onClick={() => showToast.warning("Cảnh báo quan trọng!")}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Warning Toast
            </Button>
            
            <Button 
              onClick={() => showToast.info("Thông tin hữu ích")}
              variant="outline"
            >
              Info Toast
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Button 
              onClick={() => showToast.success("Dữ liệu portfolio đã được cập nhật thành công!", "Portfolio")}
              variant="outline"
            >
              Custom Title Success
            </Button>
            
            <Button 
              onClick={() => showToast.error("Không thể kết nối đến database", "Lỗi kết nối")}
              variant="outline"
            >
              Custom Title Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
