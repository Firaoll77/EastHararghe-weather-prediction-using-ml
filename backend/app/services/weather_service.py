import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from app.services.database import DatabaseService
from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class WeatherService:
    """Service for weather data operations"""
    
    @staticmethod
    def validate_woreda(woreda: str) -> bool:
        """Validate woreda name"""
        return woreda in settings.WOREDA_NAMES
    
    @staticmethod
    def get_woreda_coordinates(woreda: str) -> Dict[str, float]:
        """Get coordinates for woreda"""
        if not WeatherService.validate_woreda(woreda):
            raise ValueError(f"Invalid woreda: {woreda}")
        return settings.EAST_HARARGHE_WOREDAS[woreda]
    
    @staticmethod
    async def fetch_from_open_meteo(woreda: str) -> Dict[str, Any]:
        """Fetch weather data from Open-Meteo API"""
        try:
            coords = WeatherService.get_woreda_coordinates(woreda)
            
            params = {
                'latitude': coords['latitude'],
                'longitude': coords['longitude'],
                'current': [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'surface_pressure',
                    'wind_speed_10m',
                    'cloudcover'
                ],
                'timezone': 'Africa/Addis_Ababa'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(settings.OPEN_METEO_BASE_URL + '/forecast', params=params)
                response.raise_for_status()
                
                data = response.json()
                current = data['current']
                
                return {
                    'location': woreda,
                    'temperature': current['temperature_2m'],
                    'humidity': current['relative_humidity_2m'],
                    'pressure': current['surface_pressure'],
                    'wind_speed': current['wind_speed_10m'],
                    'cloud_cover': current['cloudcover'],
                    'timestamp': datetime.now().isoformat(),
                    'raw_data': data
                }
        except Exception as e:
            logger.error(f"Error fetching from Open-Meteo: {e}")
            raise
    
    @staticmethod
    async def get_current_weather(woreda: str) -> Dict[str, Any]:
        """Get current weather data (with caching)"""
        try:
            # Validate woreda
            WeatherService.validate_woreda(woreda)
            
            # Check cache first
            cached_weather = await DatabaseService.get_recent_weather(woreda, hours=1)
            if cached_weather:
                logger.info(f"Returning cached weather for {woreda}")
                return {
                    'location': cached_weather['location'],
                    'temperature': cached_weather['temperature'],
                    'humidity': cached_weather['humidity'],
                    'pressure': cached_weather['pressure'],
                    'wind_speed': cached_weather['wind_speed'],
                    'cloud_cover': cached_weather['raw_weather_data']['current']['cloudcover'],
                    'timestamp': cached_weather['timestamp'],
                    'cached': True
                }
            
            # Fetch fresh data
            weather_data = await WeatherService.fetch_from_open_meteo(woreda)
            
            # Save to database
            await DatabaseService.save_weather_data({
                'location': weather_data['location'],
                'raw_weather_data': weather_data['raw_data'],
                'temperature': weather_data['temperature'],
                'humidity': weather_data['humidity'],
                'pressure': weather_data['pressure'],
                'wind_speed': weather_data['wind_speed']
            })
            
            return {
                'location': weather_data['location'],
                'temperature': weather_data['temperature'],
                'humidity': weather_data['humidity'],
                'pressure': weather_data['pressure'],
                'wind_speed': weather_data['wind_speed'],
                'cloud_cover': weather_data['cloud_cover'],
                'timestamp': weather_data['timestamp'],
                'cached': False
            }
            
        except Exception as e:
            logger.error(f"Error getting current weather: {e}")
            raise
    
    @staticmethod
    def transform_to_ml_features(weather_data: Dict[str, Any]) -> Dict[str, float]:
        """Transform weather data to ML features"""
        current_month = datetime.now().month
        
        return {
            'TS': weather_data['temperature'],
            'RH2M': weather_data['humidity'],
            'PS': weather_data['pressure'],
            'WS2M': weather_data['wind_speed'],
            'CLOUD_AMT': weather_data['cloud_cover'],
            'month': current_month
        }
    
    @staticmethod
    def get_supported_woredas() -> list:
        """Get list of supported woredas"""
        return [
            {'name': name, 'coordinates': coords}
            for name, coords in settings.EAST_HARARGHE_WOREDAS.items()
        ]
