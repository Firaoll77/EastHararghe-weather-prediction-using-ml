from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, List
from app.services.database import DatabaseService
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

@router.get("/history")
async def get_prediction_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current user's prediction history
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    - **Authentication**: Required
    """
    try:
        predictions = await DatabaseService.get_user_predictions(
            current_user['user_id'], 
            limit
        )
        
        return {
            "success": True,
            "data": {
                "predictions": predictions,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": len(predictions)
                }
            },
            "message": "Prediction history retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_prediction_history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve prediction history")

@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get specific prediction details
    
    - **prediction_id**: ID of the prediction
    - **Authentication**: Required
    """
    try:
        # For simplicity, we'll get all user predictions and filter by ID
        # In production, you'd want a direct database query
        user_predictions = await DatabaseService.get_user_predictions(
            current_user['user_id'], 
            limit=1000  # Get all predictions
        )
        
        # Find the specific prediction
        prediction = None
        for pred in user_predictions:
            if pred['id'] == prediction_id:
                prediction = pred
                break
        
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Prediction not found or access denied"
            )
        
        return {
            "success": True,
            "data": prediction,
            "message": "Prediction retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve prediction")

@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Delete a specific prediction
    
    - **prediction_id**: ID of the prediction
    - **Authentication**: Required
    """
    try:
        # For simplicity, we'll use the database service to delete
        # In production, you'd want to verify ownership before deletion
        client = DatabaseService.get_client()
        
        # First check if prediction exists and belongs to user
        user_predictions = await DatabaseService.get_user_predictions(
            current_user['user_id'], 
            limit=1000
        )
        
        prediction_exists = any(pred['id'] == prediction_id for pred in user_predictions)
        if not prediction_exists:
            raise HTTPException(
                status_code=404,
                detail="Prediction not found or access denied"
            )
        
        # Delete the prediction
        result = client.table('predictions').delete().eq('id', prediction_id).execute()
        
        return {
            "success": True,
            "message": "Prediction deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete prediction")

@router.get("/all")
async def get_all_predictions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(require_official_role)
) -> Dict[str, Any]:
    """
    Get all predictions (officials only)
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    - **Authentication**: Required (Official role only)
    """
    try:
        predictions = await DatabaseService.get_all_predictions(limit)
        
        return {
            "success": True,
            "data": {
                "predictions": predictions,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": len(predictions)
                }
            },
            "message": "All predictions retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_all_predictions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve all predictions")
