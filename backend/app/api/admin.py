from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from app.services.database import DatabaseService
from app.services.ml_service import MLService
from app.services.auth_service import AuthService
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        payload = AuthService.verify_token(credentials.credentials)
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user profile
        profile = await DatabaseService.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=401, detail="User profile not found")
        
        return {
            'user_id': user_id,
            'email': payload.get('email'),
            'profile': profile
        }
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def require_official_role(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require official role for admin endpoints"""
    if current_user['profile']['role'] != 'official':
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Official role required."
        )
    return current_user

@router.get("/analytics")
async def get_analytics(
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get analytics dashboard data
    
    - **Authentication**: Required (Official role only)
    """
    try:
        analytics_data = await DatabaseService.get_analytics_data()
        
        return {
            "success": True,
            "data": analytics_data,
            "message": "Analytics data retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics data")

@router.get("/users")
async def get_all_users(
    page: int = 1,
    limit: int = 20,
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get all users with profiles
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20)
    - **Authentication**: Required (Official role only)
    """
    try:
        client = DatabaseService.get_client()
        
        # Get all profiles with pagination
        offset = (page - 1) * limit
        result = client.table('profiles')\
            .select('*')\
            .order('created_at', desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        # Get total count
        count_result = client.table('profiles').select('id', count='exact').execute()
        total_count = count_result.count if count_result.count else len(result.data)
        
        return {
            "success": True,
            "data": {
                "users": result.data,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_count,
                    "pages": (total_count + limit - 1) // limit
                }
            },
            "message": "Users retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_all_users: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users")

@router.get("/system-health")
async def get_system_health(
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get system health status
    
    - **Authentication**: Required (Official role only)
    """
    try:
        # Get database health
        db_health = await DatabaseService.health_check()
        
        # Get ML service health
        ml_health = await MLService.health_check()
        
        # Backend health (always healthy if this endpoint is reachable)
        backend_health = {
            "status": "healthy",
            "timestamp": "2024-01-15T10:30:00Z",
            "uptime": "healthy"  # In production, use actual uptime tracking
        }
        
        return {
            "success": True,
            "data": {
                "backend": backend_health,
                "database": db_health,
                "ml_service": ml_health
            },
            "message": "System health retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_system_health: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve system health")

@router.get("/model-info")
async def get_model_info(
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get information about loaded ML models
    
    - **Authentication**: Required (Official role only)
    """
    try:
        model_info = MLService.get_model_info()
        
        return {
            "success": True,
            "data": model_info,
            "message": "Model information retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_model_info: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve model information")

@router.get("/predictions-summary")
async def get_predictions_summary(
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get summary of all predictions (simplified version of analytics)
    
    - **Authentication**: Required (Official role only)
    """
    try:
        # Get recent predictions
        predictions = await DatabaseService.get_all_predictions(limit=50)
        
        # Calculate summary statistics
        total_predictions = len(predictions)
        avg_confidence = 0
        if predictions:
            avg_confidence = sum(p['confidence_score'] for p in predictions) / total_predictions
        
        # Get unique locations
        locations = set(p['location'] for p in predictions)
        
        summary = {
            "total_predictions": total_predictions,
            "average_confidence": avg_confidence,
            "unique_locations": len(locations),
            "locations": list(locations),
            "recent_predictions": predictions[:10]  # Last 10 predictions
        }
        
        return {
            "success": True,
            "data": summary,
            "message": "Predictions summary retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_predictions_summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve predictions summary")
