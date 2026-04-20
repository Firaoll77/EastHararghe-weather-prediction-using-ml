"""
Service layer for weather data operations.
Handles external API integration and data normalization.
"""

import logging
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from django.conf import settings
from django.utils import timezone
from core.services import ServiceResult
from core.exceptions import WeatherAPIException, ExternalAPIException
from apps.locations.models import Location
from .models import WeatherData, WeatherForecast

logger = logging.getLogger('api')


class WeatherAPIClient:
    """
    Client for external weather API (OpenWeatherMap).
    Handles API requests and response normalization.
    """
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL
    
    def _make_request(self, endpoint: str, params: Dict) -> Dict:
        """Make API request with error handling."""
        if not self.api_key:
            raise WeatherAPIException('Weather API key not configured.')
        
        params['appid'] = self.api_key
        params['units'] = 'metric'  # Use Celsius
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
            
        except requests.Timeout:
            logger.error(f"Weather API timeout for {endpoint}")
            raise ExternalAPIException('Weather service request timed out.')
            
        except requests.HTTPError as e:
            logger.error(f"Weather API HTTP error: {e}")
            if response.status_code == 401:
                raise WeatherAPIException('Invalid weather API key.')
            elif response.status_code == 404:
                raise WeatherAPIException('Location not found in weather service.')
            raise ExternalAPIException(f'Weather service error: {str(e)}')
            
        except requests.RequestException as e:
            logger.error(f"Weather API request error: {e}")
            raise ExternalAPIException('Failed to connect to weather service.')
    
    def get_current_weather(self, lat: float, lon: float) -> Dict:
        """
        Fetch current weather for coordinates.
        """
        data = self._make_request('weather', {'lat': lat, 'lon': lon})
        return self._normalize_current_weather(data)
    
    def get_forecast(self, lat: float, lon: float, days: int = 7) -> List[Dict]:
        """
        Fetch weather forecast for coordinates.
        """
        data = self._make_request('forecast', {'lat': lat, 'lon': lon})
        return self._normalize_forecast(data, days)
    
    def _normalize_current_weather(self, data: Dict) -> Dict:
        """
        Normalize OpenWeatherMap current weather response.
        """
        main = data.get('main', {})
        wind = data.get('wind', {})
        weather = data.get('weather', [{}])[0]
        rain = data.get('rain', {})
        clouds = data.get('clouds', {})
        
        return {
            'temperature': main.get('temp', 0),
            'feels_like': main.get('feels_like'),
            'humidity': main.get('humidity', 0),
            'pressure': main.get('pressure', 1013),
            'wind_speed': wind.get('speed', 0),
            'wind_direction': wind.get('deg'),
            'wind_gust': wind.get('gust'),
            'rainfall': rain.get('1h', 0) + rain.get('3h', 0),
            'cloudiness': clouds.get('all', 0),
            'visibility': data.get('visibility'),
            'condition': weather.get('main', 'Unknown'),
            'condition_description': weather.get('description', ''),
            'condition_icon': weather.get('icon', ''),
            'source_timestamp': datetime.fromtimestamp(data.get('dt', 0), tz=timezone.utc),
            'raw_data': data,
        }
    
    def _normalize_forecast(self, data: Dict, days: int) -> List[Dict]:
        """
        Normalize OpenWeatherMap forecast response.
        """
        forecasts = []
        forecast_list = data.get('list', [])
        
        # Group by day
        daily_data = {}
        for item in forecast_list:
            dt = datetime.fromtimestamp(item['dt'], tz=timezone.utc)
            date_key = dt.date()
            
            if date_key not in daily_data:
                daily_data[date_key] = []
            daily_data[date_key].append(item)
        
        # Process each day
        for date, items in list(daily_data.items())[:days]:
            temps = [i['main']['temp'] for i in items]
            humidity = [i['main']['humidity'] for i in items]
            pressure = [i['main']['pressure'] for i in items]
            wind = [i['wind']['speed'] for i in items]
            rain_prob = [i.get('pop', 0) * 100 for i in items]
            rain_amount = [i.get('rain', {}).get('3h', 0) for i in items]
            
            # Get most common weather condition
            conditions = [i['weather'][0]['main'] for i in items if i.get('weather')]
            main_condition = max(set(conditions), key=conditions.count) if conditions else 'Unknown'
            
            forecasts.append({
                'forecast_date': date,
                'temperature_high': max(temps),
                'temperature_low': min(temps),
                'humidity': round(sum(humidity) / len(humidity)),
                'pressure': round(sum(pressure) / len(pressure)),
                'wind_speed': round(sum(wind) / len(wind), 2),
                'precipitation_probability': round(max(rain_prob)),
                'rainfall_amount': round(sum(rain_amount), 2),
                'condition': main_condition,
                'condition_description': '',
            })
        
        return forecasts


class WeatherService:
    """
    Service class for weather data operations.
    """
    
    def __init__(self):
        self.api_client = WeatherAPIClient()
    
    def get_live_weather(self, location_id: int) -> ServiceResult:
        """
        Get live weather data for a location.
        First checks for recent cached data, then fetches from API.
        """
        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            return ServiceResult.fail('Location not found.', 'location_not_found')
        
        # Check for recent cached data (within 30 minutes)
        recent_cutoff = timezone.now() - timedelta(minutes=30)
        cached_data = WeatherData.objects.filter(
            location=location,
            created_at__gte=recent_cutoff
        ).first()
        
        if cached_data:
            return ServiceResult.ok({
                'location': {
                    'id': location.id,
                    'name': location.name,
                    'coordinates': location.coordinates,
                },
                'weather': self._serialize_weather_data(cached_data),
                'cached': True,
                'cached_at': cached_data.created_at.isoformat(),
            })
        
        # Fetch fresh data from API
        try:
            weather_data = self.api_client.get_current_weather(
                float(location.latitude),
                float(location.longitude)
            )
            
            # Store in database
            weather_record = WeatherData.objects.create(
                location=location,
                recorded_at=timezone.now(),
                **{k: v for k, v in weather_data.items() if k != 'raw_data'},
                raw_data=weather_data.get('raw_data', {})
            )
            
            logger.info(f"Fetched fresh weather data for {location.name}")
            
            return ServiceResult.ok({
                'location': {
                    'id': location.id,
                    'name': location.name,
                    'coordinates': location.coordinates,
                },
                'weather': self._serialize_weather_data(weather_record),
                'cached': False,
            })
            
        except (WeatherAPIException, ExternalAPIException) as e:
            # Return last known data if available
            last_known = WeatherData.objects.filter(location=location).first()
            if last_known:
                return ServiceResult.ok({
                    'location': {
                        'id': location.id,
                        'name': location.name,
                        'coordinates': location.coordinates,
                    },
                    'weather': self._serialize_weather_data(last_known),
                    'cached': True,
                    'cached_at': last_known.created_at.isoformat(),
                    'warning': 'Using cached data due to API unavailability.',
                })
            
            return ServiceResult.fail(str(e), 'weather_api_error')
    
    def get_weather_history(
        self,
        location_id: int,
        days: int = 7
    ) -> ServiceResult:
        """
        Get historical weather data for a location.
        """
        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            return ServiceResult.fail('Location not found.', 'location_not_found')
        
        start_date = timezone.now() - timedelta(days=days)
        
        history = WeatherData.objects.filter(
            location=location,
            recorded_at__gte=start_date
        ).order_by('recorded_at')
        
        return ServiceResult.ok({
            'location': {
                'id': location.id,
                'name': location.name,
            },
            'period': {
                'start': start_date.isoformat(),
                'end': timezone.now().isoformat(),
                'days': days,
            },
            'data': [self._serialize_weather_data(w) for w in history],
        })
    
    def get_forecast(self, location_id: int, days: int = 7) -> ServiceResult:
        """
        Get weather forecast for a location.
        """
        try:
            location = Location.objects.get(pk=location_id, is_active=True)
        except Location.DoesNotExist:
            return ServiceResult.fail('Location not found.', 'location_not_found')
        
        try:
            forecasts = self.api_client.get_forecast(
                float(location.latitude),
                float(location.longitude),
                days
            )
            
            # Store forecasts
            for forecast_data in forecasts:
                WeatherForecast.objects.update_or_create(
                    location=location,
                    forecast_date=forecast_data['forecast_date'],
                    forecast_hour=None,
                    source='openweather',
                    defaults=forecast_data
                )
            
            return ServiceResult.ok({
                'location': {
                    'id': location.id,
                    'name': location.name,
                },
                'forecasts': forecasts,
            })
            
        except (WeatherAPIException, ExternalAPIException) as e:
            # Return cached forecasts if available
            cached = WeatherForecast.objects.filter(
                location=location,
                forecast_date__gte=timezone.now().date()
            ).order_by('forecast_date')[:days]
            
            if cached.exists():
                return ServiceResult.ok({
                    'location': {
                        'id': location.id,
                        'name': location.name,
                    },
                    'forecasts': [
                        {
                            'forecast_date': f.forecast_date,
                            'temperature_high': float(f.temperature_high),
                            'temperature_low': float(f.temperature_low),
                            'humidity': f.humidity,
                            'precipitation_probability': f.precipitation_probability,
                            'condition': f.condition,
                        }
                        for f in cached
                    ],
                    'cached': True,
                    'warning': 'Using cached forecast due to API unavailability.',
                })
            
            return ServiceResult.fail(str(e), 'weather_api_error')
    
    def _serialize_weather_data(self, weather: WeatherData) -> Dict:
        """Serialize weather data record."""
        return {
            'id': weather.id,
            'temperature': float(weather.temperature),
            'feels_like': float(weather.feels_like) if weather.feels_like else None,
            'humidity': weather.humidity,
            'pressure': weather.pressure,
            'wind_speed': float(weather.wind_speed),
            'wind_direction': weather.wind_direction,
            'rainfall': float(weather.rainfall),
            'cloudiness': weather.cloudiness,
            'visibility': weather.visibility,
            'condition': weather.condition,
            'condition_description': weather.condition_description,
            'recorded_at': weather.recorded_at.isoformat(),
        }
