"""
Serializers for weather data.
"""

from rest_framework import serializers
from .models import WeatherData, WeatherForecast


class WeatherDataSerializer(serializers.ModelSerializer):
    """Serializer for weather data records."""
    
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = WeatherData
        fields = [
            'id', 'location', 'location_name', 'temperature', 'feels_like',
            'humidity', 'pressure', 'wind_speed', 'wind_direction',
            'rainfall', 'cloudiness', 'visibility', 'condition',
            'condition_description', 'recorded_at', 'created_at'
        ]


class WeatherForecastSerializer(serializers.ModelSerializer):
    """Serializer for weather forecasts."""
    
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = WeatherForecast
        fields = [
            'id', 'location', 'location_name', 'forecast_date',
            'temperature_high', 'temperature_low', 'humidity', 'pressure',
            'wind_speed', 'precipitation_probability', 'rainfall_amount',
            'condition', 'condition_description', 'fetched_at'
        ]


class LiveWeatherRequestSerializer(serializers.Serializer):
    """Serializer for live weather request."""
    
    location_id = serializers.IntegerField(required=True)


class WeatherHistoryRequestSerializer(serializers.Serializer):
    """Serializer for weather history request."""
    
    location_id = serializers.IntegerField(required=True)
    days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=90)
