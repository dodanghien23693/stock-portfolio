"""
Simple API Test for News Service
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_basic_endpoints():
    """Test basic endpoints"""
    print("🧪 Testing Basic News API Endpoints")
    print("=" * 50)
    
    endpoints = [
        ("/news/categories", "News Categories"),
        ("/news?limit=5", "All News (5 items)"),
        ("/news/cafef?limit=3", "CafeF News (3 items)"),
        ("/news/vnexpress?limit=3", "VnExpress News (3 items)"),
        ("/news/vnstock", "VnStock News"),
    ]
    
    results = []
    
    for endpoint, description in endpoints:
        print(f"\n📡 Testing: {description}")
        print(f"   URL: {BASE_URL}{endpoint}")
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=15)
            response_time = round((time.time() - start_time) * 1000, 2)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    count = len(data)
                elif isinstance(data, dict) and 'articles' in data:
                    count = len(data['articles'])
                    total = data.get('total', count)
                    print(f"   📊 Total available: {total}")
                else:
                    count = "dict"
                
                print(f"   ✅ Status: 200, Items: {count}, Time: {response_time}ms")
                results.append((description, True, count, response_time))
                
                # Show sample data for first endpoint
                if endpoint == "/news/categories" and isinstance(data, list) and data:
                    print(f"   📝 Sample: {data[0].get('name', 'N/A')}")
                elif isinstance(data, dict) and 'articles' in data and data['articles']:
                    article = data['articles'][0]
                    print(f"   📝 Sample: {article.get('title', 'N/A')[:50]}...")
                elif isinstance(data, list) and data:
                    item = data[0]
                    if isinstance(item, dict):
                        title = item.get('title', item.get('name', str(item)[:50]))
                        print(f"   📝 Sample: {title[:50]}...")
                
            else:
                print(f"   ❌ Status: {response.status_code}")
                results.append((description, False, 0, response_time))
                
        except requests.exceptions.Timeout:
            print(f"   ⏰ Timeout after 15 seconds")
            results.append((description, False, 0, 15000))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append((description, False, 0, 0))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, success, _, _ in results if success)
    total = len(results)
    
    for desc, success, count, time_ms in results:
        status = "✅" if success else "❌"
        print(f"{status} {desc}: {count} items, {time_ms}ms")
    
    print(f"\n🎯 Result: {passed}/{total} endpoints working ({round(passed/total*100, 1)}%)")
    
    return passed == total

def test_with_filters():
    """Test filtering functionality"""
    print("\n" + "=" * 50)
    print("🔍 Testing Filters")
    print("=" * 50)
    
    filters = [
        ("?category=market&limit=3", "Market category"),
        ("?sentiment=positive&limit=3", "Positive sentiment"),
        ("?symbols=VCB&limit=3", "VCB symbol"),
        ("?page=1&limit=5", "Pagination"),
    ]
    
    for filter_param, description in filters:
        print(f"\n🔍 Testing: {description}")
        
        try:
            response = requests.get(f"{BASE_URL}/news{filter_param}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                print(f"   ✅ {len(articles)} articles found")
                
                if articles:
                    sample = articles[0]
                    print(f"   📝 Sample: {sample.get('title', 'N/A')[:50]}...")
            else:
                print(f"   ❌ Status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Starting Simple News API Test")
    print(f"📅 Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    try:
        # Test if service is running
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"🏥 Health check: {response.status_code}")
        
        # Run tests
        basic_success = test_basic_endpoints()
        test_with_filters()
        
        print("\n" + "=" * 50)
        print("🏁 TEST COMPLETE")
        print("=" * 50)
        
        if basic_success:
            print("🎉 News API is working correctly!")
        else:
            print("⚠️  Some issues found. Check the results above.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Make sure it's running on port 8001")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
