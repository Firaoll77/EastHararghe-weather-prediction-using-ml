"""
Admin configuration for location models.
"""

from django.contrib import admin
from .models import Location


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'zone', 'latitude', 'longitude', 'has_weather_station', 'is_active']
    list_filter = ['zone', 'district', 'has_weather_station', 'is_active']
    search_fields = ['name', 'name_amharic', 'district']
    ordering = ['name']
