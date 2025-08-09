from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import logging
import asyncio
from datetime import datetime

from ..models import (
    StockPrice, StockInfo, StockHistory, SyncRequest, SyncResponse, MarketIndex
)
from ..services.vnstock_service import vnstock_service
from ..services.database import db_service

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
