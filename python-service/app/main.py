from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
import asyncio
from datetime import datetime

from .config import settings
from .models import (
    StockPrice, StockInfo, StockHistory, SyncRequest, SyncResponse, MarketIndex
)
from .services.vnstock_service import vnstock_service
from .services.database import db_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="VNStock API Service",
        description="Python service for Vietnam Stock Market data using vnstock",
        version="1.0.0"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routes
    from .api.routes import router
    app.include_router(router)

    return app

app = create_app()
