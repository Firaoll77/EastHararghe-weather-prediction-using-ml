"""
Views for prediction endpoints.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .services import PredictionService, get_model_status
from .serializers import (
    PredictionRequestSerializer,
    CustomPredictionRequestSerializer,
    PredictionHistorySerializer,
)
from apps.users.services import ActivityService


class PredictView(APIView):
    """
    Make a rainfall prediction.
    POST /api/predict/
    
    Request body:
    {
        "location_id": 1,
        // Optional: custom features override live weather
        "temperature": 25,
        "humidity": 70,
        "pressure": 1010,
        "wind_speed": 5,
        "cloudiness": 80
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PredictionRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        # Check if custom features were provided
        custom_features = None
        feature_keys = ['temperature', 'humidity', 'pressure', 'wind_speed', 'cloudiness']
        if any(k in data for k in feature_keys):
            custom_features = {k: data[k] for k in feature_keys if k in data}
        
        # Get client info
        request_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Make prediction
        service = PredictionService()
        result = service.make_prediction(
            location_id=data['location_id'],
            user=request.user if request.user.is_authenticated else None,
            custom_features=custom_features,
            request_ip=request_ip,
            user_agent=user_agent,
        )
        
        if result.success:
            # Log activity for authenticated users
            if request.user.is_authenticated:
                ActivityService.log_activity(
                    user=request.user,
                    action='prediction',
                    ip_address=request_ip,
                    metadata={
                        'location_id': data['location_id'],
                        'prediction_id': result.data['prediction_id'],
                    }
                )
            
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class CustomPredictView(APIView):
    """
    Make a prediction with custom features.
    POST /api/predict/custom/
    
    Useful for "what-if" scenarios.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = CustomPredictionRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        service = PredictionService()
        result = service.make_prediction_with_features(
            features={
                'temperature': data['temperature'],
                'humidity': data['humidity'],
                'pressure': data['pressure'],
                'wind_speed': data['wind_speed'],
                'cloudiness': data.get('cloudiness', 50),
            },
            location_id=data.get('location_id'),
            user=request.user if request.user.is_authenticated else None,
        )
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )


class ModelStatusView(APIView):
    """
    Get ML model status.
    GET /api/predict/status/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        model_info = get_model_status()
        
        return Response({
            'success': True,
            'data': model_info
        })


class PredictionHistoryView(APIView):
    """
    Get prediction history for the authenticated user.
    GET /api/predict/history/?location_id=<id>&limit=<limit>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        location_id = request.query_params.get('location_id')
        limit = int(request.query_params.get('limit', 50))
        
        if location_id:
            try:
                location_id = int(location_id)
            except ValueError:
                location_id = None
        
        service = PredictionService()
        result = service.get_prediction_history(
            user=request.user,
            location_id=location_id,
            limit=min(limit, 100)
        )
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error},
            status=status.HTTP_400_BAD_REQUEST
        )
