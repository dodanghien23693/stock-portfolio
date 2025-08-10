from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class StockPrice(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    high: float
    low: float
    open: float
    close: float
    trading_date: str

class StockInfo(BaseModel):
    symbol: str
    company_name: str
    exchange: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None
    listed_shares: Optional[int] = None
    eps: Optional[float] = None
    pe: Optional[float] = None
    pb: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None

class StockHistoryData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    value: float

class StockHistory(BaseModel):
    symbol: str
    data: List[StockHistoryData]

class SyncRequest(BaseModel):
    symbols: List[str]
    period: Optional[str] = "1Y"
    
class SyncResponse(BaseModel):
    success: bool
    message: str
    synced_symbols: List[str]
    failed_symbols: List[str]

class MarketIndex(BaseModel):
    index_name: str
    index_value: float
    change: float
    change_percent: float
    volume: int
    trading_date: str

# News Models
class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    content: Optional[str] = None
    url: str
    source: str
    publish_date: datetime
    category: Optional[str] = None
    related_symbols: List[str] = []
    sentiment: Optional[str] = None  # 'positive', 'negative', 'neutral'
    impact_score: Optional[float] = None  # 0-100 scale
    tags: List[str] = []

class NewsCategory(BaseModel):
    id: str
    name: str
    description: str

class NewsFilter(BaseModel):
    category: Optional[str] = None
    symbols: Optional[List[str]] = None
    sentiment: Optional[str] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    limit: int = 20

class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    page: int
    per_page: int
