"""
Serializers for prediction data.
"""

from rest_framework import serializers
from .models import PredictionHistory, ModelMetrics


class PredictionRequestSerializer(serializers.Serializer):
    """Serializer for prediction request."""
    
    location_id = serializers.IntegerField(required=True)
    
    # Optional custom features (override live weather data)
    temperature = serializers.FloatField(required=False)
    humidity = serializers.IntegerField(required=False, min_value=0, max_value=100)
    pressure = serializers.IntegerField(required=False, min_value=900, max_value=1100)
    wind_speed = serializers.FloatField(required=False, min_value=0)
    cloudiness = serializers.IntegerField(required=False, min_value=0, max_value=100)


class CustomPredictionRequestSerializer(serializers.Serializer):
    """Serializer for custom feature prediction."""
    
    temperature = serializers.FloatField(required=True)
    humidity = serializers.IntegerField(required=True, min_value=0, max_value=100)
    pressure = serializers.IntegerField(required=True, min_value=900, max_value=1100)
    wind_speed = serializers.FloatField(required=True, min_value=0)
    cloudiness = serializers.IntegerField(required=False, default=50, min_value=0, max_value=100)
    location_id = serializers.IntegerField(required=False)


class PredictionHistorySerializer(serializers.ModelSerializer):
    """Serializer for prediction history."""
    
    location_name = serializers.CharField(source='location.name', read_only=True)
    category_label = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionHistory
        fields = [
            'id', 'location', 'location_name',
            'input_temperature', 'input_humidity', 'input_pressure',
            'input_wind_speed', 'input_cloudiness',
            'predicted_rainfall', 'rainfall_category', 'category_label',
            'confidence_score', 'model_version', 'model_type',
            'predicted_for_date', 'created_at'
        ]
    
    def get_category_label(self, obj):
        labels = {
            'none': 'No Rain',
            'light': 'Light Rain',
            'moderate': 'Moderate Rain',
            'heavy': 'Heavy Rain',
            'extreme': 'Extreme Rain',
        }
        return labels.get(obj.rainfall_category, 'Unknown')


class ModelMetricsSerializer(serializers.ModelSerializer):
    """Serializer for model metrics."""
    
    class Meta:
        model = ModelMetrics
        fields = [
            'id', 'model_version', 'model_type',
            'accuracy', 'precision', 'recall', 'f1_score',
            'rmse', 'mae', 'training_samples', 'test_samples',
            'evaluated_at'
        ]
