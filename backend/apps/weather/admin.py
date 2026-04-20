"""
Admin configuration for weather models.
"""

from django.contrib import admin
from .models import WeatherData, WeatherForecast


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ['location', 'temperature', 'humidity', 'rainfall', 'condition', 'recorded_at']
    list_filter = ['location', 'condition', 'source', 'recorded_at']
    search_fields = ['location__name']
    ordering = ['-recorded_at']
    date_hierarchy = 'recorded_at'


@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ['location', 'forecast_date', 'temperature_high', 'temperature_low', 'precipitation_probability', 'condition']
    list_filter = ['location', 'condition', 'forecast_date']
    search_fields = ['location__name']
    ordering = ['forecast_date']
