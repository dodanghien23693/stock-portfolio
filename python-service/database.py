import psycopg2
import psycopg2.extras
from typing import List, Optional, Dict, Any
import pandas as pd
from datetime import datetime
import logging
from config import settings
from cuid import cuid

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
            
            # Generate ID for new stock if needed
            if 'id' not in stock_data:
                stock_data['id'] = cuid()
            
            # Update or insert current stock price
            # Note: Prisma converts camelCase to snake_case in PostgreSQL
            query = """
            INSERT INTO "Stock" (id, symbol, name, "currentPrice", "changeValue", "changePercent", 
                               volume, high, low, open, close, "tradingDate", "updatedAt", "createdAt")
            VALUES (%(id)s, %(symbol)s, %(name)s, %(price)s, %(change)s, %(change_percent)s, 
                   %(volume)s, %(high)s, %(low)s, %(open)s, %(close)s, %(trading_date)s, NOW(), NOW())
            ON CONFLICT (symbol) 
            DO UPDATE SET 
                "currentPrice" = EXCLUDED."currentPrice",
                "changeValue" = EXCLUDED."changeValue",
                "changePercent" = EXCLUDED."changePercent",
                volume = EXCLUDED.volume,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                open = EXCLUDED.open,
                close = EXCLUDED.close,
                "tradingDate" = EXCLUDED."tradingDate",
                "updatedAt" = NOW()
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
            # Fix: Cast date string to DATE for comparison
            delete_query = """
            DELETE FROM "StockHistory" 
            WHERE symbol = %s AND date::DATE < (CURRENT_DATE - INTERVAL '1 year')
            """
            cursor.execute(delete_query, (symbol,))
            
            # Insert new history data - generate cuid for each record
            insert_query = """
            INSERT INTO "StockHistory" (id, symbol, date, open, high, low, close, volume, value, "createdAt")
            VALUES (%(id)s, %(symbol)s, %(date)s, %(open)s, %(high)s, %(low)s, %(close)s, %(volume)s, %(value)s, NOW())
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
                data['id'] = cuid()  # Generate unique ID
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
            
            # Get symbols from stocks that are in any portfolio, using stockId to join with Stock table
            query = """
            SELECT DISTINCT s.symbol 
            FROM "PortfolioStock" ps
            INNER JOIN "Stock" s ON ps."stockId" = s.id
            INNER JOIN "Portfolio" p ON ps."portfolioId" = p.id
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
            
            # Use Prisma field names (camelCase converted to PostgreSQL)
            query = """
            UPDATE "Stock" 
            SET name = %(company_name)s,
                exchange = %(exchange)s,
                sector = %(sector)s,
                industry = %(industry)s,
                "marketCap" = %(market_cap)s,
                "listedShares" = %(listed_shares)s,
                eps = %(eps)s,
                pe = %(pe)s,
                pb = %(pb)s,
                roe = %(roe)s,
                roa = %(roa)s,
                "updatedAt" = NOW()
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
