"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleDialog } from "@/components/ui/compatible-dialog";
import { MUIStockSelector } from "@/components/ui/mui-stock-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MUIDemo() {
  const [showBasicDialog, setShowBasicDialog] = useState(false);
  const [showStockSelectorDialog, setShowStockSelectorDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>("");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">MUI Dialog Demo</h1>
        <p className="text-gray-600 mt-2">
          Thử nghiệm Dialog và StockSelector mới với Material-UI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Dialog Demo</CardTitle>
            <CardDescription>
              Dialog cơ bản sử dụng Material-UI với z-index được quản lý tự động
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowBasicDialog(true)}>
              Mở Dialog Cơ Bản
            </Button>
          </CardContent>
        </Card>

        {/* Stock Selector Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Selector Dialog Demo</CardTitle>
            <CardDescription>
              Dialog chứa StockSelector với MUI Autocomplete - không có conflict
              z-index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowStockSelectorDialog(true)}>
              Mở Dialog với StockSelector
            </Button>
            {selectedStock && (
              <p className="mt-2 text-sm text-gray-600">
                Mã CK đã chọn: <strong>{selectedStock}</strong>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overlapping Cards Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Test Z-Index với nhiều Card</h2>
        <p className="text-gray-600">
          Các Card này sẽ test xem Dialog có bị đè bởi elements khác không
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="relative">
              <CardHeader>
                <CardTitle>Test Card {i + 1}</CardTitle>
                <CardDescription>
                  Card này có thể có z-index cao
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore.
                </p>
                <Button
                  className="mt-2"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStockSelectorDialog(true)}
                >
                  Mở Dialog từ Card {i + 1}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Basic Dialog */}
      <SimpleDialog
        open={showBasicDialog}
        onClose={() => setShowBasicDialog(false)}
        title="Dialog Cơ Bản"
        description="Đây là một dialog cơ bản sử dụng Material-UI thay thế Radix UI"
        maxWidth="sm"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBasicDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => setShowBasicDialog(false)}>OK</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>Nội dung dialog ở đây. MUI Dialog sẽ tự động quản lý z-index.</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>✅ Z-index được quản lý tự động</li>
            <li>✅ Responsive design cho mobile</li>
            <li>✅ Transition animations mượt mà</li>
            <li>✅ Backdrop click để đóng</li>
            <li>✅ ESC key để đóng</li>
          </ul>
        </div>
      </SimpleDialog>

      {/* Stock Selector Dialog */}
      <SimpleDialog
        open={showStockSelectorDialog}
        onClose={() => setShowStockSelectorDialog(false)}
        title="Chọn Mã Cổ Phiếu"
        description="Dialog này chứa StockSelector với MUI Autocomplete - không có z-index conflicts"
        maxWidth="md"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStockSelectorDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setShowStockSelectorDialog(false);
                alert(`Đã chọn mã: ${selectedStock}`);
              }}
              disabled={!selectedStock}
            >
              Xác Nhận
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn mã cổ phiếu:
            </label>
            <MUIStockSelector
              value={selectedStock}
              onValueChange={(value) => {
                const stock = Array.isArray(value) ? value[0] || "" : value;
                setSelectedStock(stock);
              }}
              placeholder="Tìm mã cổ phiếu (VD: VNM, VCB, HPG...)"
              multiple={false}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              ✨ Đặc điểm của MUI StockSelector:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Z-index tự động cao hơn Dialog backdrop</li>
              <li>• Dropdown sẽ hiển thị chính xác trong Dialog</li>
              <li>• Không bị đè bởi các Card elements khác</li>
              <li>• Server-side search với debouncing</li>
              <li>• Hỗ trợ keyboard navigation</li>
            </ul>
          </div>
        </div>
      </SimpleDialog>
    </div>
  );
}
