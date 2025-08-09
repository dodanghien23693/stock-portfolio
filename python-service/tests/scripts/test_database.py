#!/usr/bin/env python3
"""
Test database operations after fixing column names
"""
from database import db_service
from vnstock_service import vnstock_service

def test_database_operations():
    """Test database CRUD operations"""
    print("🧪 Testing Database Operations...")
    
    # Test 1: Get tracked symbols
    print("\n1️⃣ Testing get_tracked_symbols()...")
    try:
        symbols = db_service.get_tracked_symbols()
        print(f"   ✅ Found {len(symbols)} tracked symbols: {symbols[:5]}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Get stock price and update database
    print("\n2️⃣ Testing stock price update...")
    test_symbol = "VCB"
    
    try:
        # Get price from vnstock
        price_data = vnstock_service.get_stock_price(test_symbol)
        print(f"   📊 Got price data for {test_symbol}: {price_data}")
        
        if price_data:
            # Convert StockPrice object to dict for database
            price_dict = {
                'symbol': test_symbol,
                'name': f'{test_symbol} Stock',  # Provide a name
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
            
            # Try to update stock price
            result = db_service.update_stock_price(price_dict)
            if result:
                print(f"   ✅ Successfully updated {test_symbol} price in database")
            else:
                print(f"   ❌ Failed to update {test_symbol} price in database")
        
    except Exception as e:
        print(f"   ❌ Error updating stock price: {e}")
    
    # Test 3: Insert stock history
    print("\n3️⃣ Testing stock history insert...")
    try:
        # Get historical data (using period instead of dates)
        history_data = vnstock_service.get_stock_history(test_symbol, "1M")
        print(f"   📈 Got history data: {len(history_data.data) if history_data else 0} records")
        
        if history_data and history_data.data:
            # Try to insert first few records
            sample_records = history_data.data[:3]  # First 3 records
            # Convert StockHistoryData objects to dicts
            record_dicts = []
            for record in sample_records:
                record_dicts.append({
                    'date': record.date,
                    'open': record.open,
                    'high': record.high,
                    'low': record.low,
                    'close': record.close,
                    'volume': record.volume,
                    'value': record.value
                })
            
            result = db_service.insert_stock_history(test_symbol, record_dicts)
            if result:
                print(f"   ✅ Successfully inserted {len(record_dicts)} history records for {test_symbol}")
            else:
                print(f"   ❌ Failed to insert history records for {test_symbol}")
        
    except Exception as e:
        print(f"   ❌ Error inserting stock history: {e}")
    
    print("\n🏁 Database tests completed!")

if __name__ == "__main__":
    test_database_operations()
