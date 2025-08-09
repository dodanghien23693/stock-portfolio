import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount * 1000)
}

export function formatLargeNumber(amount: number): string {
  // Chuyển đổi từ nghìn sang đơn vị thực
  const realAmount = amount * 1000;
  
  if (realAmount >= 1000000000000) {
    // Nghìn tỷ
    return `${(realAmount / 1000000000000).toFixed(1)} nghìn tỷ ₫`;
  } else if (realAmount >= 1000000000) {
    // Tỷ
    return `${(realAmount / 1000000000).toFixed(1)} tỷ ₫`;
  } else if (realAmount >= 1000000) {
    // Triệu
    return `${(realAmount / 1000000).toFixed(1)} triệu ₫`;
  } else if (realAmount >= 1000) {
    // Nghìn
    return `${(realAmount / 1000).toFixed(1)} nghìn ₫`;
  } else {
    // Dưới nghìn
    return `${realAmount.toFixed(0)} ₫`;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

export function formatPercent(num: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num / 100)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN').format(d)
}
