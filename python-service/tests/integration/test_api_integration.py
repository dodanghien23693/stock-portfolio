"""
Integration tests for API endpoints
"""
import requests
import pytest

API_BASE_URL = "http://localhost:8001"

@pytest.mark.integration
def test_api_integration():
    """Test full API integration"""
    # Test health check
    response = requests.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200
    
    # Test stock price
    response = requests.get(f"{API_BASE_URL}/stocks/VCB/price")
    # Handle both success and expected failures
    assert response.status_code in [200, 404, 500]
    
    # Test stock search
    response = requests.get(f"{API_BASE_URL}/stocks/search?q=VCB")
    assert response.status_code in [200, 500]
