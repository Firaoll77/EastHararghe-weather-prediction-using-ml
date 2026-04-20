"""
Admin configuration for prediction models.
"""

from django.contrib import admin
from .models import PredictionHistory, ModelMetrics


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'location', 'user', 'predicted_rainfall', 'rainfall_category',
        'confidence_score', 'model_type', 'created_at'
    ]
    list_filter = ['rainfall_category', 'model_type', 'location', 'created_at']
    search_fields = ['user__email', 'location__name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    readonly_fields = [
        'user', 'location', 'input_temperature', 'input_humidity',
        'input_pressure', 'input_wind_speed', 'input_cloudiness',
        'predicted_rainfall', 'rainfall_category', 'confidence_score',
        'model_version', 'model_type', 'request_ip', 'created_at'
    ]


@admin.register(ModelMetrics)
class ModelMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'model_type', 'model_version', 'accuracy', 'rmse', 'evaluated_at'
    ]
    list_filter = ['model_type', 'evaluated_at']
    ordering = ['-evaluated_at']
