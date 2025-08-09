# Toast Component Documentation

## Tổng quan

Toast component được xây dựng dựa trên Radix UI Toast primitives, cung cấp một hệ thống thông báo người dùng thân thiện và có thể tái sử dụng trong toàn bộ ứng dụng.

## Cài đặt

Toast component đã được tích hợp sẵn trong layout chính (`src/app/layout.tsx`), vì vậy bạn có thể sử dụng ngay mà không cần cài đặt thêm.

## Cách sử dụng

### Import

```typescript
import { showToast } from "@/lib/toast"
```

### Các loại Toast

#### 1. Toast Thành công (Success)
```typescript
showToast.success("Dữ liệu đã được lưu thành công!")
showToast.success("Portfolio đã được cập nhật", "Thành công") // Với tiêu đề tùy chỉnh
```

#### 2. Toast Lỗi (Error)
```typescript
showToast.error("Không thể kết nối đến server")
showToast.error("Vui lòng kiểm tra lại thông tin", "Lỗi xác thực") // Với tiêu đề tùy chỉnh
```

#### 3. Toast Cảnh báo (Warning)
```typescript
showToast.warning("Bạn chưa lưu thay đổi")
showToast.warning("Session sắp hết hạn", "Cảnh báo") // Với tiêu đề tùy chỉnh
```

#### 4. Toast Thông tin (Info)
```typescript
showToast.info("Dữ liệu đang được cập nhật...")
showToast.info("Phiên bản mới đã có sẵn", "Thông tin") // Với tiêu đề tùy chỉnh
```

### Ví dụ trong Try-Catch

```typescript
const syncData = async () => {
  try {
    const response = await fetch('/api/sync')
    const data = await response.json()
    
    if (response.ok) {
      showToast.success("Đồng bộ dữ liệu thành công!")
    } else {
      showToast.error(`Lỗi: ${data.message}`)
    }
  } catch (error) {
    showToast.error("Không thể kết nối đến server")
  }
}
```

### Ví dụ trong Form Submission

```typescript
const handleSubmit = async (formData: any) => {
  try {
    showToast.info("Đang xử lý...")
    
    const result = await submitForm(formData)
    
    if (result.success) {
      showToast.success("Form đã được gửi thành công!")
    } else {
      showToast.warning("Có một số trường chưa hợp lệ")
    }
  } catch (error) {
    showToast.error("Có lỗi xảy ra khi gửi form")
  }
}
```

## Tính năng

- **Auto-dismiss**: Toast tự động biến mất sau 5 giây
- **Manual close**: Người dùng có thể đóng toast bằng nút X
- **Multiple toasts**: Có thể hiển thị tối đa 5 toast cùng lúc
- **Responsive**: Tự động điều chỉnh vị trí trên mobile và desktop
- **Accessibility**: Hỗ trợ đầy đủ accessibility với ARIA labels
- **Animation**: Smooth animation khi hiển thị và ẩn

## Styling

Toast component sử dụng các variant sau:
- `success`: Màu xanh lá, dành cho thông báo thành công
- `destructive`: Màu đỏ, dành cho thông báo lỗi
- `warning`: Màu vàng, dành cho thông báo cảnh báo  
- `default`: Màu xanh dương, dành cho thông báo thông tin

## Files Structure

```
src/
  components/ui/
    toast.tsx        # Toast component primitives
    toaster.tsx      # Toaster container component
  hooks/
    use-toast.ts     # Toast hook logic
  lib/
    toast.ts         # Utility functions
  app/
    layout.tsx       # Toast provider integration
```

## Advanced Usage

### Sử dụng hook useToast trực tiếp

```typescript
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast } = useToast()

  const notify = () => {
    toast({
      title: "Tiêu đề tùy chỉnh",
      description: "Mô tả chi tiết",
      variant: "success",
    })
  }

  return <button onClick={notify}>Show Toast</button>
}
```

### Toast với Action Button

```typescript
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

function MyComponent() {
  const { toast } = useToast()

  const notifyWithAction = () => {
    toast({
      title: "Cập nhật có sẵn",
      description: "Phiên bản mới đã có sẵn",
      action: (
        <ToastAction altText="Cập nhật ngay">
          Cập nhật
        </ToastAction>
      ),
    })
  }

  return <button onClick={notifyWithAction}>Show Toast with Action</button>
}
```

## Migration từ Alert()

### Trước đây:
```typescript
alert("Sync started successfully!")
alert(`Sync failed: ${error}`)
```

### Bây giờ:
```typescript
showToast.success("Sync started successfully!")
showToast.error(`Sync failed: ${error}`)
```

## Lưu ý

1. Toast sẽ tự động biến mất sau 5 giây
2. Tối đa 5 toast có thể hiển thị cùng lúc
3. Toast mới sẽ đẩy toast cũ xuống dưới
4. Toast có thể được đóng thủ công bằng nút X
5. Trên mobile, toast sẽ hiển thị ở đầu màn hình thay vì góc phải
