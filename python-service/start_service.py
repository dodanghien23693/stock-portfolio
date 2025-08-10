"""
Start Python News Service
"""

import uvicorn
import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    print("🚀 Starting Python News Service...")
    print("📡 Service will be available at http://localhost:8002")
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,
        log_level="info"
    )
