"""
Custom exception handling for the API.
Provides consistent error responses across all endpoints.
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status

logger = logging.getLogger('api')


class WeatherAPIException(APIException):
    """Base exception for weather-related errors."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Weather service is temporarily unavailable.'
    default_code = 'weather_service_error'


class MLPredictionException(APIException):
    """Exception for ML prediction errors."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Failed to generate prediction.'
    default_code = 'prediction_error'


class ModelNotLoadedException(APIException):
    """Exception when ML model is not available."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'ML model is not loaded. Please try again later.'
    default_code = 'model_not_loaded'


class InvalidLocationException(APIException):
    """Exception for invalid location requests."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid location specified.'
    default_code = 'invalid_location'


class ExternalAPIException(APIException):
    """Exception for external API failures."""
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = 'External service request failed.'
    default_code = 'external_api_error'


def custom_exception_handler(exc, context):
    """
    Custom exception handler that adds logging and consistent error format.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the error
        logger.error(
            f"API Error: {exc.__class__.__name__} - {str(exc)}",
            extra={
                'status_code': response.status_code,
                'view': context.get('view').__class__.__name__ if context.get('view') else None,
                'request_path': context.get('request').path if context.get('request') else None,
            }
        )
        
        # Customize the response data
        custom_response_data = {
            'success': False,
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
            }
        }
        
        # Add field errors for validation exceptions
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            custom_response_data['error']['fields'] = exc.detail
        
        response.data = custom_response_data
    
    return response
