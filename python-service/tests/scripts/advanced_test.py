#!/usr/bin/env python3
"""
Advanced API Testing - Performance and Edge Cases
"""

import requests
import json
import time
import concurrent.futures
from datetime import datetime
from typing import List, Dict

BASE_URL = "http://localhost:8001"

class AdvancedAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
    
    def test_concurrent_requests(self, num_requests: int = 10):
        """Test concurrent API requests"""
        print(f"\n🔄 Testing {num_requests} concurrent requests...")
        
        def make_request(symbol):
            start_time = time.time()
            try:
                response = self.session.get(f"{self.base_url}/stocks/{symbol}/price", timeout=10)
                return {
                    'symbol': symbol,
                    'status': response.status_code,
                    'time': time.time() - start_time,
                    'success': response.status_code == 200
                }
            except Exception as e:
                return {
                    'symbol': symbol,
                    'status': 0,
                    'time': time.time() - start_time,
                    'success': False,
                    'error': str(e)
                }
        
        symbols = ['VCB', 'VIC', 'VHM', 'MSN', 'FPT'] * (num_requests // 5 + 1)
        symbols = symbols[:num_requests]
        
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(make_request, symbols))
        
        total_time = time.time() - start_time
        successful = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['time'] for r in results) / len(results)
        
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Successful requests: {successful}/{num_requests}")
        print(f"   Average response time: {avg_response_time:.2f}s")
        print(f"   Requests per second: {num_requests/total_time:.2f}")
        
        return results
    
    def test_data_accuracy(self):
        """Test data accuracy and completeness"""
        print("\n📊 Testing data accuracy...")
        
        # Test stock price data completeness
        response = requests.get(f"{self.base_url}/stocks/VCB/price")
        if response.status_code == 200:
            data = response.json()
            required_fields = ['symbol', 'price', 'change', 'change_percent', 'volume', 'high', 'low', 'open', 'close']
            missing_fields = [field for field in required_fields if field not in data or data[field] is None]
            
            print(f"   Stock Price Data:")
            print(f"   - All required fields present: {len(missing_fields) == 0}")
            if missing_fields:
                print(f"   - Missing fields: {missing_fields}")
            print(f"   - Price: {data.get('price')} VND")
            print(f"   - Volume: {data.get('volume'):,} shares")
        
        # Test historical data
        response = requests.get(f"{self.base_url}/stocks/VCB/history?period=1M")
        if response.status_code == 200:
            data = response.json()
            history_data = data.get('data', [])
            
            print(f"   Historical Data:")
            print(f"   - Records found: {len(history_data)}")
            if history_data:
                latest = history_data[-1]
                print(f"   - Latest date: {latest.get('date')}")
                print(f"   - Latest close: {latest.get('close')}")
    
    def test_error_handling(self):
        """Test error handling"""
        print("\n🚨 Testing error handling...")
        
        # Test invalid symbol
        response = requests.get(f"{self.base_url}/stocks/INVALID999/price")
        print(f"   Invalid symbol response: {response.status_code}")
        
        # Test malformed requests
        test_cases = [
            ("/stocks//price", "Empty symbol"),
            ("/stocks/VCB/history?period=INVALID", "Invalid period"),
            ("/stocks/search?q=", "Empty search query"),
        ]
        
        for endpoint, description in test_cases:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                print(f"   {description}: {response.status_code}")
            except Exception as e:
                print(f"   {description}: Error - {e}")
    
    def test_response_times(self):
        """Test response times for different endpoints"""
        print("\n⏱️  Testing response times...")
        
        endpoints = [
            ("/health", "Health check"),
            ("/stocks/VCB/price", "Stock price"),
            ("/stocks/VCB/info", "Stock info"),
            ("/stocks/VCB/history?period=1M", "1M history"),
            ("/market/indices", "Market indices"),
            ("/stocks/search?q=VCB", "Stock search")
        ]
        
        for endpoint, name in endpoints:
            times = []
            for i in range(3):  # Test 3 times for average
                start_time = time.time()
                try:
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                    response_time = time.time() - start_time
                    times.append(response_time)
                except Exception as e:
                    print(f"   {name}: Error - {e}")
                    break
            
            if times:
                avg_time = sum(times) / len(times)
                print(f"   {name}: {avg_time:.3f}s (avg of {len(times)} requests)")
    
    def test_data_consistency(self):
        """Test data consistency across multiple calls"""
        print("\n🔍 Testing data consistency...")
        
        # Get price data multiple times
        prices = []
        for i in range(3):
            response = requests.get(f"{self.base_url}/stocks/VCB/price")
            if response.status_code == 200:
                data = response.json()
                prices.append(data.get('price'))
            time.sleep(1)
        
        print(f"   Price consistency test:")
        print(f"   - Prices collected: {prices}")
        print(f"   - All same: {len(set(prices)) == 1}")
        
        # Test symbol search consistency
        search_results = []
        for query in ['VCB', 'vcb', 'Vcb']:
            response = requests.get(f"{self.base_url}/stocks/search?q={query}")
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                search_results.append(len(results))
        
        print(f"   Search consistency test:")
        print(f"   - Results count for [VCB, vcb, Vcb]: {search_results}")
    
    def test_market_data_quality(self):
        """Test market data quality"""
        print("\n📈 Testing market data quality...")
        
        # Test market indices
        response = requests.get(f"{self.base_url}/market/indices")
        if response.status_code == 200:
            indices = response.json()
            print(f"   Market indices:")
            print(f"   - Total indices: {len(indices)}")
            
            for idx in indices:
                name = idx.get('index_name', 'Unknown')
                value = idx.get('index_value', 0)
                change = idx.get('change_percent', 0)
                print(f"   - {name}: {value} ({change:+.2f}%)")
        
        # Test search functionality
        search_queries = ['ngân hàng', 'bank', 'VCB', 'technology']
        for query in search_queries:
            response = requests.get(f"{self.base_url}/stocks/search?q={query}&limit=3")
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                print(f"   Search '{query}': {len(results)} results")
    
    def test_sync_functionality(self):
        """Test sync functionality"""
        print("\n🔄 Testing sync functionality...")
        
        # Test manual sync
        sync_data = {
            "symbols": ["VCB"],
            "period": "1M"
        }
        
        start_time = time.time()
        response = requests.post(f"{self.base_url}/sync/stocks", json=sync_data)
        response_time = time.time() - start_time
        
        print(f"   Manual sync:")
        print(f"   - Status: {response.status_code}")
        print(f"   - Response time: {response_time:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   - Success: {data.get('success')}")
            print(f"   - Message: {data.get('message')}")
        
        # Test tracked stocks sync
        response = requests.post(f"{self.base_url}/sync/tracked-stocks")
        print(f"   Tracked stocks sync: {response.status_code}")

def main():
    print("🔬 Advanced API Testing Suite")
    print("=" * 50)
    
    # Check if service is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Service not healthy")
            return
    except:
        print("❌ Service not available")
        return
    
    print("✅ Service is running and healthy")
    
    tester = AdvancedAPITester()
    
    # Run all advanced tests
    tester.test_response_times()
    tester.test_data_accuracy() 
    tester.test_data_consistency()
    tester.test_market_data_quality()
    tester.test_error_handling()
    tester.test_concurrent_requests(10)
    tester.test_sync_functionality()
    
    print("\n🎯 Advanced testing completed!")
    print("\nSummary:")
    print("- Response times measured")
    print("- Data accuracy verified")
    print("- Error handling tested")
    print("- Concurrent requests tested")
    print("- Sync functionality tested")

if __name__ == "__main__":
    main()
