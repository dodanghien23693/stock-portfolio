#!/usr/bin/env python3
"""
Quick API Testing Script - Tests core functionality
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"

def test_api():
    print("🚀 Quick API Test for VNStock Service")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Health Check:")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 2: Root endpoint
    print("\n2. Root Endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Stock price
    print("\n3. Stock Price (VCB):")
    try:
        response = requests.get(f"{BASE_URL}/stocks/VCB/price", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Symbol: {data.get('symbol')}")
            print(f"   Price: {data.get('price')}")
            print(f"   Change: {data.get('change')} ({data.get('change_percent')}%)")
            print(f"   Volume: {data.get('volume')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Stock info
    print("\n4. Stock Info (VCB):")
    try:
        response = requests.get(f"{BASE_URL}/stocks/VCB/info", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Company: {data.get('company_name')}")
            print(f"   Exchange: {data.get('exchange')}")
            print(f"   Sector: {data.get('sector')}")
            print(f"   Market Cap: {data.get('market_cap')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Market indices
    print("\n5. Market Indices:")
    try:
        response = requests.get(f"{BASE_URL}/market/indices", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data)} indices")
            for idx in data[:3]:  # Show first 3
                print(f"   - {idx.get('name')}: {idx.get('value')} ({idx.get('change_percent')}%)")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Stock search
    print("\n6. Stock Search:")
    try:
        response = requests.get(f"{BASE_URL}/stocks/search?q=VCB&limit=3", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"   Found {len(results)} results:")
            for result in results:
                print(f"   - {result}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ Quick test completed!")

if __name__ == "__main__":
    test_api()
