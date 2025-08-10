from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
import logging
import asyncio
from datetime import datetime

from ..models import (
    StockPrice, StockInfo, StockHistory, SyncRequest, SyncResponse, MarketIndex,
    NewsArticle, NewsCategory, NewsFilter, NewsResponse
)
from ..services.vnstock_service import vnstock_service
from ..services.database import db_service
from ..services.news_service import news_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "VNStock API Service is running", "timestamp": datetime.now()}

@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@router.get("/stocks/{symbol}/price", response_model=StockPrice)
async def get_stock_price(symbol: str):
    """Get current stock price"""
    try:
        stock_price = vnstock_service.get_stock_price(symbol.upper())
        if not stock_price:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        return stock_price
    except Exception as e:
        logger.error(f"Error getting stock price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{symbol}/info", response_model=StockInfo)
async def get_stock_info(symbol: str):
    """Get stock company information"""
    try:
        stock_info = vnstock_service.get_stock_info(symbol.upper())
        if not stock_info:
            raise HTTPException(status_code=404, detail=f"Stock info for {symbol} not found")
        return stock_info
    except Exception as e:
        logger.error(f"Error getting stock info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{symbol}/history", response_model=StockHistory)
async def get_stock_history(symbol: str, period: str = "1Y"):
    """Get historical stock data"""
    try:
        stock_history = vnstock_service.get_stock_history(symbol.upper(), period)
        if not stock_history:
            raise HTTPException(status_code=404, detail=f"Stock history for {symbol} not found")
        return stock_history
    except Exception as e:
        logger.error(f"Error getting stock history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market/indices", response_model=List[MarketIndex])
async def get_market_indices():
    """Get market indices data"""
    try:
        indices = vnstock_service.get_market_indices()
        return indices
    except Exception as e:
        logger.error(f"Error getting market indices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/search")
async def search_stocks(q: str, limit: int = 10):
    """Search for stocks"""
    try:
        results = vnstock_service.search_stocks(q, limit)
        return {"results": results}
    except Exception as e:
        logger.error(f"Error searching stocks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/stocks", response_model=SyncResponse)
async def sync_stocks(request: SyncRequest, background_tasks: BackgroundTasks):
    """Sync stock data to database"""
    try:
        # Add background task for syncing
        background_tasks.add_task(sync_stocks_task, request.symbols, request.period)
        
        return SyncResponse(
            success=True,
            message=f"Sync started for {len(request.symbols)} symbols",
            synced_symbols=[],
            failed_symbols=[]
        )
    except Exception as e:
        logger.error(f"Error starting sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/tracked-stocks", response_model=SyncResponse)
async def sync_tracked_stocks(background_tasks: BackgroundTasks, period: str = "3M"):
    """Sync all tracked stocks from portfolios"""
    try:
        # Get tracked symbols from database
        symbols = db_service.get_tracked_symbols()
        
        if not symbols:
            return SyncResponse(
                success=True,
                message="No tracked symbols found",
                synced_symbols=[],
                failed_symbols=[]
            )
        
        # Add background task for syncing
        background_tasks.add_task(sync_stocks_task, symbols, period)
        
        return SyncResponse(
            success=True,
            message=f"Sync started for {len(symbols)} tracked symbols",
            synced_symbols=[],
            failed_symbols=[]
        )
    except Exception as e:
        logger.error(f"Error starting tracked stocks sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def sync_stocks_task(symbols: List[str], period: str = "1Y"):
    """Background task to sync stock data"""
    synced_symbols = []
    failed_symbols = []
    
    for symbol in symbols:
        try:
            logger.info(f"Syncing stock data for {symbol}")
            
            # Get current price data
            price_data = vnstock_service.get_stock_price(symbol)
            if price_data:
                # Convert to database format
                price_dict = {
                    'symbol': symbol,
                    'name': symbol,  # Will be updated with company info
                    'price': price_data.price,
                    'change': price_data.change,
                    'change_percent': price_data.change_percent,
                    'volume': price_data.volume,
                    'high': price_data.high,
                    'low': price_data.low,
                    'open': price_data.open,
                    'close': price_data.close,
                    'trading_date': price_data.trading_date
                }
                
                # Update current price
                if db_service.update_stock_price(price_dict):
                    logger.info(f"Updated price for {symbol}")
                else:
                    logger.error(f"Failed to update price for {symbol}")
            
            # Get company info
            info_data = vnstock_service.get_stock_info(symbol)
            if info_data:
                info_dict = {
                    'company_name': info_data.company_name,
                    'exchange': info_data.exchange,
                    'sector': info_data.sector,
                    'industry': info_data.industry,
                    'market_cap': info_data.market_cap,
                    'listed_shares': info_data.listed_shares,
                    'eps': info_data.eps,
                    'pe': info_data.pe,
                    'pb': info_data.pb,
                    'roe': info_data.roe,
                    'roa': info_data.roa
                }
                
                if db_service.update_stock_info(symbol, info_dict):
                    logger.info(f"Updated info for {symbol}")
                else:
                    logger.error(f"Failed to update info for {symbol}")
            
            # Get historical data
            history_data = vnstock_service.get_stock_history(symbol, period)
            if history_data:
                # Convert to database format
                history_list = []
                for item in history_data.data:
                    history_list.append({
                        'date': item.date,
                        'open': item.open,
                        'high': item.high,
                        'low': item.low,
                        'close': item.close,
                        'volume': item.volume,
                        'value': item.value
                    })
                
                if db_service.insert_stock_history(symbol, history_list):
                    logger.info(f"Updated history for {symbol}")
                else:
                    logger.error(f"Failed to update history for {symbol}")
            
            synced_symbols.append(symbol)
            
            # Add small delay to avoid rate limiting
            await asyncio.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error syncing {symbol}: {e}")
            failed_symbols.append(symbol)
    
    logger.info(f"Sync completed. Success: {len(synced_symbols)}, Failed: {len(failed_symbols)}")

# News API Endpoints
@router.get("/news", response_model=NewsResponse)
async def get_news(
    category: Optional[str] = Query(None, description="Filter by category"),
    symbols: Optional[str] = Query(None, description="Filter by symbols (comma-separated)"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    limit: int = Query(20, description="Number of articles to return"),
    page: int = Query(1, description="Page number")
):
    """Get news articles with optional filtering"""
    try:
        # Parse symbols if provided
        symbol_list = None
        if symbols:
            symbol_list = [s.strip().upper() for s in symbols.split(',')]
        
        # Create filter object
        filters = NewsFilter(
            category=category,
            symbols=symbol_list,
            sentiment=sentiment,
            limit=limit,
            page=page
        )
        
        news_response = news_service.get_all_news(filters)
        return news_response
        
    except Exception as e:
        logger.error(f"Error getting news: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/categories", response_model=List[NewsCategory])
async def get_news_categories():
    """Get available news categories"""
    try:
        return news_service.get_categories()
    except Exception as e:
        logger.error(f"Error getting news categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/stocks/{symbol}", response_model=List[NewsArticle])
async def get_news_by_symbol(symbol: str, limit: int = Query(10, description="Number of articles")):
    """Get news articles related to a specific stock symbol"""
    try:
        articles = news_service.get_news_by_symbol(symbol.upper(), limit)
        return articles
    except Exception as e:
        logger.error(f"Error getting news for symbol {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/cafef", response_model=List[NewsArticle])
async def get_cafef_news(limit: int = Query(20, description="Number of articles")):
    """Get news from CafeF RSS feed"""
    try:
        articles = news_service.get_news_from_cafef(limit)
        return articles
    except Exception as e:
        logger.error(f"Error getting CafeF news: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/vnexpress", response_model=List[NewsArticle])
async def get_vnexpress_news(limit: int = Query(20, description="Number of articles")):
    """Get news from VnExpress RSS feed"""
    try:
        articles = news_service.get_news_from_vnexpress(limit)
        return articles
    except Exception as e:
        logger.error(f"Error getting VnExpress news: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news/vnstock", response_model=List[NewsArticle])
async def get_vnstock_news(symbol: Optional[str] = Query(None, description="Optional symbol filter")):
    """Get news from VNStock API"""
    try:
        articles = news_service.get_stock_news_from_vnstock(symbol)
        return articles
    except Exception as e:
        logger.error(f"Error getting VNStock news: {e}")
        raise HTTPException(status_code=500, detail=str(e))
