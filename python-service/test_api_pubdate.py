#!/usr/bin/env python3
"""Test API endpoints để kiểm tra publish_date parsing"""

import requests
import json
from datetime import datetime

def test_news_api():
    base_url = "http://localhost:8001"
    
    print("=== Testing News API with pubDate parsing ===")
    
    try:
        # Test news endpoint
        response = requests.get(f"{base_url}/news", params={"limit": 5})
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Response: {response.status_code}")
            print(f"📰 Total articles: {data.get('total', 0)}")
            
            articles = data.get('articles', [])
            if articles:
                print("\n🔍 Sample articles with publish dates:")
                for i, article in enumerate(articles[:3], 1):
                    print(f"\n{i}. {article.get('title', 'N/A')[:80]}...")
                    print(f"   📅 Publish Date: {article.get('publish_date', 'N/A')}")
                    print(f"   📺 Source: {article.get('source', 'N/A')}")
                    print(f"   🔗 Link: {article.get('link', 'N/A')}")
                    print(f"   📎 URL: {article.get('url', 'N/A')}")
                    
                    # Check if date is valid
                    try:
                        if article.get('publish_date'):
                            # Try parsing the date
                            pub_date = datetime.fromisoformat(article['publish_date'].replace('Z', '+00:00'))
                            print(f"   ✅ Date parsed successfully: {pub_date}")
                        else:
                            print(f"   ❌ No publish_date found")
                    except Exception as e:
                        print(f"   ❌ Date parsing error: {e}")
            else:
                print("❌ No articles returned")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_news_api()
