#!/usr/bin/env python3
"""
Verify database data after successful operations
"""
from database import db_service
import psycopg2
from config import settings

def verify_database_data():
    """Verify the data was inserted correctly"""
    print("🔍 Verifying Database Data...")
    
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()
        
        # Check Stock table
        print("\n📊 Stock Table Data:")
        cursor.execute('SELECT symbol, name, "currentPrice", "changePercent", "tradingDate" FROM "Stock" WHERE symbol = %s', ('VCB',))
        stock_data = cursor.fetchone()
        if stock_data:
            print(f"   Symbol: {stock_data[0]}")
            print(f"   Name: {stock_data[1]}")
            print(f"   Current Price: {stock_data[2]}")
            print(f"   Change %: {stock_data[3]}")
            print(f"   Trading Date: {stock_data[4]}")
        else:
            print("   No stock data found")
        
        # Check StockHistory table
        print("\n📈 StockHistory Table Data:")
        cursor.execute('SELECT symbol, date, close, volume FROM "StockHistory" WHERE symbol = %s ORDER BY date DESC LIMIT 3', ('VCB',))
        history_data = cursor.fetchall()
        if history_data:
            for record in history_data:
                print(f"   {record[0]} | {record[1]} | Close: {record[2]} | Volume: {record[3]}")
        else:
            print("   No history data found")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Database verification completed!")
        
    except Exception as e:
        print(f"❌ Error verifying database: {e}")

if __name__ == "__main__":
    verify_database_data()
