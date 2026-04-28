from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from app.services.weather_service import WeatherService
from app.services.ml_service import MLService
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

@router.get("/current")
async def get_current_weather(woreda: str = Query(...)) -> Dict[str, Any]:
    """
    Get current weather data for a specific woreda
    
    - **woreda**: Name of the woreda (must be one of the supported East Hararghe woredas)
    """
    try:
        # Validate woreda
        if not WeatherService.validate_woreda(woreda):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid woreda. Must be one of: {', '.join(WeatherService.get_supported_woredas())}"
            )
        
        # Get weather data
        weather_data = await WeatherService.get_current_weather(woreda)
        
        return {
            "success": True,
            "data": weather_data,
            "message": "Weather data retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_weather: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

@router.get("/predict")
async def get_rainfall_prediction(
    woreda: str = Query(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate ML rainfall prediction for a woreda
    
    - **woreda**: Name of the woreda
    - **Authentication**: Required
    """
    try:
        # Validate woreda
        if not WeatherService.validate_woreda(woreda):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid woreda. Must be one of: {', '.join(WeatherService.get_supported_woredas())}"
            )
        
        # Get current weather data
        weather_data = await WeatherService.get_current_weather(woreda)
        
        # Transform to ML features
        ml_features = WeatherService.transform_to_ml_features(weather_data)
        
        # Get ML prediction
        prediction_result = await MLService.predict_rainfall(ml_features)
        
        # Save prediction to database
        prediction_data = {
            'user_id': current_user['user_id'],
            'location': woreda,
            'rainfall_prediction': prediction_result['prediction'],
            'confidence_score': prediction_result['confidence_score'],
            'input_features': ml_features
        }
        
        saved_prediction = await DatabaseService.save_prediction(prediction_data)
        
        return {
            "success": True,
            "data": {
                "location": woreda,
                "weather": weather_data,
                "rainfall_prediction": prediction_result['prediction'],
                "confidence_score": prediction_result['confidence_score'],
                "input_features": ml_features,
                "prediction_id": saved_prediction['id'],
                "created_at": saved_prediction['created_at']
            },
            "message": "Prediction generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_rainfall_prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate prediction")

@router.get("/woredas")
async def get_supported_woredas() -> Dict[str, Any]:
    """Get list of supported woredas"""
    try:
        woredas = WeatherService.get_supported_woredas()
        
        return {
            "success": True,
            "data": woredas,
            "message": "Supported woredas retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error in get_supported_woredas: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve woredas")
