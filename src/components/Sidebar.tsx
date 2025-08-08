'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Briefcase, 
  TrendingUp, 
  PlayCircle,
  Newspaper,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Tổng quan',
    href: '/',
    icon: BarChart3,
  },
  {
    name: 'Danh sách mã',
    href: '/stocks',
    icon: TrendingUp,
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: Briefcase,
  },
  {
    name: 'Backtest',
    href: '/backtest',
    icon: PlayCircle,
  },
  {
    name: 'Tin tức',
    href: '/news',
    icon: Newspaper,
  },
  {
    name: 'Sự kiện',
    href: '/events',
    icon: Calendar,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
