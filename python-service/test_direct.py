#!/usr/bin/env python3

# Test vnstock service directly without FastAPI
import logging
logging.basicConfig(level=logging.DEBUG)

print("🐍 Testing vnstock_service directly...")

try:
    from vnstock_service import vnstock_service
    print("✅ VNStock service imported successfully")
    
    # Test health check
    health = vnstock_service.health_check()
    print(f"Health check: {health}")
    
    # Test search
    print("\n🔍 Testing search...")
    search_result = vnstock_service.search_stocks("VCB", 3)
    print(f"Search VCB: {search_result}")
    
    # Test get stock price
    print("\n💰 Testing stock price...")
    price = vnstock_service.get_stock_price("VCB")
    if price:
        print(f"VCB price: {price.__dict__}")
    else:
        print("VCB price: None")
    
    # Test stock info
    print("\n📊 Testing stock info...")
    info = vnstock_service.get_stock_info("VCB")
    if info:
        print(f"VCB info: {info.__dict__}")
    else:
        print("VCB info: None")
    
    print("\n✅ All tests completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
