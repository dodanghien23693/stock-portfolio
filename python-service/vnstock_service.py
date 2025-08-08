import vnstock as stock
import pandas as pd
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from models import StockPrice, StockInfo, StockHistory, StockHistoryData, MarketIndex

logger = logging.getLogger(__name__)

class VNStockService:
    def __init__(self):
        self.vnstock = stock
        
    def get_stock_price(self, symbol: str) -> Optional[StockPrice]:
        """Get current stock price using vnstock"""
        try:
            # Get stock overview/quote
            quote = self.vnstock.stock(symbol=symbol, source='VCI').quote.overview()
            
            if quote.empty:
                logger.warning(f"No data found for symbol: {symbol}")
                return None
            
            # Extract data from the dataframe
            data = quote.iloc[0]
            
            return StockPrice(
                symbol=symbol,
                price=float(data.get('price', 0)),
                change=float(data.get('change', 0)),
                change_percent=float(data.get('change_percent', 0)),
                volume=int(data.get('volume', 0)),
                high=float(data.get('high', 0)),
                low=float(data.get('low', 0)),
                open=float(data.get('open', 0)),
                close=float(data.get('close', 0)),
                trading_date=str(data.get('trading_date', datetime.now().strftime('%Y-%m-%d')))
            )
            
        except Exception as e:
            logger.error(f"Error getting stock price for {symbol}: {e}")
            return None
    
    def get_stock_info(self, symbol: str) -> Optional[StockInfo]:
        """Get stock company information"""
        try:
            # Get company profile
            profile = self.vnstock.stock(symbol=symbol, source='VCI').company.profile()
            
            if profile.empty:
                logger.warning(f"No company info found for symbol: {symbol}")
                return None
            
            data = profile.iloc[0]
            
            # Get financial ratios
            try:
                ratios = self.vnstock.stock(symbol=symbol, source='VCI').finance.ratio(period='quarterly', lang='en')
                latest_ratio = ratios.iloc[0] if not ratios.empty else {}
            except:
                latest_ratio = {}
            
            return StockInfo(
                symbol=symbol,
                company_name=str(data.get('company_name', '')),
                exchange=str(data.get('exchange', '')),
                sector=str(data.get('sector', None)),
                industry=str(data.get('industry', None)),
                market_cap=float(data.get('market_cap', 0)) if data.get('market_cap') else None,
                listed_shares=int(data.get('listed_shares', 0)) if data.get('listed_shares') else None,
                eps=float(latest_ratio.get('eps', 0)) if latest_ratio.get('eps') else None,
                pe=float(latest_ratio.get('pe', 0)) if latest_ratio.get('pe') else None,
                pb=float(latest_ratio.get('pb', 0)) if latest_ratio.get('pb') else None,
                roe=float(latest_ratio.get('roe', 0)) if latest_ratio.get('roe') else None,
                roa=float(latest_ratio.get('roa', 0)) if latest_ratio.get('roa') else None
            )
            
        except Exception as e:
            logger.error(f"Error getting stock info for {symbol}: {e}")
            return None
    
    def get_stock_history(self, symbol: str, period: str = "1Y") -> Optional[StockHistory]:
        """Get historical stock data"""
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
            
            # Get historical data
            hist_data = self.vnstock.stock(symbol=symbol, source='VCI').quote.history(
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d')
            )
            
            if hist_data.empty:
                logger.warning(f"No historical data found for symbol: {symbol}")
                return None
            
            # Convert to our format
            history_list = []
            for _, row in hist_data.iterrows():
                history_list.append(StockHistoryData(
                    date=str(row['time']),
                    open=float(row['open']),
                    high=float(row['high']),
                    low=float(row['low']),
                    close=float(row['close']),
                    volume=int(row['volume']),
                    value=float(row['volume'] * row['close'])
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
            # Get VN-Index, HNX-Index, etc.
            indices_data = []
            
            for index_symbol in ['VNINDEX', 'HNXINDEX', 'UPCOM']:
                try:
                    index_data = self.vnstock.stock(symbol=index_symbol, source='VCI').quote.overview()
                    
                    if not index_data.empty:
                        data = index_data.iloc[0]
                        indices_data.append(MarketIndex(
                            index_name=index_symbol,
                            index_value=float(data.get('price', 0)),
                            change=float(data.get('change', 0)),
                            change_percent=float(data.get('change_percent', 0)),
                            volume=int(data.get('volume', 0)),
                            trading_date=str(data.get('trading_date', datetime.now().strftime('%Y-%m-%d')))
                        ))
                except Exception as e:
                    logger.error(f"Error getting index {index_symbol}: {e}")
                    continue
            
            return indices_data
            
        except Exception as e:
            logger.error(f"Error getting market indices: {e}")
            return []
    
    def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for stocks by company name or symbol"""
        try:
            # Get all listed companies
            companies = self.vnstock.listing_companies()
            
            if companies.empty:
                return []
            
            # Filter by query
            filtered = companies[
                companies['ticker'].str.contains(query.upper(), na=False) |
                companies['company_name'].str.contains(query, case=False, na=False)
            ].head(limit)
            
            result = []
            for _, row in filtered.iterrows():
                result.append({
                    'symbol': row['ticker'],
                    'company_name': row['company_name'],
                    'exchange': row['exchange']
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []

vnstock_service = VNStockService()
