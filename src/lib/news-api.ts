import {
  NewsArticle,
  NewsCategory,
  NewsFilter,
  NewsResponse,
  NewsStats,
} from "@/types";

const PYTHON_SERVICE_URL =
  process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || "http://localhost:8001";

class NewsApiService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const url = `${PYTHON_SERVICE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  async getNews(filters?: NewsFilter): Promise<NewsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.category) params.append("category", filters.category);
        if (filters.symbols)
          params.append("symbols", filters.symbols.join(","));
        if (filters.sentiment) params.append("sentiment", filters.sentiment);
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.page) params.append("page", filters.page.toString());
      }

      const queryString = params.toString();
      const endpoint = `/news${queryString ? `?${queryString}` : ""}`;

      return this.fetchApi<NewsResponse>(endpoint);
    } catch (error) {
      console.error("Error fetching news:", error);

      // Return sample data for development
      return {
        articles: [
          {
            id: "1",
            title: "VN-Index tăng mạnh, vượt ngưỡng 1,270 điểm",
            summary:
              "Thị trường chứng khoán Việt Nam có phiên giao dịch tích cực với VN-Index tăng 1.2% lên 1,270 điểm. Nhóm cổ phiếu ngân hàng và thép dẫn dắt thị trường.",
            url: "https://example.com/news/1",
            source: "CafeF",
            publishDate: new Date(),
            category: "market",
            relatedSymbols: ["VCB", "CTG", "HPG", "HSG"],
            sentiment: "positive" as const,
            impactScore: 75,
            tags: ["thị trường", "vn-index", "ngân hàng", "thép"],
          },
          {
            id: "2",
            title: "VCB công bố kết quả kinh doanh quý 3 ấn tượng",
            summary:
              "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam (VCB) báo cáo lợi nhuận trước thuế đạt 7,800 tỷ đồng trong quý 3, tăng 15% so với cùng kỳ năm trước.",
            url: "https://example.com/news/2",
            source: "VNStock",
            publishDate: new Date(Date.now() - 3600000), // 1 hour ago
            category: "stocks",
            relatedSymbols: ["VCB"],
            sentiment: "positive" as const,
            impactScore: 85,
            tags: ["vcb", "ngân hàng", "kết quả kinh doanh", "lợi nhuận"],
          },
          {
            id: "3",
            title:
              "Giá dầu thô tăng mạnh, tác động tích cực đến cổ phiếu dầu khí",
            summary:
              "Giá dầu thô Brent tăng 3% trong phiên giao dịch đêm qua, dự kiến sẽ có tác động tích cực đến các cổ phiếu dầu khí Việt Nam như PVD, PVS, PVC.",
            url: "https://example.com/news/3",
            source: "CafeF",
            publishDate: new Date(Date.now() - 7200000), // 2 hours ago
            category: "international",
            relatedSymbols: ["PVD", "PVS", "PVC"],
            sentiment: "positive" as const,
            impactScore: 65,
            tags: ["dầu khí", "giá dầu", "quốc tế"],
          },
          {
            id: "4",
            title: "NHNN tăng lãi suất điều hành lên 4.5%",
            summary:
              "Ngân hàng Nhà nước Việt Nam vừa quyết định tăng lãi suất tái cấp vốn lên 4.5%, tăng 0.25% so với mức trước đó. Động thái này nhằm kiểm soát lạm phát.",
            url: "https://example.com/news/4",
            source: "VNStock",
            publishDate: new Date(Date.now() - 10800000), // 3 hours ago
            category: "economy",
            relatedSymbols: ["VCB", "CTG", "BID", "TCB"],
            sentiment: "negative" as const,
            impactScore: 70,
            tags: ["lãi suất", "nhnn", "ngân hàng", "chính sách tiền tệ"],
          },
          {
            id: "5",
            title: "Nhóm cổ phiếu bất động sản phục hồi mạnh",
            summary:
              "Các cổ phiếu bất động sản như VHM, VIC, NVL đều tăng mạnh trong phiên sáng nay sau thông tin về gói hỗ trợ tín dụng mới từ chính phủ.",
            url: "https://example.com/news/5",
            source: "CafeF",
            publishDate: new Date(Date.now() - 14400000), // 4 hours ago
            category: "stocks",
            relatedSymbols: ["VHM", "VIC", "NVL", "DXG"],
            sentiment: "positive" as const,
            impactScore: 80,
            tags: ["bất động sản", "phục hồi", "tín dụng"],
          },
        ],
        total: 5,
        page: 1,
        perPage: 20,
      };
    }
  }

  async getNewsCategories(): Promise<NewsCategory[]> {
    try {
      return this.fetchApi<NewsCategory[]>("/news/categories");
    } catch (error) {
      console.error("Error fetching categories:", error);

      // Return sample categories for development
      return [
        {
          id: "market",
          name: "Thị trường",
          description: "Tin tức thị trường chung",
        },
        {
          id: "stocks",
          name: "Cổ phiếu",
          description: "Tin tức về cổ phiếu cụ thể",
        },
        {
          id: "analysis",
          name: "Phân tích",
          description: "Phân tích kỹ thuật và cơ bản",
        },
        {
          id: "economy",
          name: "Kinh tế",
          description: "Tin tức kinh tế vĩ mô",
        },
        {
          id: "international",
          name: "Quốc tế",
          description: "Tin tức thị trường quốc tế",
        },
        {
          id: "corporate",
          name: "Doanh nghiệp",
          description: "Tin tức doanh nghiệp",
        },
      ];
    }
  }

  async getNewsBySymbol(symbol: string, limit = 10): Promise<NewsArticle[]> {
    try {
      return this.fetchApi<NewsArticle[]>(
        `/news/stocks/${symbol}?limit=${limit}`
      );
    } catch (error) {
      console.error("Error fetching news by symbol:", error);

      // Return sample data filtered by symbol
      const sampleNews: NewsArticle[] = [
        {
          id: "1",
          title: `${symbol} - Kết quả kinh doanh quý 3 vượt kỳ vọng`,
          summary: `Công ty ${symbol} vừa công bố kết quả kinh doanh quý 3 với doanh thu và lợi nhuận đều tăng trưởng mạnh so với cùng kỳ năm trước.`,
          url: "https://example.com/news/1",
          source: "VNStock",
          publishDate: new Date(),
          category: "stocks",
          relatedSymbols: [symbol],
          sentiment: "positive" as const,
          impactScore: 85,
          tags: [symbol.toLowerCase(), "kết quả kinh doanh"],
        },
      ];

      return sampleNews;
    }
  }

  async getCafefNews(limit = 20): Promise<NewsArticle[]> {
    try {
      return this.fetchApi<NewsArticle[]>(`/news/cafef?limit=${limit}`);
    } catch (error) {
      console.error("Error fetching CafeF news:", error);

      // Return sample CafeF news for development
      return [
        {
          id: "cafef-1",
          title:
            "Thị trường chứng khoán: VN-Index test ngưỡng kháng cự 1,280 điểm",
          summary:
            "Sau phiên tăng mạnh hôm qua, VN-Index tiếp tục đà tăng và đang test ngưỡng kháng cự quan trọng 1,280 điểm. Thanh khoản thị trường cải thiện đáng kể.",
          url: "https://cafef.vn/news-1",
          source: "CafeF",
          publishDate: new Date(Date.now() - 1800000),
          category: "market",
          relatedSymbols: ["VCB", "HPG", "VNM"],
          sentiment: "positive" as const,
          impactScore: 70,
          tags: ["cafef", "vn-index", "kháng cự"],
        },
        {
          id: "cafef-2",
          title: "Dòng tiền đổ mạnh vào nhóm cổ phiếu công nghệ",
          summary:
            "Các cổ phiếu công nghệ như FPT, CMG, ELC đều tăng mạnh trong phiên sáng nay khi dòng tiền đầu tư đổ mạnh vào nhóm này.",
          url: "https://cafef.vn/news-2",
          source: "CafeF",
          publishDate: new Date(Date.now() - 5400000),
          category: "stocks",
          relatedSymbols: ["FPT", "CMG", "ELC"],
          sentiment: "positive" as const,
          impactScore: 65,
          tags: ["cafef", "công nghệ", "dòng tiền"],
        },
      ];
    }
  }

  async getVnstockNews(symbol?: string): Promise<NewsArticle[]> {
    try {
      const endpoint = symbol
        ? `/news/vnstock?symbol=${symbol}`
        : "/news/vnstock";
      return this.fetchApi<NewsArticle[]>(endpoint);
    } catch (error) {
      console.error("Error fetching VNStock news:", error);

      // Return sample VNStock news for development
      return [
        {
          id: "vnstock-1",
          title: symbol
            ? `${symbol} - Phân tích kỹ thuật và khuyến nghị đầu tư`
            : "Báo cáo thị trường tuần: Xu hướng tăng vẫn được duy trì",
          summary: symbol
            ? `Phân tích kỹ thuật cho thấy ${symbol} đang trong xu hướng tăng với các chỉ báo kỹ thuật tích cực. Khuyến nghị MUA với mục tiêu giá ngắn hạn.`
            : "Thị trường chứng khoán Việt Nam tuần qua có những diễn biến tích cực với thanh khoản cải thiện và xu hướng tăng được duy trì.",
          url: "https://vnstock.vn/analysis-1",
          source: "VNStock",
          publishDate: new Date(Date.now() - 3600000),
          category: symbol ? "analysis" : "market",
          relatedSymbols: symbol ? [symbol] : ["VCB", "VNM", "HPG"],
          sentiment: "positive" as const,
          impactScore: 75,
          tags: symbol
            ? ["vnstock", symbol.toLowerCase(), "phân tích"]
            : ["vnstock", "báo cáo", "thị trường"],
        },
      ];
    }
  }

  async getVnexpressNews(limit = 20): Promise<NewsArticle[]> {
    try {
      return this.fetchApi<NewsArticle[]>(`/news/vnexpress?limit=${limit}`);
    } catch (error) {
      console.error("Error fetching VnExpress news:", error);

      // Return sample VnExpress news for development
      return [
        {
          id: "vnexpress-1",
          title: "Chính phủ khuyến khích đầu tư vào thị trường chứng khoán",
          summary:
            "Thủ tướng Chính phủ vừa ban hành chỉ thị khuyến khích các định chế tài chính tăng cường đầu tư vào thị trường chứng khoán để hỗ trợ nền kinh tế.",
          url: "https://vnexpress.net/kinh-doanh/news-1",
          source: "VnExpress",
          publishDate: new Date(Date.now() - 2700000),
          category: "economy",
          relatedSymbols: ["VCB", "VNM", "HPG"],
          sentiment: "positive" as const,
          impactScore: 80,
          tags: ["vnexpress", "chính phủ", "đầu tư"],
        },
        {
          id: "vnexpress-2",
          title: "Lãi suất ngân hàng tiếp tục xu hướng giảm",
          summary:
            "Các ngân hàng thương mại tiếp tục điều chỉnh giảm lãi suất cho vay để kích thích nhu cầu tín dụng và hỗ trợ doanh nghiệp phục hồi sau dịch.",
          url: "https://vnexpress.net/kinh-doanh/news-2",
          source: "VnExpress",
          publishDate: new Date(Date.now() - 7200000),
          category: "economy",
          relatedSymbols: ["VCB", "CTG", "BID"],
          sentiment: "positive" as const,
          impactScore: 70,
          tags: ["vnexpress", "lãi suất", "ngân hàng"],
        },
      ];
    }
  }

  // Helper methods for formatting and filtering
  formatPublishDate(date: Date | string | null | undefined): string {
    // Handle null/undefined/invalid dates
    if (!date) {
      console.warn("formatPublishDate: date is null or undefined");
      return "Không xác định";
    }

    let d: Date;

    try {
      // Parse date with better error handling
      if (typeof date === "string") {
        // Handle various string formats
        d = new Date(date);
        // Additional check for ISO string format
        if (isNaN(d.getTime()) && date.includes("T")) {
          d = new Date(date.replace("T", " ").replace("Z", ""));
        }
      } else if (date instanceof Date) {
        d = date;
      } else {
        console.warn(
          "formatPublishDate: invalid date type:",
          typeof date,
          date
        );
        return "Không xác định";
      }

      // Check if date is valid after parsing
      if (!d || isNaN(d.getTime())) {
        console.warn("formatPublishDate: invalid date after parsing:", date);
        return "Không xác định";
      }

      const now = new Date();
      const diffMs = now.getTime() - d.getTime();

      // Handle future dates (shouldn't happen but just in case)
      if (diffMs < 0) {
        console.warn("formatPublishDate: future date detected:", d);
        return "Vừa xong";
      }

      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) {
        return "Vừa xong";
      } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
      } else {
        // Use more robust date formatting
        return d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("formatPublishDate: error parsing date:", error, date);
      return "Không xác định";
    }
  }

  getSentimentColor(sentiment?: string): string {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }

  getSentimentIcon(sentiment?: string): string {
    switch (sentiment) {
      case "positive":
        return "📈";
      case "negative":
        return "📉";
      default:
        return "📊";
    }
  }

  getImpactScoreColor(score?: number): string {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-red-600";
    if (score >= 50) return "text-orange-500";
    if (score >= 30) return "text-yellow-500";
    return "text-gray-500";
  }

  getCategoryIcon(category?: string): string {
    switch (category) {
      case "market":
        return "📊";
      case "stocks":
        return "💹";
      case "analysis":
        return "📈";
      case "economy":
        return "🏦";
      case "international":
        return "🌍";
      case "corporate":
        return "🏢";
      default:
        return "📰";
    }
  }

  getCategoryName(category?: string): string {
    switch (category) {
      case "market":
        return "Thị trường";
      case "stocks":
        return "Cổ phiếu";
      case "analysis":
        return "Phân tích";
      case "economy":
        return "Kinh tế";
      case "international":
        return "Quốc tế";
      case "corporate":
        return "Doanh nghiệp";
      default:
        return "Tin tức";
    }
  }

  // Generate news statistics
  generateNewsStats(articles: NewsArticle[]): NewsStats {
    const totalArticles = articles.length;
    const positiveNews = articles.filter(
      (a) => a.sentiment === "positive"
    ).length;
    const negativeNews = articles.filter(
      (a) => a.sentiment === "negative"
    ).length;
    const neutralNews = articles.filter(
      (a) => a.sentiment === "neutral"
    ).length;

    // Count symbols and their impact
    const symbolCounts: Record<string, { count: number; totalImpact: number }> =
      {};
    articles.forEach((article) => {
      // Check if relatedSymbols exists and is an array
      if (article.relatedSymbols && Array.isArray(article.relatedSymbols)) {
        article.relatedSymbols.forEach((symbol) => {
          if (!symbolCounts[symbol]) {
            symbolCounts[symbol] = { count: 0, totalImpact: 0 };
          }
          symbolCounts[symbol].count++;
          symbolCounts[symbol].totalImpact += article.impactScore || 0;
        });
      }
    });

    const topSymbols = Object.entries(symbolCounts)
      .map(([symbol, data]) => ({
        symbol,
        count: data.count,
        avgImpact: data.totalImpact / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count sources
    const sourceCounts: Record<string, number> = {};
    articles.forEach((article) => {
      // Safely access source with fallback
      const source = article.source || "Unknown";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalArticles,
      positiveNews,
      negativeNews,
      neutralNews,
      topSymbols,
      topSources,
    };
  }
}

export const newsApiService = new NewsApiService();
export default newsApiService;
