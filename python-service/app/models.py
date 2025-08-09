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
