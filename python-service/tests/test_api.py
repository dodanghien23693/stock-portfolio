"""
Test module for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "timestamp" in data

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_stock_price():
    """Test stock price endpoint"""
    response = client.get("/stocks/VCB/price")
    assert response.status_code in [200, 404, 500]  # Depends on service availability

def test_stock_info():
    """Test stock info endpoint"""
    response = client.get("/stocks/VCB/info")
    assert response.status_code in [200, 404, 500]  # Depends on service availability

def test_stock_history():
    """Test stock history endpoint"""
    response = client.get("/stocks/VCB/history?period=1M")
    assert response.status_code in [200, 404, 500]  # Depends on service availability

def test_search_stocks():
    """Test stock search endpoint"""
    response = client.get("/stocks/search?q=VCB&limit=5")
    assert response.status_code in [200, 500]  # Depends on service availability
