/**
 * ML API Type Definitions
 * 
 * These types match the expected request/response format
 * of your AWS FastAPI ML service.
 */

// Input features for ML prediction
export interface PredictionInput {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction?: number;
  cloud_cover?: number;
  // Historical features (optional)
  prev_day_rainfall?: number;
  prev_week_avg_rainfall?: number;
  season?: 'dry' | 'wet' | 'transition';
  month?: number;
  day_of_year?: number;
}

// ML model prediction response
export interface PredictionResponse {
  prediction: {
    rainfall_mm: number;
    category: 'none' | 'light' | 'moderate' | 'heavy' | 'extreme';
    probability: number;
  };
  confidence: number;
  model_version: string;
  features_used: string[];
  timestamp: string;
}

// Multi-day forecast
export interface ForecastResponse {
  location: string;
  forecasts: Array<{
    date: string;
    rainfall_mm: number;
    category: string;
    confidence: number;
    temperature_high: number;
    temperature_low: number;
    humidity: number;
  }>;
  generated_at: string;
  model_version: string;
}

// API error response
export interface MLAPIError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  model_loaded: boolean;
  model_version: string;
  uptime_seconds: number;
  last_prediction_at?: string;
}

// Model info response
export interface ModelInfoResponse {
  name: string;
  version: string;
  trained_at: string;
  accuracy: number;
  features: string[];
  description: string;
}

// Weather data from OpenWeatherMap or similar
export interface WeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  cloud_cover: number;
  visibility: number;
  description: string;
  icon: string;
  timestamp: string;
}

// Combined prediction with weather context
export interface PredictionWithContext {
  prediction: PredictionResponse;
  weather: WeatherData;
  location: {
    id: string;
    name: string;
    lat: number;
    lon: number;
  };
}
