"""
Weather data models for storing API snapshots and historical data.
"""

from django.db import models
from apps.locations.models import Location


class WeatherData(models.Model):
    """
    Stores weather data snapshots from external APIs.
    Used for historical analysis and model validation.
    """
    
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='weather_data'
    )
    
    # Basic weather data
    temperature = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Temperature in Celsius'
    )
    feels_like = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    humidity = models.IntegerField(help_text='Humidity percentage')
    pressure = models.IntegerField(help_text='Atmospheric pressure in hPa')
    
    # Wind data
    wind_speed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Wind speed in m/s'
    )
    wind_direction = models.IntegerField(
        null=True,
        blank=True,
        help_text='Wind direction in degrees'
    )
    wind_gust = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Precipitation
    rainfall = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        help_text='Rainfall in mm'
    )
    
    # Cloud and visibility
    cloudiness = models.IntegerField(
        default=0,
        help_text='Cloud coverage percentage'
    )
    visibility = models.IntegerField(
        null=True,
        blank=True,
        help_text='Visibility in meters'
    )
    
    # Weather condition
    condition = models.CharField(max_length=50)
    condition_description = models.CharField(max_length=255, blank=True)
    condition_icon = models.CharField(max_length=20, blank=True)
    
    # Data source
    source = models.CharField(
        max_length=50,
        default='openweather',
        choices=[
            ('openweather', 'OpenWeatherMap'),
            ('manual', 'Manual Entry'),
            ('station', 'Weather Station'),
        ]
    )
    source_timestamp = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Timestamp from the data source'
    )
    
    # Raw API response for debugging
    raw_data = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    recorded_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'weather data'
        verbose_name_plural = 'weather data'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['location', '-recorded_at']),
            models.Index(fields=['recorded_at']),
        ]
        # Prevent duplicate entries
        unique_together = ['location', 'recorded_at', 'source']
    
    def __str__(self):
        return f"{self.location.name} - {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def to_feature_dict(self):
        """
        Convert weather data to feature dictionary for ML model.
        """
        return {
            'temperature': float(self.temperature),
            'humidity': self.humidity,
            'pressure': self.pressure,
            'wind_speed': float(self.wind_speed),
            'cloudiness': self.cloudiness,
        }


class WeatherForecast(models.Model):
    """
    Stores weather forecasts from external APIs.
    """
    
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='forecasts'
    )
    
    # Forecast data
    forecast_date = models.DateField()
    forecast_hour = models.IntegerField(null=True, blank=True)
    
    temperature_high = models.DecimalField(max_digits=5, decimal_places=2)
    temperature_low = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.IntegerField()
    pressure = models.IntegerField()
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    precipitation_probability = models.IntegerField(default=0)
    rainfall_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    condition = models.CharField(max_length=50)
    condition_description = models.CharField(max_length=255, blank=True)
    
    # Source and timestamps
    source = models.CharField(max_length=50, default='openweather')
    fetched_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'weather forecast'
        verbose_name_plural = 'weather forecasts'
        ordering = ['forecast_date', 'forecast_hour']
        unique_together = ['location', 'forecast_date', 'forecast_hour', 'source']
    
    def __str__(self):
        return f"{self.location.name} - {self.forecast_date}"
