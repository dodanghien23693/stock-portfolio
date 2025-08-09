// Cách sử dụng Toast component trong các file khác

import { showToast } from "@/lib/toast"

// 1. Toast thành công
const handleSuccess = () => {
  showToast.success("Dữ liệu đã được lưu thành công!")
  
  // Hoặc với tiêu đề tùy chỉnh
  showToast.success("Portfolio đã được cập nhật", "Thành công")
}

// 2. Toast lỗi
const handleError = () => {
  showToast.error("Không thể kết nối đến server")
  
  // Hoặc với tiêu đề tùy chỉnh
  showToast.error("Vui lòng kiểm tra lại thông tin", "Lỗi xác thực")
}

// 3. Toast cảnh báo
const handleWarning = () => {
  showToast.warning("Bạn chưa lưu thay đổi")
  
  // Hoặc với tiêu đề tùy chỉnh  
  showToast.warning("Session sắp hết hạn", "Cảnh báo")
}

// 4. Toast thông tin
const handleInfo = () => {
  showToast.info("Dữ liệu đang được cập nhật...")
  
  // Hoặc với tiêu đề tùy chỉnh
  showToast.info("Phiên bản mới đã có sẵn", "Thông tin")
}

// 5. Sử dụng trong try-catch
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

// 6. Sử dụng trong form submission
const handleSubmit = async (formData: any) => {
  try {
    // Loading toast
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

export { handleSuccess, handleError, handleWarning, handleInfo, syncData, handleSubmit }
