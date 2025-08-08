import psycopg2
import psycopg2.extras
from typing import List, Optional, Dict, Any
import pandas as pd
from datetime import datetime
import logging
from config import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.connection_string = settings.DATABASE_URL
        
    def get_connection(self):
        """Get database connection"""
        try:
            conn = psycopg2.connect(self.connection_string)
            return conn
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    def update_stock_price(self, stock_data: Dict[str, Any]) -> bool:
        """Update current stock price in database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Update or insert current stock price
            query = """
            INSERT INTO "Stock" (symbol, name, current_price, change_value, change_percent, 
                               volume, high, low, open, close, trading_date, updated_at)
            VALUES (%(symbol)s, %(name)s, %(price)s, %(change)s, %(change_percent)s, 
                   %(volume)s, %(high)s, %(low)s, %(open)s, %(close)s, %(trading_date)s, NOW())
            ON CONFLICT (symbol) 
            DO UPDATE SET 
                current_price = EXCLUDED.current_price,
                change_value = EXCLUDED.change_value,
                change_percent = EXCLUDED.change_percent,
                volume = EXCLUDED.volume,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                open = EXCLUDED.open,
                close = EXCLUDED.close,
                trading_date = EXCLUDED.trading_date,
                updated_at = NOW()
            """
            
            cursor.execute(query, stock_data)
            conn.commit()
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error updating stock price: {e}")
            return False
    
    def insert_stock_history(self, symbol: str, history_data: List[Dict[str, Any]]) -> bool:
        """Insert stock history data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Clear existing history for this symbol (or keep last 1 year)
            delete_query = """
            DELETE FROM "StockHistory" 
            WHERE symbol = %s AND date < (CURRENT_DATE - INTERVAL '1 year')
            """
            cursor.execute(delete_query, (symbol,))
            
            # Insert new history data
            insert_query = """
            INSERT INTO "StockHistory" (symbol, date, open, high, low, close, volume, value)
            VALUES (%(symbol)s, %(date)s, %(open)s, %(high)s, %(low)s, %(close)s, %(volume)s, %(value)s)
            ON CONFLICT (symbol, date) 
            DO UPDATE SET 
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                value = EXCLUDED.value
            """
            
            for data in history_data:
                data['symbol'] = symbol
                cursor.execute(insert_query, data)
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error inserting stock history: {e}")
            return False
    
    def get_tracked_symbols(self) -> List[str]:
        """Get list of symbols being tracked in portfolios"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            query = """
            SELECT DISTINCT ps.symbol 
            FROM "PortfolioStock" ps
            INNER JOIN "Portfolio" p ON ps.portfolio_id = p.id
            WHERE p.deleted_at IS NULL
            """
            
            cursor.execute(query)
            symbols = [row[0] for row in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            return symbols
            
        except Exception as e:
            logger.error(f"Error getting tracked symbols: {e}")
            return []
    
    def update_stock_info(self, symbol: str, info_data: Dict[str, Any]) -> bool:
        """Update stock company information"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            query = """
            UPDATE "Stock" 
            SET name = %(company_name)s,
                exchange = %(exchange)s,
                sector = %(sector)s,
                industry = %(industry)s,
                market_cap = %(market_cap)s,
                listed_shares = %(listed_shares)s,
                eps = %(eps)s,
                pe = %(pe)s,
                pb = %(pb)s,
                roe = %(roe)s,
                roa = %(roa)s,
                updated_at = NOW()
            WHERE symbol = %(symbol)s
            """
            
            info_data['symbol'] = symbol
            cursor.execute(query, info_data)
            conn.commit()
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error updating stock info: {e}")
            return False

db_service = DatabaseService()
