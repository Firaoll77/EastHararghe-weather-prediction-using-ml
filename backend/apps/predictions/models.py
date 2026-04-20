"""
Models for prediction history and tracking.
"""

from django.db import models
from django.conf import settings
from apps.locations.models import Location


class PredictionHistory(models.Model):
    """
    Stores all predictions made by the ML model.
    Used for tracking, validation, and user history.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions',
        null=True,
        blank=True
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    
    # Input features used for prediction
    input_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    input_humidity = models.IntegerField()
    input_pressure = models.IntegerField()
    input_wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    input_cloudiness = models.IntegerField(default=0)
    
    # Prediction results
    predicted_rainfall = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text='Predicted rainfall in mm'
    )
    rainfall_category = models.CharField(
        max_length=20,
        choices=[
            ('none', 'No Rain'),
            ('light', 'Light Rain'),
            ('moderate', 'Moderate Rain'),
            ('heavy', 'Heavy Rain'),
            ('extreme', 'Extreme Rain'),
        ],
        default='none'
    )
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Model confidence (0-100)'
    )
    
    # Model information
    model_version = models.CharField(max_length=50, default='v1.0')
    model_type = models.CharField(
        max_length=50,
        default='random_forest',
        choices=[
            ('random_forest', 'Random Forest'),
            ('xgboost', 'XGBoost'),
            ('lstm', 'LSTM Neural Network'),
            ('ensemble', 'Ensemble Model'),
        ]
    )
    
    # Actual outcome (for model validation)
    actual_rainfall = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Actual recorded rainfall (for validation)'
    )
    prediction_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Request metadata
    request_ip = models.GenericIPAddressField(null=True, blank=True)
    request_user_agent = models.TextField(blank=True)
    
    # Timestamps
    predicted_for_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'prediction history'
        verbose_name_plural = 'prediction histories'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['location', '-created_at']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Prediction for {self.location.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @staticmethod
    def get_rainfall_category(rainfall_mm: float) -> str:
        """Convert rainfall amount to category."""
        if rainfall_mm < 0.5:
            return 'none'
        elif rainfall_mm < 2.5:
            return 'light'
        elif rainfall_mm < 10:
            return 'moderate'
        elif rainfall_mm < 50:
            return 'heavy'
        else:
            return 'extreme'


class ModelMetrics(models.Model):
    """
    Stores model performance metrics over time.
    Used for monitoring model accuracy and drift detection.
    """
    
    model_version = models.CharField(max_length=50)
    model_type = models.CharField(max_length=50)
    
    # Performance metrics
    accuracy = models.DecimalField(max_digits=5, decimal_places=2)
    precision = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    recall = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    f1_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    rmse = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    mae = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    
    # Dataset info
    training_samples = models.IntegerField()
    test_samples = models.IntegerField()
    feature_count = models.IntegerField()
    
    # Timestamps
    evaluated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'model metrics'
        verbose_name_plural = 'model metrics'
        ordering = ['-evaluated_at']
    
    def __str__(self):
        return f"{self.model_type} {self.model_version} - {self.accuracy}% accuracy"
