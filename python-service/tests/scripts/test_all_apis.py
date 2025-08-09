#!/usr/bin/env python3
"""
Comprehensive API Testing Script for VNStock FastAPI Service
This script tests all endpoints with real requests and displays responses.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8001"
TEST_SYMBOLS = ["VCB", "VIC", "VHM", "MSN", "FPT"]  # Popular Vietnamese stocks
INVALID_SYMBOL = "INVALID123"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
    
    def print_header(self, title: str):
        """Print a formatted header"""
        print("\n" + "="*80)
        print(f"  {title}")
        print("="*80)
    
    def print_test_result(self, endpoint: str, method: str, status: int, 
                         response_time: float, data: Any = None, error: str = None):
        """Print formatted test result"""
        status_symbol = "✅" if 200 <= status < 300 else "❌"
        print(f"\n{status_symbol} {method} {endpoint}")
        print(f"   Status: {status} | Time: {response_time:.2f}s")
        
        if error:
            print(f"   Error: {error}")
        elif data:
            if isinstance(data, dict):
                print(f"   Response keys: {list(data.keys())}")
                # Print first few fields for readability
                for key, value in list(data.items())[:3]:
                    if isinstance(value, (str, int, float, bool)):
                        print(f"   {key}: {value}")
                    elif isinstance(value, list) and len(value) > 0:
                        print(f"   {key}: [{len(value)} items] - First: {value[0] if value else 'Empty'}")
            elif isinstance(data, list):
                print(f"   Response: List with {len(data)} items")
                if data:
                    print(f"   First item: {data[0]}")
        
        self.results.append({
            'endpoint': endpoint,
            'method': method,
            'status': status,
            'response_time': response_time,
            'success': 200 <= status < 300,
            'timestamp': datetime.now().isoformat()
        })
    
    def test_endpoint(self, endpoint: str, method: str = "GET", json_data: Dict = None):
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = self.session.get(url, timeout=30)
            elif method == "POST":
                response = self.session.post(url, json=json_data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response_time = time.time() - start_time
            
            try:
                data = response.json()
                self.print_test_result(endpoint, method, response.status_code, 
                                     response_time, data)
                return data
            except json.JSONDecodeError:
                self.print_test_result(endpoint, method, response.status_code, 
                                     response_time, response.text[:200])
                return None
                
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            self.print_test_result(endpoint, method, 0, response_time, error=str(e))
            return None
    
    def test_basic_endpoints(self):
        """Test basic health and info endpoints"""
        self.print_header("BASIC ENDPOINTS")
        
        # Root endpoint
        self.test_endpoint("/")
        
        # Health check
        self.test_endpoint("/health")
    
    def test_stock_price_endpoints(self):
        """Test stock price endpoints"""
        self.print_header("STOCK PRICE ENDPOINTS")
        
        # Test valid symbols
        for symbol in TEST_SYMBOLS[:3]:  # Test first 3 symbols
            self.test_endpoint(f"/stocks/{symbol}/price")
            time.sleep(0.5)  # Avoid rate limiting
        
        # Test invalid symbol
        self.test_endpoint(f"/stocks/{INVALID_SYMBOL}/price")
    
    def test_stock_info_endpoints(self):
        """Test stock info endpoints"""
        self.print_header("STOCK INFO ENDPOINTS")
        
        # Test valid symbols
        for symbol in TEST_SYMBOLS[:2]:  # Test first 2 symbols
            self.test_endpoint(f"/stocks/{symbol}/info")
            time.sleep(0.5)
        
        # Test invalid symbol
        self.test_endpoint(f"/stocks/{INVALID_SYMBOL}/info")
    
    def test_stock_history_endpoints(self):
        """Test stock history endpoints"""
        self.print_header("STOCK HISTORY ENDPOINTS")
        
        # Test different periods
        periods = ["1M", "3M", "1Y"]
        symbol = TEST_SYMBOLS[0]  # Use first symbol
        
        for period in periods:
            self.test_endpoint(f"/stocks/{symbol}/history?period={period}")
            time.sleep(0.5)
        
        # Test invalid symbol
        self.test_endpoint(f"/stocks/{INVALID_SYMBOL}/history")
    
    def test_market_endpoints(self):
        """Test market-related endpoints"""
        self.print_header("MARKET ENDPOINTS")
        
        # Market indices
        self.test_endpoint("/market/indices")
        
        # Stock search
        search_queries = ["VCB", "Vietcombank", "ngân hàng"]
        for query in search_queries:
            self.test_endpoint(f"/stocks/search?q={query}&limit=5")
            time.sleep(0.3)
    
    def test_sync_endpoints(self):
        """Test sync endpoints"""
        self.print_header("SYNC ENDPOINTS")
        
        # Sync specific stocks
        sync_data = {
            "symbols": ["VCB", "VIC"],
            "period": "1M"
        }
        self.test_endpoint("/sync/stocks", "POST", sync_data)
        
        # Sync tracked stocks
        self.test_endpoint("/sync/tracked-stocks", "POST")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting comprehensive API testing...")
        print(f"Target URL: {self.base_url}")
        print(f"Test symbols: {TEST_SYMBOLS}")
        
        start_time = time.time()
        
        # Run all test categories
        self.test_basic_endpoints()
        self.test_stock_price_endpoints()
        self.test_stock_info_endpoints()
        self.test_stock_history_endpoints()
        self.test_market_endpoints()
        self.test_sync_endpoints()
        
        # Print summary
        self.print_summary(time.time() - start_time)
    
    def print_summary(self, total_time: float):
        """Print test summary"""
        self.print_header("TEST SUMMARY")
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - successful_tests
        
        print(f"Total tests: {total_tests}")
        print(f"✅ Successful: {successful_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"🕐 Total time: {total_time:.2f}s")
        print(f"📊 Success rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed tests:")
            for result in self.results:
                if not result['success']:
                    print(f"   {result['method']} {result['endpoint']} - Status: {result['status']}")
    
    def save_results(self, filename: str = "api_test_results.json"):
        """Save test results to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'test_symbols': TEST_SYMBOLS,
                'results': self.results
            }, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Results saved to {filename}")

def check_service_availability():
    """Check if the service is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    """Main function"""
    print("🧪 VNStock API Comprehensive Testing Tool")
    print("=" * 50)
    
    # Check if service is running
    if not check_service_availability():
        print(f"❌ Service not available at {BASE_URL}")
        print("Please start the Python service first:")
        print("   cd python-service")
        print("   python main.py")
        return
    
    print(f"✅ Service is running at {BASE_URL}")
    
    # Create tester and run tests
    tester = APITester(BASE_URL)
    tester.run_all_tests()
    
    # Save results
    tester.save_results()
    
    print("\n🎉 Testing completed!")

if __name__ == "__main__":
    main()
