// Vietnam Stock Market APIs Integration
export interface VNStockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  close: number
  tradingDate: string
}

export interface VNStockInfo {
  symbol: string
  companyName: string
  exchange: string
  sector?: string
  industry?: string
  marketCap?: number
  listedShares?: number
  eps?: number
  pe?: number
  pb?: number
  roe?: number
  roa?: number
}

export interface VNStockHistory {
  symbol: string
  data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    value: number
  }>
}

// VNStock API - Free API for Vietnam stock market
class VNStockAPI {
  private baseUrl = 'https://api.vietstock.vn'
  
  async getStockPrice(symbol: string): Promise<VNStockPrice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/finance/stock/quote/${symbol}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        high: data.high,
        low: data.low,
        open: data.open,
        close: data.close,
        tradingDate: data.tradingDate
      }
    } catch (error) {
      console.error('VNStock API error:', error)
      return null
    }
  }

  async getStockInfo(symbol: string): Promise<VNStockInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/finance/stock/info/${symbol}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        symbol: data.symbol,
        companyName: data.companyName,
        exchange: data.exchange,
        sector: data.sector,
        industry: data.industry,
        marketCap: data.marketCap,
        listedShares: data.listedShares,
        eps: data.eps,
        pe: data.pe,
        pb: data.pb,
        roe: data.roe,
        roa: data.roa
      }
    } catch (error) {
      console.error('VNStock API error:', error)
      return null
    }
  }

  async getStockHistory(symbol: string, period: string = '1Y'): Promise<VNStockHistory | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/finance/stock/history/${symbol}?period=${period}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        symbol: data.symbol,
        data: data.data.map((item: any) => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          value: item.value
        }))
      }
    } catch (error) {
      console.error('VNStock API error:', error)
      return null
    }
  }

  async getMarketIndices(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/finance/market/indices`)
      if (!response.ok) return null
      
      return await response.json()
    } catch (error) {
      console.error('VNStock API error:', error)
      return null
    }
  }
}

// Alternative: Use free API from tcbs.com.vn
class TCBSStockAPI {
  private baseUrl = 'https://apipubaws.tcbs.com.vn'

  async getStockPrice(symbol: string): Promise<VNStockPrice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stock-insight/v1/stock/${symbol}/overview`)
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        symbol: data.ticker,
        price: data.price,
        change: data.priceChange,
        changePercent: data.percentPriceChange,
        volume: data.volume,
        high: data.high,
        low: data.low,
        open: data.open,
        close: data.price,
        tradingDate: data.tradingDate
      }
    } catch (error) {
      console.error('TCBS API error:', error)
      return null
    }
  }

  async getStockHistory(symbol: string, size: number = 300): Promise<VNStockHistory | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stock-insight/v1/stock/${symbol}/prices-chart?size=${size}&resolution=1D`)
      if (!response.ok) return null
      
      const data = await response.json()
      return {
        symbol: symbol,
        data: data.data.map((item: any) => ({
          date: new Date(item.tradingDate).toISOString().split('T')[0],
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          value: item.volume * item.close
        }))
      }
    } catch (error) {
      console.error('TCBS API error:', error)
      return null
    }
  }

  async getMarketIndices(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/stock-insight/v1/index/all`)
      if (!response.ok) return null
      
      return await response.json()
    } catch (error) {
      console.error('TCBS API error:', error)
      return null
    }
  }
}

// Main Stock API Service
export class VietnamStockAPI {
  private vnstockAPI = new VNStockAPI()
  private tcbsAPI = new TCBSStockAPI()

  async getStockPrice(symbol: string): Promise<VNStockPrice | null> {
    // Try TCBS first (more reliable)
    let result = await this.tcbsAPI.getStockPrice(symbol)
    if (result) return result

    // Fallback to VNStock
    result = await this.vnstockAPI.getStockPrice(symbol)
    return result
  }

  async getStockInfo(symbol: string): Promise<VNStockInfo | null> {
    return await this.vnstockAPI.getStockInfo(symbol)
  }

  async getStockHistory(symbol: string, period: string = '1Y'): Promise<VNStockHistory | null> {
    // Convert period to size for TCBS API
    const sizeMap: { [key: string]: number } = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825
    }
    
    const size = sizeMap[period] || 365
    let result = await this.tcbsAPI.getStockHistory(symbol, size)
    if (result) return result

    // Fallback to VNStock
    result = await this.vnstockAPI.getStockHistory(symbol, period)
    return result
  }

  async getMarketIndices(): Promise<any> {
    let result = await this.tcbsAPI.getMarketIndices()
    if (result) return result

    result = await this.vnstockAPI.getMarketIndices()
    return result
  }

  async updateStockData(symbol: string): Promise<boolean> {
    try {
      const [priceData, historyData] = await Promise.all([
        this.getStockPrice(symbol),
        this.getStockHistory(symbol, '3M')
      ])

      if (!priceData || !historyData) return false

      // Call API to update database
      const response = await fetch('/api/stocks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          priceData,
          historyData: historyData.data
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error updating stock data:', error)
      return false
    }
  }
}

export const vietnamStockAPI = new VietnamStockAPI()
