import { toast } from "@/hooks/use-toast"

export const showToast = {
  success: (message: string, title?: string) => {
    toast({
      title: title || "Thành công",
      description: message,
      variant: "success",
    })
  },
  
  error: (message: string, title?: string) => {
    toast({
      title: title || "Lỗi",
      description: message,
      variant: "destructive",
    })
  },
  
  warning: (message: string, title?: string) => {
    toast({
      title: title || "Cảnh báo",
      description: message,
      variant: "warning",
    })
  },
  
  info: (message: string, title?: string) => {
    toast({
      title: title || "Thông tin",
      description: message,
      variant: "default",
    })
  },
}
