from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api import weather, auth, predictions, admin
from app.services.database import DatabaseService
from app.services.ml_service import MLService
from app.utils.config import settings
from app.utils.logger import setup_logger
import logging

# Setup logging
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="East Hararghe Weather Platform",
    description="ML-powered weather prediction platform for East Hararghe Zone, Ethiopia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Startup events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize database connection
        await DatabaseService.initialize()
        logger.info("Database initialized successfully")
        
        # Initialize ML service
        await MLService.initialize()
        logger.info("ML service initialized successfully")
        
        logger.info("East Hararghe Weather Platform started successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        await DatabaseService.close()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Include routers
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "status": "healthy",
        "service": "East Hararghe Weather Platform",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        db_status = await DatabaseService.health_check()
        ml_status = await MLService.health_check()
        
        return {
            "status": "healthy",
            "services": {
                "database": db_status,
                "ml_service": ml_status
            },
            "timestamp": "2024-01-15T10:30:00Z"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unavailable"
        )

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return {
        "success": False,
        "error": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "success": False,
        "error": "Internal server error",
        "status_code": 500
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
