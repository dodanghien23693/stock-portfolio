from vnstock import Vnstock, Listing, Quote, Company, Finance, Trading
import pandas as pd
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from models import StockPrice, StockInfo, StockHistory, StockHistoryData, MarketIndex

logger = logging.getLogger(__name__)

class VNStockService:
    def __init__(self):
        # Initialize vnstock components according to new API
        self.listing = Listing()
        # Default to VCI source as it's most comprehensive
        self.default_source = 'VCI'
        
    def get_stock_price(self, symbol: str) -> Optional[StockPrice]:
        """Get current stock price using vnstock unified interface"""
        try:
            # Prioritize Quote history method as it's more reliable
            try:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=7)  # Last week to ensure data
                
                quote = Quote(symbol=symbol, source=self.default_source)
                hist_data = quote.history(
                    start=start_date.strftime('%Y-%m-%d'),
                    end=end_date.strftime('%Y-%m-%d'),
                    interval='1D'
                )
                
                if not hist_data.empty:
                    # Get latest data
                    latest = hist_data.iloc[-1]
                    
                    # Calculate change vs previous day
                    change = 0
                    change_percent = 0
                    if len(hist_data) > 1:
                        prev_close = hist_data.iloc[-2]['close']
                        current_close = latest['close']
                        change = current_close - prev_close
                        change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
                    
                    return StockPrice(
                        symbol=symbol,
                        price=float(latest['close']),
                        change=float(change),
                        change_percent=float(change_percent),
                        volume=int(latest['volume']),
                        high=float(latest['high']),
                        low=float(latest['low']),
                        open=float(latest['open']),
                        close=float(latest['close']),
                        trading_date=str(latest['time'])[:10] if 'time' in latest else datetime.now().strftime('%Y-%m-%d')
                    )
                    
            except Exception as e1:
                logger.warning(f"Quote history method failed for {symbol}: {e1}")
                
                # Fallback method: Try Trading.price_board
                try:
                    trading = Trading(source=self.default_source)
                    price_data = trading.price_board([symbol])
                    
                    if not price_data.empty and len(price_data) > 0:
                        data = price_data.iloc[0]
                        
                        return StockPrice(
                            symbol=symbol,
                            price=float(data.get('close', data.get('price', 0))),
                            change=float(data.get('change', 0)),
                            change_percent=float(data.get('change_percent', data.get('change_pc', 0))),
                            volume=int(data.get('volume', 0)),
                            high=float(data.get('high', 0)),
                            low=float(data.get('low', 0)),
                            open=float(data.get('open', 0)),
                            close=float(data.get('close', data.get('price', 0))),
                            trading_date=str(data.get('trading_date', datetime.now().strftime('%Y-%m-%d')))
                        )
                except Exception as e2:
                    logger.error(f"Price board method also failed for {symbol}: {e2}")
            
            logger.warning(f"No price data found for symbol: {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting stock price for {symbol}: {e}")
            return None
    
    def get_stock_info(self, symbol: str) -> Optional[StockInfo]:
        """Get stock company information using unified interface"""
        try:
            # Use unified interface
            stock = Vnstock().stock(symbol=symbol, source=self.default_source)
            
            # Get company profile/overview
            try:
                company = Company(symbol=symbol, source=self.default_source)
                profile = company.overview()
                
                if profile.empty:
                    logger.warning(f"No company info found for symbol: {symbol}")
                    return None
                
                data = profile.iloc[0]
                
                # Get financial ratios separately
                try:
                    finance = Finance(symbol=symbol, source=self.default_source)
                    ratios = finance.ratio(period='quarter', lang='en', dropna=True)
                    latest_ratio = ratios.iloc[0] if not ratios.empty else {}
                except Exception as e:
                    logger.warning(f"Could not get financial ratios for {symbol}: {e}")
                    latest_ratio = {}
                
                return StockInfo(
                    symbol=symbol,
                    company_name=str(data.get('company_name', data.get('companyName', ''))),
                    exchange=str(data.get('exchange', data.get('exchangeName', ''))),
                    sector=str(data.get('sector', data.get('industry1', ''))),
                    industry=str(data.get('industry', data.get('industry2', ''))),
                    market_cap=float(data.get('market_cap', data.get('marketCap', 0))) if data.get('market_cap') or data.get('marketCap') else None,
                    listed_shares=int(data.get('listed_shares', data.get('sharesOutstanding', 0))) if data.get('listed_shares') or data.get('sharesOutstanding') else None,
                    eps=float(latest_ratio.get('eps', latest_ratio.get('earningsPerShare', 0))) if latest_ratio.get('eps') or latest_ratio.get('earningsPerShare') else None,
                    pe=float(latest_ratio.get('pe', latest_ratio.get('priceToEarnings', 0))) if latest_ratio.get('pe') or latest_ratio.get('priceToEarnings') else None,
                    pb=float(latest_ratio.get('pb', latest_ratio.get('priceToBook', 0))) if latest_ratio.get('pb') or latest_ratio.get('priceToBook') else None,
                    roe=float(latest_ratio.get('roe', latest_ratio.get('returnOnEquity', 0))) if latest_ratio.get('roe') or latest_ratio.get('returnOnEquity') else None,
                    roa=float(latest_ratio.get('roa', latest_ratio.get('returnOnAssets', 0))) if latest_ratio.get('roa') or latest_ratio.get('returnOnAssets') else None
                )
                
            except Exception as e:
                logger.error(f"Error getting company info for {symbol}: {e}")
                return None
            
        except Exception as e:
            logger.error(f"Error in get_stock_info for {symbol}: {e}")
            return None
    
    def get_stock_history(self, symbol: str, period: str = "1Y") -> Optional[StockHistory]:
        """Get historical stock data using unified interface"""
        try:
            # Calculate start and end dates based on period
            end_date = datetime.now()
            
            period_map = {
                "1D": 1,
                "1W": 7, 
                "1M": 30,
                "3M": 90,
                "6M": 180,
                "1Y": 365,
                "2Y": 730,
                "5Y": 1825
            }
            
            days = period_map.get(period, 365)
            start_date = end_date - timedelta(days=days)
            
            # Use unified interface for historical data
            quote = Quote(symbol=symbol, source=self.default_source)
            hist_data = quote.history(
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d'),
                interval='1D'
            )
            
            if hist_data.empty:
                logger.warning(f"No historical data found for symbol: {symbol}")
                return None
            
            # Convert to our format - handle different column names
            history_list = []
            for _, row in hist_data.iterrows():
                # Handle different date column names
                date_value = row.get('time') or row.get('date') or row.get('trading_date')
                if pd.isna(date_value):
                    continue
                    
                # Handle different volume column names and calculate value
                volume = int(row.get('volume', 0))
                close_price = float(row.get('close', 0))
                value = volume * close_price
                
                history_list.append(StockHistoryData(
                    date=str(date_value)[:10],  # Ensure YYYY-MM-DD format
                    open=float(row.get('open', 0)),
                    high=float(row.get('high', 0)),
                    low=float(row.get('low', 0)),
                    close=close_price,
                    volume=volume,
                    value=value
                ))
            
            return StockHistory(
                symbol=symbol,
                data=history_list
            )
            
        except Exception as e:
            logger.error(f"Error getting stock history for {symbol}: {e}")
            return None
    
    def get_market_indices(self) -> List[MarketIndex]:
        """Get market indices data"""
        try:
            indices_data = []
            
            # Use Trading class to get indices data
            trading = Trading(source=self.default_source)
            
            # Try to get indices data
            for index_symbol in ['VNINDEX', 'HNXINDEX', 'UPCOM']:
                try:
                    # Method 1: Try using price_board for indices
                    index_data = trading.price_board([index_symbol])
                    
                    if not index_data.empty:
                        data = index_data.iloc[0]
                        indices_data.append(MarketIndex(
                            index_name=index_symbol,
                            index_value=float(data.get('close', data.get('price', 0))),
                            change=float(data.get('change', 0)),
                            change_percent=float(data.get('change_percent', data.get('change_pc', 0))),
                            volume=int(data.get('volume', 0)),
                            trading_date=str(data.get('trading_date', datetime.now().strftime('%Y-%m-%d')))
                        ))
                        continue
                    
                    # Method 2: Fallback to Quote for indices
                    quote = Quote(symbol=index_symbol, source=self.default_source)
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=2)
                    
                    hist_data = quote.history(
                        start=start_date.strftime('%Y-%m-%d'),
                        end=end_date.strftime('%Y-%m-%d'),
                        interval='1D'
                    )
                    
                    if not hist_data.empty:
                        latest = hist_data.iloc[-1]
                        
                        # Calculate change
                        change = 0
                        change_percent = 0
                        if len(hist_data) > 1:
                            prev_close = hist_data.iloc[-2]['close']
                            current_close = latest['close']
                            change = current_close - prev_close
                            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
                        
                        indices_data.append(MarketIndex(
                            index_name=index_symbol,
                            index_value=float(latest['close']),
                            change=float(change),
                            change_percent=float(change_percent),
                            volume=int(latest.get('volume', 0)),
                            trading_date=str(latest.get('time', datetime.now().strftime('%Y-%m-%d')))[:10]
                        ))
                        
                except Exception as e:
                    logger.error(f"Error getting index {index_symbol}: {e}")
                    continue
            
            return indices_data
            
        except Exception as e:
            logger.error(f"Error getting market indices: {e}")
            return []
    
    def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for stocks by company name or symbol using new listing API"""
        try:
            # Use Listing class to get all symbols
            all_symbols = self.listing.all_symbols()
            
            if all_symbols.empty:
                logger.warning("No symbols data available")
                return []
            
            # Filter by query (search in symbol and company name if available)
            query_upper = query.upper()
            
            # Handle the actual column names from vnstock 3.x
            symbol_col = 'symbol' if 'symbol' in all_symbols.columns else 'ticker'
            name_col = 'organ_name' if 'organ_name' in all_symbols.columns else 'company_name'
            
            filtered = all_symbols[
                all_symbols[symbol_col].str.contains(query_upper, na=False, case=False) |
                (all_symbols.get(name_col, pd.Series()).str.contains(query, case=False, na=False))
            ].head(limit)
            
            result = []
            for _, row in filtered.iterrows():
                # Handle different column names that might exist
                company_name = (
                    row.get('organ_name') or 
                    row.get('company_name') or 
                    row.get('companyName') or 
                    row.get('name') or 
                    row.get(symbol_col, '')
                )
                
                exchange = (
                    row.get('exchange') or 
                    row.get('exchangeName') or 
                    row.get('market') or 
                    'HOSE'  # Default to HOSE for Vietnamese stocks
                )
                
                result.append({
                    'symbol': row[symbol_col],
                    'company_name': str(company_name),
                    'exchange': str(exchange)
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []
    
    def get_all_symbols(self) -> List[str]:
        """Get list of all available stock symbols"""
        try:
            all_symbols = self.listing.all_symbols()
            if not all_symbols.empty:
                # Handle different column names
                symbol_col = 'symbol' if 'symbol' in all_symbols.columns else 'ticker'
                if symbol_col in all_symbols.columns:
                    return all_symbols[symbol_col].tolist()
            return []
        except Exception as e:
            logger.error(f"Error getting all symbols: {e}")
            return []
    
    def health_check(self) -> Dict[str, Any]:
        """Health check to verify vnstock is working"""
        try:
            # Try to get a simple listing to verify API works
            symbols = self.listing.all_symbols()
            symbol_count = len(symbols) if not symbols.empty else 0
            
            return {
                "status": "healthy",
                "vnstock_working": True,
                "available_symbols": symbol_count,
                "default_source": self.default_source,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy", 
                "vnstock_working": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

vnstock_service = VNStockService()
