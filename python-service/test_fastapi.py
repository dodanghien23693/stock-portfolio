#!/usr/bin/env python3

# Simple FastAPI test to isolate the issue
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VNStock API Service - Test",
    description="Simple test of Python service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple FastAPI test"}

@app.get("/test")
async def test_endpoint():
    try:
        from vnstock_service import vnstock_service
        health = vnstock_service.health_check()
        return {"fastapi": "working", "vnstock_health": health}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    logger.info("Starting simple test server...")
    uvicorn.run(
        "test_fastapi:app",
        host="localhost",
        port=8002,
        reload=False
    )
