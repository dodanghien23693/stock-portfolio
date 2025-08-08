import requests
import json
import time

# Test URLs
BASE_URL = "http://localhost:8001"
ENDPOINTS = [
    "/health",
    "/stocks/VCB/price", 
    "/stocks/VCB/info",
    "/market/indices"
]

def test_endpoint(endpoint):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        print(f"⏳ Testing: {endpoint}")
        start_time = time.time()
        
        response = requests.get(url, timeout=10)
        duration = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            print(f"✅ {endpoint}: {response.status_code} ({duration:.0f}ms)")
            try:
                data = response.json()
                if isinstance(data, dict):
                    if 'message' in data:
                        print(f"   📝 Message: {data['message']}")
                    elif len(data) > 0:
                        keys = list(data.keys())[:3]
                        print(f"   📋 Fields: {', '.join(keys)}")
                elif isinstance(data, list):
                    print(f"   📊 Array with {len(data)} items")
            except:
                print(f"   📄 Response: {response.text[:50]}...")
        else:
            print(f"❌ {endpoint}: {response.status_code} ({duration:.0f}ms)")
            print(f"   🚨 Error: {response.text[:100]}")
            
    except requests.exceptions.ConnectionError:
        print(f"💥 {endpoint}: Connection failed - Service not running?")
    except requests.exceptions.Timeout:
        print(f"⏰ {endpoint}: Timeout after 10 seconds")
    except Exception as e:
        print(f"💥 {endpoint}: {str(e)}")
    
    print("")

def main():
    print("🐍 Python Service Simple Test")
    print("==============================")
    print(f"Testing service at: {BASE_URL}")
    print("")
    
    # Test each endpoint
    for endpoint in ENDPOINTS:
        test_endpoint(endpoint)
    
    print("📊 Test completed!")
    print("🌐 Web UI: http://localhost:3000/python-service/test")

if __name__ == "__main__":
    main()
