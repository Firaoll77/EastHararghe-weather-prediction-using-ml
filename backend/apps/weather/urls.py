"""
URL routes for weather endpoints.
"""

from django.urls import path
from .views import LiveWeatherView, WeatherHistoryView, WeatherForecastView

urlpatterns = [
    path('live/', LiveWeatherView.as_view(), name='weather-live'),
    path('history/', WeatherHistoryView.as_view(), name='weather-history'),
    path('forecast/', WeatherForecastView.as_view(), name='weather-forecast'),
]
