// Vietnam Stock Market APIs Integration - Updated to use Python vnstock service
export interface VNStockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  tradingDate: string;
}

export interface VNStockInfo {
  symbol: string;
  companyName: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  listedShares?: number;
  eps?: number;
  pe?: number;
  pb?: number;
  roe?: number;
  roa?: number;
}

export interface VNStockHistory {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    value: number;
  }>;
}

export interface MarketIndex {
  index_name: string;
  index_value: number;
  change: number;
  change_percent: number;
  volume: number;
  trading_date: string;
}

// Main Stock API Service - Now uses Python vnstock service
export class VietnamStockAPI {
  private pythonServiceUrl = process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || "http://localhost:8001";

  async getStockPrice(symbol: string): Promise<VNStockPrice | null> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/stocks/${symbol}/price`);
      if (!response.ok) return null;

      const data = await response.json();
      return {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.change_percent,
        volume: data.volume,
        high: data.high,
        low: data.low,
        open: data.open,
        close: data.close,
        tradingDate: data.trading_date,
      };
    } catch (error) {
      console.error("Python VNStock API error:", error);
      return null;
    }
  }

  async getStockInfo(symbol: string): Promise<VNStockInfo | null> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/stocks/${symbol}/info`);
      if (!response.ok) return null;

      const data = await response.json();
      return {
        symbol: data.symbol,
        companyName: data.company_name,
        exchange: data.exchange,
        sector: data.sector,
        industry: data.industry,
        marketCap: data.market_cap,
        listedShares: data.listed_shares,
        eps: data.eps,
        pe: data.pe,
        pb: data.pb,
        roe: data.roe,
        roa: data.roa,
      };
    } catch (error) {
      console.error("Python VNStock API error:", error);
      return null;
    }
  }

  async getStockHistory(
    symbol: string,
    period: string = "1Y"
  ): Promise<VNStockHistory | null> {
    try {
      const response = await fetch(
        `${this.pythonServiceUrl}/stocks/${symbol}/history?period=${period}`
      );
      if (!response.ok) return null;

      const data = await response.json();
      return {
        symbol: data.symbol,
        data: data.data.map((item: any) => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          value: item.value,
        })),
      };
    } catch (error) {
      console.error("Python VNStock API error:", error);
      return null;
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/market/indices`);
      if (!response.ok) return [];

      return await response.json();
    } catch (error) {
      console.error("Python VNStock API error:", error);
      return [];
    }
  }

  async searchStocks(query: string, limit: number = 10): Promise<Array<{symbol: string; company_name: string; exchange: string}>> {
    try {
      const response = await fetch(
        `${this.pythonServiceUrl}/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Python VNStock API error:", error);
      return [];
    }
  }

  async syncStocks(symbols: string[], period: string = "1Y"): Promise<boolean> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/sync/stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols,
          period,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error syncing stocks:", error);
      return false;
    }
  }

  async syncTrackedStocks(period: string = "3M"): Promise<boolean> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/sync/tracked-stocks?period=${period}`, {
        method: "POST",
      });

      return response.ok;
    } catch (error) {
      console.error("Error syncing tracked stocks:", error);
      return false;
    }
  }

  async updateStockData(symbol: string): Promise<boolean> {
    try {
      // Use the new sync endpoint instead of the old method
      return await this.syncStocks([symbol], "3M");
    } catch (error) {
      console.error("Error updating stock data:", error);
      return false;
    }
  }

  // Health check for Python service
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("Python service health check failed:", error);
      return false;
    }
  }
}

export const vietnamStockAPI = new VietnamStockAPI();
