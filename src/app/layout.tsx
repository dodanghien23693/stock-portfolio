import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vietnam Stock Analysis Platform",
  description: "Phân tích chứng khoán Việt Nam và backtest chiến lược trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
