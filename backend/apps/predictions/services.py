"""
Service layer for prediction operations.
Orchestrates between weather data and ML service.
"""

import logging
from typing import Optional, Dict, Any
from datetime import date
from django.utils import timezone
from core.services import ServiceResult
from core.exceptions import MLPredictionException, ModelNotLoadedException
from apps.locations.models import Location
from apps.weather.services import WeatherService
from .models import PredictionHistory
from .ml_service import get_ml_service

logger = logging.getLogger('api')


class PredictionService:
    """
    Service class for ML prediction operations.
    Coordinates between weather data fetching and ML inference.
    """
    
    def __init__(self):
        self.ml_service = get_ml_service()
        self.weather_service = WeatherService()
    
    def make_prediction(
        self,
        location_id: int,
        user=None,
        custom_features: Optional[Dict[str, Any]] = None,
        request_ip: Optional[str] = None,
        user_agent: str = ''
    ) -> ServiceResult:
        """
        Make a rainfall prediction for a location.
        
        Args:
            location_id: ID of the location
            user: Optional user making the prediction
            custom_features: Optional custom weather features (overrides live data)
            request_ip: Client IP address
            user_agent: Client user agent
            
        Returns:
            ServiceResult with prediction data
        """
        # Check if ML service is ready
        if not self.ml_service.is_ready():
            return ServiceResult.fail(
                'ML model is not available. Please try again later.',
                'model_not_ready'
            )
        
        # Get location
        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            return ServiceResult.fail('Location not found.', 'location_not_found')
        
        # Get weather features
        if custom_features:
            features = self._validate_features(custom_features)
            if features is None:
                return ServiceResult.fail(
                    'Invalid feature values provided.',
                    'invalid_features'
                )
        else:
            # Fetch live weather data
            weather_result = self.weather_service.get_live_weather(location_id)
            if not weather_result.success:
                return ServiceResult.fail(
                    'Could not fetch weather data for prediction.',
                    'weather_data_error'
                )
            
            weather_data = weather_result.data['weather']
            features = {
                'temperature': weather_data['temperature'],
                'humidity': weather_data['humidity'],
                'pressure': weather_data['pressure'],
                'wind_speed': weather_data['wind_speed'],
                'cloudiness': weather_data['cloudiness'],
            }
        
        # Make prediction
        try:
            predicted_rainfall, confidence = self.ml_service.predict(features)
            rainfall_category = PredictionHistory.get_rainfall_category(predicted_rainfall)
            
            # Store prediction in history
            prediction_record = PredictionHistory.objects.create(
                user=user if user and user.is_authenticated else None,
                location=location,
                input_temperature=features['temperature'],
                input_humidity=features['humidity'],
                input_pressure=features['pressure'],
                input_wind_speed=features['wind_speed'],
                input_cloudiness=features.get('cloudiness', 0),
                predicted_rainfall=predicted_rainfall,
                rainfall_category=rainfall_category,
                confidence_score=confidence,
                model_version=self.ml_service.model_version,
                model_type=self.ml_service.model_type,
                request_ip=request_ip,
                request_user_agent=user_agent,
                predicted_for_date=date.today(),
            )
            
            logger.info(f"Prediction made for {location.name}: {predicted_rainfall}mm")
            
            return ServiceResult.ok({
                'prediction_id': prediction_record.id,
                'location': {
                    'id': location.id,
                    'name': location.name,
                    'coordinates': location.coordinates,
                },
                'input_features': features,
                'prediction': {
                    'rainfall_mm': round(predicted_rainfall, 2),
                    'category': rainfall_category,
                    'category_label': self._get_category_label(rainfall_category),
                    'confidence': round(confidence, 1) if confidence else None,
                },
                'model_info': {
                    'version': self.ml_service.model_version,
                    'type': self.ml_service.model_type,
                },
                'predicted_at': prediction_record.created_at.isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return ServiceResult.fail(
                'Failed to generate prediction.',
                'prediction_error'
            )
    
    def make_prediction_with_features(
        self,
        features: Dict[str, Any],
        location_id: Optional[int] = None,
        user=None,
    ) -> ServiceResult:
        """
        Make a prediction using provided features directly.
        Useful for "what-if" scenarios.
        """
        # Validate features
        validated_features = self._validate_features(features)
        if validated_features is None:
            return ServiceResult.fail(
                'Invalid feature values provided.',
                'invalid_features'
            )
        
        # Get location if provided
        location = None
        if location_id:
            try:
                location = Location.objects.get(pk=location_id, is_active=True)
            except Location.DoesNotExist:
                pass
        
        # Make prediction
        try:
            predicted_rainfall, confidence = self.ml_service.predict(validated_features)
            rainfall_category = PredictionHistory.get_rainfall_category(predicted_rainfall)
            
            # Store in history if user is authenticated
            if user and user.is_authenticated and location:
                PredictionHistory.objects.create(
                    user=user,
                    location=location,
                    input_temperature=validated_features['temperature'],
                    input_humidity=validated_features['humidity'],
                    input_pressure=validated_features['pressure'],
                    input_wind_speed=validated_features['wind_speed'],
                    input_cloudiness=validated_features.get('cloudiness', 0),
                    predicted_rainfall=predicted_rainfall,
                    rainfall_category=rainfall_category,
                    confidence_score=confidence,
                    model_version=self.ml_service.model_version,
                    model_type=self.ml_service.model_type,
                )
            
            return ServiceResult.ok({
                'input_features': validated_features,
                'prediction': {
                    'rainfall_mm': round(predicted_rainfall, 2),
                    'category': rainfall_category,
                    'category_label': self._get_category_label(rainfall_category),
                    'confidence': round(confidence, 1) if confidence else None,
                },
                'model_info': {
                    'version': self.ml_service.model_version,
                    'type': self.ml_service.model_type,
                },
            })
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return ServiceResult.fail(
                'Failed to generate prediction.',
                'prediction_error'
            )
    
    def get_prediction_history(
        self,
        user,
        location_id: Optional[int] = None,
        limit: int = 50
    ) -> ServiceResult:
        """
        Get prediction history for a user.
        """
        queryset = PredictionHistory.objects.filter(user=user)
        
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        predictions = queryset[:limit]
        
        return ServiceResult.ok({
            'count': len(predictions),
            'predictions': [
                {
                    'id': p.id,
                    'location': {
                        'id': p.location.id,
                        'name': p.location.name,
                    },
                    'predicted_rainfall': float(p.predicted_rainfall),
                    'rainfall_category': p.rainfall_category,
                    'confidence': float(p.confidence_score) if p.confidence_score else None,
                    'created_at': p.created_at.isoformat(),
                }
                for p in predictions
            ]
        })
    
    def _validate_features(self, features: Dict[str, Any]) -> Optional[Dict[str, float]]:
        """Validate and normalize input features."""
        try:
            validated = {
                'temperature': float(features.get('temperature', 25)),
                'humidity': max(0, min(100, int(features.get('humidity', 50)))),
                'pressure': max(900, min(1100, int(features.get('pressure', 1013)))),
                'wind_speed': max(0, float(features.get('wind_speed', 0))),
                'cloudiness': max(0, min(100, int(features.get('cloudiness', 50)))),
            }
            return validated
        except (ValueError, TypeError):
            return None
    
    def _get_category_label(self, category: str) -> str:
        """Get human-readable label for rainfall category."""
        labels = {
            'none': 'No Rain Expected',
            'light': 'Light Rain',
            'moderate': 'Moderate Rain',
            'heavy': 'Heavy Rain',
            'extreme': 'Extreme Rainfall',
        }
        return labels.get(category, 'Unknown')


def get_model_status() -> Dict[str, Any]:
    """Get current status of the ML model."""
    ml_service = get_ml_service()
    return ml_service.get_model_info()
