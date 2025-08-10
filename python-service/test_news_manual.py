#!/usr/bin/env python3
"""
Simple test script for NewsService
Run this to test news functionality manually
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.news_service import NewsService
from app.models import NewsFilter
import json
from datetime import datetime

def test_news_service():
    """Test NewsService functionality"""
    print("=" * 60)
    print("TESTING NEWSSERVICE")
    print("=" * 60)
    
    # Initialize service
    news_service = NewsService()
    print("✓ NewsService initialized")
    
    # Test 1: Check categories
    print("\n1. Testing categories...")
    categories = news_service.get_categories()
    print(f"✓ Found {len(categories)} categories:")
    for cat in categories:
        print(f"  - {cat.id}: {cat.name}")
    
    # Test 2: Test sentiment analysis
    print("\n2. Testing sentiment analysis...")
    test_cases = [
        ("VCB tăng mạnh sau kết quả tích cực", "Lợi nhuận tăng trưởng"),
        ("Thị trường giảm do lo ngại", "Khó khăn và rủi ro"),
        ("Báo cáo thị trường", "Tổng quan diễn biến")
    ]
    
    for title, summary in test_cases:
        sentiment, score = news_service._analyze_sentiment(title, summary)
        print(f"  '{title}' -> {sentiment} ({score}%)")
    
    # Test 3: Test stock symbol extraction
    print("\n3. Testing stock symbol extraction...")
    test_text = "VCB, VNM và HPG đều tăng mạnh. USD không phải cổ phiếu."
    symbols = news_service._extract_stock_symbols(test_text)
    print(f"  Text: {test_text}")
    print(f"  Symbols: {symbols}")
    
    # Test 4: Test CafeF RSS
    print("\n4. Testing CafeF RSS feed...")
    try:
        cafef_articles = news_service.get_news_from_cafef(limit=3)
        print(f"✓ Retrieved {len(cafef_articles)} articles from CafeF")
        for i, article in enumerate(cafef_articles[:2], 1):
            print(f"  {i}. {article.title[:60]}...")
            print(f"     Source: {article.source}, Category: {article.category}")
            print(f"     Sentiment: {article.sentiment}, Impact: {article.impact_score}%")
            print(f"     Symbols: {article.related_symbols}")
    except Exception as e:
        print(f"❌ CafeF test failed: {e}")
    
    # Test 5: Test VnExpress RSS
    print("\n5. Testing VnExpress RSS feed...")
    try:
        vnexpress_articles = news_service.get_news_from_vnexpress(limit=3)
        print(f"✓ Retrieved {len(vnexpress_articles)} articles from VnExpress")
        for i, article in enumerate(vnexpress_articles[:2], 1):
            print(f"  {i}. {article.title[:60]}...")
            print(f"     Source: {article.source}, Category: {article.category}")
            print(f"     Sentiment: {article.sentiment}, Impact: {article.impact_score}%")
            print(f"     Symbols: {article.related_symbols}")
    except Exception as e:
        print(f"❌ VnExpress test failed: {e}")
    
    # Test 6: Test VNStock (may not work without proper setup)
    print("\n6. Testing VNStock...")
    try:
        vnstock_articles = news_service.get_stock_news_from_vnstock()
        print(f"✓ Retrieved {len(vnstock_articles)} articles from VNStock")
        if vnstock_articles:
            article = vnstock_articles[0]
            print(f"  Sample: {article.title[:60]}...")
    except Exception as e:
        print(f"❌ VNStock test failed: {e}")
    
    # Test 7: Test get_all_news
    print("\n7. Testing get_all_news...")
    try:
        filters = NewsFilter(limit=5)
        response = news_service.get_all_news(filters)
        print(f"✓ Retrieved {len(response.articles)} articles total")
        print(f"  Total available: {response.total}")
        print(f"  Page: {response.page}, Per page: {response.per_page}")
        
        # Show sources breakdown
        sources = {}
        for article in response.articles:
            sources[article.source] = sources.get(article.source, 0) + 1
        print(f"  Sources: {sources}")
        
    except Exception as e:
        print(f"❌ get_all_news test failed: {e}")
    
    # Test 8: Test filtering
    print("\n8. Testing filters...")
    try:
        # Test category filter
        market_filter = NewsFilter(category='market', limit=3)
        market_response = news_service.get_all_news(market_filter)
        print(f"✓ Market category: {len(market_response.articles)} articles")
        
        # Test symbol filter  
        symbol_filter = NewsFilter(symbols=['VCB'], limit=3)
        symbol_response = news_service.get_all_news(symbol_filter)
        print(f"✓ VCB symbol: {len(symbol_response.articles)} articles")
        
        # Test sentiment filter
        positive_filter = NewsFilter(sentiment='positive', limit=3)
        positive_response = news_service.get_all_news(positive_filter)
        print(f"✓ Positive sentiment: {len(positive_response.articles)} articles")
        
    except Exception as e:
        print(f"❌ Filter test failed: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)

def test_api_endpoints():
    """Test API endpoints using requests"""
    print("\n" + "=" * 60)
    print("TESTING API ENDPOINTS")
    print("=" * 60)
    
    import requests
    base_url = "http://localhost:8001"
    
    endpoints = [
        "/news/categories",
        "/news/cafef?limit=3",
        "/news/vnexpress?limit=3", 
        "/news/vnstock",
        "/news?limit=5"
    ]
    
    for endpoint in endpoints:
        try:
            url = base_url + endpoint
            print(f"\nTesting {endpoint}...")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✓ Status 200, {len(data)} items")
                else:
                    print(f"✓ Status 200, response: {type(data)}")
                    if hasattr(data, 'get'):
                        total = data.get('total', 'N/A')
                        articles = data.get('articles', [])
                        print(f"  Total: {total}, Articles: {len(articles) if isinstance(articles, list) else 'N/A'}")
            else:
                print(f"❌ Status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    try:
        # Test service directly
        test_news_service()
        
        # Test API endpoints
        test_api_endpoints()
        
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
