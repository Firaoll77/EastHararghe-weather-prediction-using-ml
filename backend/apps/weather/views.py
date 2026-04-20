"""
Views for weather endpoints.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .services import WeatherService
from .serializers import LiveWeatherRequestSerializer, WeatherHistoryRequestSerializer


class LiveWeatherView(APIView):
    """
    Get live weather data.
    GET /api/weather/live?location_id=<id>
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        location_id = request.query_params.get('location_id')
        
        if not location_id:
            return Response(
                {'success': False, 'error': 'location_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            location_id = int(location_id)
        except ValueError:
            return Response(
                {'success': False, 'error': 'Invalid location_id.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = WeatherService()
        result = service.get_live_weather(location_id)
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )


class WeatherHistoryView(APIView):
    """
    Get historical weather data.
    GET /api/weather/history?location_id=<id>&days=<days>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = WeatherHistoryRequestSerializer(data=request.query_params)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = WeatherService()
        result = service.get_weather_history(
            location_id=serializer.validated_data['location_id'],
            days=serializer.validated_data['days']
        )
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )


class WeatherForecastView(APIView):
    """
    Get weather forecast.
    GET /api/weather/forecast?location_id=<id>&days=<days>
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        location_id = request.query_params.get('location_id')
        days = int(request.query_params.get('days', 7))
        
        if not location_id:
            return Response(
                {'success': False, 'error': 'location_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            location_id = int(location_id)
        except ValueError:
            return Response(
                {'success': False, 'error': 'Invalid location_id.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = WeatherService()
        result = service.get_forecast(location_id, min(days, 14))
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )
