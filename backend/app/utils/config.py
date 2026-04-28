from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Open-Meteo API
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    
    # East Hararghe Woredas with coordinates
    EAST_HARARGHE_WOREDAS: dict = {
        'Haramaya': {'latitude': 9.2667, 'longitude': 42.0333},
        'Deder': {'latitude': 9.2500, 'longitude': 41.8833},
        'Bedeno': {'latitude': 9.1167, 'longitude': 41.9667},
        'Babile': {'latitude': 9.1333, 'longitude': 42.2000},
        'Chinaksen': {'latitude': 9.3833, 'longitude': 41.8500},
        'Goro Gutu': {'latitude': 9.1500, 'longitude': 41.7500},
        'Kersa': {'latitude': 9.4167, 'longitude': 42.1167},
        'Kurfachu': {'latitude': 9.2500, 'longitude': 41.9167},
        'Mullu': {'latitude': 9.3333, 'longitude': 42.0833},
        'Meta': {'latitude': 9.0833, 'longitude': 42.2500},
        'Fedis': {'latitude': 9.1167, 'longitude': 42.0500},
        'Gursum': {'latitude': 9.3500, 'longitude': 42.4167},
        'Gola Oda': {'latitude': 8.9833, 'longitude': 42.4333},
        'Midega Tola': {'latitude': 9.2000, 'longitude': 42.2167},
        'Jarso': {'latitude': 9.4833, 'longitude': 42.2333},
        'Meyumuluke': {'latitude': 8.8167, 'longitude': 42.4500},
        'Midhaga Tola': {'latitude': 9.1500, 'longitude': 42.3000},
        'Harar': {'latitude': 9.3117, 'longitude': 42.1194},
        'Dire Dawa': {'latitude': 9.5931, 'longitude': 41.8661},
        'Kombolcha': {'latitude': 9.4333, 'longitude': 42.1000}
    }

    
    WOREDA_NAMES: List[str] = list(EAST_HARARGHE_WOREDAS.keys())
    
    # Cache settings
    CACHE_DURATION: int = 3600  # 1 hour in seconds
    
    # ML Model settings
    MODEL_PATH: str = "app/ml/models/eastern_hararghe_final_model.pkl"
    SCALER_PATH: str = "app/ml/models/weather_scaler.pkl"
    
    # JWT settings
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # API settings
    API_PREFIX: str = "/api"
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Validate required settings
required_settings = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY", 
    "JWT_SECRET"
]

for setting in required_settings:
    if not getattr(settings, setting):
        raise ValueError(f"Required setting {setting} is not configured")
