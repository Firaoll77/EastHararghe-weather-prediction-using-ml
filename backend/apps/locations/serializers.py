"""
Serializers for location data.
"""

from rest_framework import serializers
from .models import Location


class LocationSerializer(serializers.ModelSerializer):
    """Full location serializer."""
    
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'id', 'name', 'name_amharic', 'latitude', 'longitude',
            'coordinates', 'elevation', 'district', 'zone', 'region',
            'has_weather_station', 'is_active'
        ]
    
    def get_coordinates(self, obj):
        return {'lat': float(obj.latitude), 'lng': float(obj.longitude)}


class LocationListSerializer(serializers.ModelSerializer):
    """Simplified location serializer for lists."""
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'district', 'latitude', 'longitude']
