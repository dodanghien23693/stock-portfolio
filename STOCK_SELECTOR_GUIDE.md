# Stock Selector Component

## Mô tả
StockSelector là một component UI chuyên dụng để chọn mã cổ phiếu với các tính năng tìm kiếm, chọn đơn/đa lựa chọn và hiển thị thông tin chi tiết.

## Tính năng chính
- ✅ Tìm kiếm theo mã cổ phiếu và tên công ty
- ✅ Hỗ trợ chọn một hoặc nhiều mã cổ phiếu 
- ✅ Hiển thị thông tin giá và % thay đổi
- ✅ Debounced search (tìm kiếm với độ trễ 300ms)
- ✅ Loading state và skeleton
- ✅ Click outside để đóng dropdown
- ✅ Responsive design
- ✅ Badge hiển thị sàn giao dịch (HOSE, HNX, UPCOM)
- ✅ Dễ dàng remove các mã đã chọn

## Cách sử dụng

### Import
```tsx
import { StockSelector } from "@/components/ui/stock-selector-simple";
```

### Chọn một mã cổ phiếu (Single Select)
```tsx
const [selectedStock, setSelectedStock] = useState<string>("");

<StockSelector
  value={selectedStock}
  onValueChange={(value) => setSelectedStock(value as string)}
  placeholder="Chọn mã cổ phiếu..."
  multiple={false}
/>
```

### Chọn nhiều mã cổ phiếu (Multiple Select)
```tsx
const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

<StockSelector
  value={selectedStocks}
  onValueChange={(value) => setSelectedStocks(value as string[])}
  placeholder="Chọn các mã cổ phiếu..."
  multiple={true}
/>
```

## Props

| Prop | Type | Default | Required | Mô tả |
|------|------|---------|----------|-------|
| `value` | `string \| string[]` | - | ✅ | Giá trị được chọn |
| `onValueChange` | `(value: string \| string[]) => void` | - | ✅ | Callback khi giá trị thay đổi |
| `placeholder` | `string` | "Chọn mã cổ phiếu..." | ❌ | Text placeholder |
| `multiple` | `boolean` | `false` | ❌ | Cho phép chọn nhiều mã |
| `disabled` | `boolean` | `false` | ❌ | Vô hiệu hóa component |
| `className` | `string` | - | ❌ | CSS class tùy chỉnh |

## API Dependencies

Component này sử dụng API endpoint `/api/stocks` với các query parameters:
- `search`: Tìm kiếm theo mã hoặc tên
- `limit`: Giới hạn số kết quả (default: 100)

## Ví dụ sử dụng trong Portfolio

```tsx
// Trong form thêm cổ phiếu
<div className="space-y-2">
  <Label htmlFor="symbol">Mã cổ phiếu</Label>
  <StockSelector
    value={newStock.symbol}
    onValueChange={(value) =>
      setNewStock({
        ...newStock,
        symbol: Array.isArray(value) ? value[0] || "" : value,
      })
    }
    placeholder="VD: VNM, VCB, HPG..."
    multiple={false}
  />
</div>
```

## Styling
Component sử dụng Tailwind CSS và các component UI base:
- Button
- Input  
- Badge
- Skeleton

## Performance
- Debounced search với 300ms delay
- Giới hạn API calls 
- Lazy loading với skeleton states
- Click outside detection tối ưu

## Demo
Xem demo tại: `/stock-selector-demo`
