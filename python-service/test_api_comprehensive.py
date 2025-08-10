"""
API Test Script for Stock News Service
Test all news endpoints and verify responses
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8001"

def test_endpoint(endpoint, description, expected_fields=None):
    """Test a single endpoint"""
    print(f"\n🧪 Testing {description}")
    print(f"   Endpoint: {endpoint}")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        response_time = round((time.time() - start_time) * 1000, 2)
        
        print(f"   ⏱️  Response time: {response_time}ms")
        print(f"   📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                print(f"   📄 Response: Array with {len(data)} items")
                if data and expected_fields:
                    sample = data[0]
                    missing_fields = [field for field in expected_fields if field not in sample]
                    if missing_fields:
                        print(f"   ⚠️  Missing fields: {missing_fields}")
                    else:
                        print(f"   ✅ All expected fields present")
                        
            elif isinstance(data, dict):
                if 'articles' in data:
                    articles = data['articles']
                    total = data.get('total', len(articles))
                    page = data.get('page', 1)
                    per_page = data.get('per_page', len(articles))
                    
                    print(f"   📄 Response: {len(articles)} articles (page {page}, total {total})")
                    
                    if articles and expected_fields:
                        sample = articles[0]
                        missing_fields = [field for field in expected_fields if field not in sample]
                        if missing_fields:
                            print(f"   ⚠️  Missing fields: {missing_fields}")
                        else:
                            print(f"   ✅ All expected fields present")
                else:
                    print(f"   📄 Response: Dict with keys {list(data.keys())}")
            
            return True, data
            
        else:
            print(f"   ❌ Error: HTTP {response.status_code}")
            print(f"   📄 Response: {response.text[:200]}...")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False, None
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False, None

def run_comprehensive_test():
    """Run comprehensive API tests"""
    print("🚀 Starting Comprehensive News API Tests")
    print("=" * 60)
    
    # Expected fields for news articles
    article_fields = [
        'id', 'title', 'summary', 'url', 'source', 
        'publish_date', 'category', 'related_symbols', 
        'sentiment', 'impact_score', 'tags'
    ]
    
    # Category fields
    category_fields = ['id', 'name']
    
    test_results = []
    
    # Test 1: Get all news
    success, data = test_endpoint(
        "/news?limit=5", 
        "Get all news (limit 5)", 
        article_fields
    )
    test_results.append(("All News", success))
    
    # Test 2: Get news categories
    success, data = test_endpoint(
        "/news/categories", 
        "Get news categories", 
        category_fields
    )
    test_results.append(("Categories", success))
    
    # Test 3: CafeF RSS news
    success, data = test_endpoint(
        "/news/cafef?limit=3", 
        "CafeF RSS news (limit 3)", 
        article_fields
    )
    test_results.append(("CafeF RSS", success))
    
    # Test 4: VnExpress RSS news  
    success, data = test_endpoint(
        "/news/vnexpress?limit=3", 
        "VnExpress RSS news (limit 3)", 
        article_fields
    )
    test_results.append(("VnExpress RSS", success))
    
    # Test 5: VnStock news
    success, data = test_endpoint(
        "/news/vnstock", 
        "VnStock news", 
        article_fields
    )
    test_results.append(("VnStock", success))
    
    # Test 6: Filter by category
    success, data = test_endpoint(
        "/news?category=market&limit=3", 
        "Filter by market category", 
        article_fields
    )
    test_results.append(("Filter by Category", success))
    
    # Test 7: Filter by sentiment
    success, data = test_endpoint(
        "/news?sentiment=positive&limit=3", 
        "Filter by positive sentiment", 
        article_fields
    )
    test_results.append(("Filter by Sentiment", success))
    
    # Test 8: Filter by symbols
    success, data = test_endpoint(
        "/news?symbols=VCB,VNM&limit=3", 
        "Filter by symbols (VCB, VNM)", 
        article_fields
    )
    test_results.append(("Filter by Symbols", success))
    
    # Test 9: Pagination
    success, data = test_endpoint(
        "/news?page=1&limit=5", 
        "Pagination (page 1, limit 5)", 
        article_fields
    )
    test_results.append(("Pagination", success))
    
    # Test 10: Combined filters
    success, data = test_endpoint(
        "/news?category=stocks&sentiment=positive&limit=2", 
        "Combined filters (stocks + positive)", 
        article_fields
    )
    test_results.append(("Combined Filters", success))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success in test_results if success)
    total = len(test_results)
    
    for test_name, success in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({round(passed/total*100, 1)}%)")
    
    if passed == total:
        print("🎉 All tests passed! News API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    return passed == total

def test_data_quality():
    """Test data quality and consistency"""
    print("\n" + "=" * 60)
    print("🔍 DATA QUALITY TESTS")
    print("=" * 60)
    
    try:
        # Get sample data
        response = requests.get(f"{BASE_URL}/news?limit=10")
        if response.status_code != 200:
            print("❌ Could not fetch sample data")
            return False
            
        data = response.json()
        articles = data.get('articles', [])
        
        if not articles:
            print("❌ No articles found")
            return False
            
        print(f"📊 Testing {len(articles)} articles for data quality...")
        
        issues = []
        
        for i, article in enumerate(articles):
            # Check required fields
            required_fields = ['id', 'title', 'source', 'publish_date']
            for field in required_fields:
                if not article.get(field):
                    issues.append(f"Article {i+1}: Missing or empty '{field}'")
            
            # Check sentiment values
            sentiment = article.get('sentiment')
            if sentiment and sentiment not in ['positive', 'negative', 'neutral']:
                issues.append(f"Article {i+1}: Invalid sentiment '{sentiment}'")
            
            # Check impact score
            impact_score = article.get('impact_score')
            if impact_score is not None and (impact_score < 0 or impact_score > 100):
                issues.append(f"Article {i+1}: Invalid impact_score {impact_score}")
            
            # Check symbols format
            symbols = article.get('related_symbols', [])
            if symbols and not isinstance(symbols, list):
                issues.append(f"Article {i+1}: related_symbols should be array")
        
        if issues:
            print("⚠️  Data quality issues found:")
            for issue in issues[:10]:  # Show first 10 issues
                print(f"   - {issue}")
            if len(issues) > 10:
                print(f"   - ... and {len(issues) - 10} more issues")
            return False
        else:
            print("✅ All data quality checks passed!")
            return True
            
    except Exception as e:
        print(f"❌ Error during data quality test: {e}")
        return False

def test_performance():
    """Test API performance"""
    print("\n" + "=" * 60)
    print("⚡ PERFORMANCE TESTS")
    print("=" * 60)
    
    endpoints = [
        "/news?limit=5",
        "/news/categories", 
        "/news/cafef?limit=3",
        "/news/vnexpress?limit=3"
    ]
    
    results = []
    
    for endpoint in endpoints:
        times = []
        
        print(f"🏃 Testing {endpoint}...")
        
        for i in range(3):  # 3 runs each
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    times.append(response_time)
                else:
                    print(f"   Run {i+1}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   Run {i+1}: Error - {e}")
        
        if times:
            avg_time = round(sum(times) / len(times), 2)
            min_time = round(min(times), 2)
            max_time = round(max(times), 2)
            
            print(f"   📊 Avg: {avg_time}ms, Min: {min_time}ms, Max: {max_time}ms")
            results.append((endpoint, avg_time))
            
            if avg_time > 5000:  # > 5 seconds
                print(f"   ⚠️  Slow response time: {avg_time}ms")
            elif avg_time > 2000:  # > 2 seconds  
                print(f"   🐌 Moderate response time: {avg_time}ms")
            else:
                print(f"   ⚡ Good response time: {avg_time}ms")
        else:
            print(f"   ❌ All requests failed")
            results.append((endpoint, None))
    
    print(f"\n📈 Performance Summary:")
    for endpoint, avg_time in results:
        if avg_time:
            print(f"   {endpoint}: {avg_time}ms")
        else:
            print(f"   {endpoint}: FAILED")

if __name__ == "__main__":
    print(f"📅 Starting tests at {datetime.now()}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    try:
        # Check if service is running
        response = requests.get(f"{BASE_URL}/news/categories", timeout=5)
        if response.status_code != 200:
            print("❌ Service not responding. Make sure Python service is running on port 8001")
            exit(1)
            
        # Run all tests
        api_success = run_comprehensive_test()
        data_success = test_data_quality()
        test_performance()
        
        print("\n" + "=" * 60)
        print("🏁 FINAL RESULTS")
        print("=" * 60)
        
        if api_success and data_success:
            print("🎉 All tests passed! News API is ready for production.")
        else:
            print("⚠️  Some issues found. Please review the test results.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Make sure Python service is running on port 8001")
    except KeyboardInterrupt:
        print("\n👋 Tests interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
