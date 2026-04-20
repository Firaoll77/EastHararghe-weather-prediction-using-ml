/**
 * TypeScript types for the Weather Prediction API.
 * These interfaces match the Django REST Framework responses.
 */

// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================
// User Types
// ============================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  organization: string;
  role: UserRole;
  default_location: number | null;
  is_verified: boolean;
  email_notifications: boolean;
  alert_notifications: boolean;
  date_joined: string;
  last_login: string | null;
}

export type UserRole = 'farmer' | 'researcher' | 'government' | 'student' | 'other';

export interface UserRegistrationData {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  organization?: string;
  role?: UserRole;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  organization?: string;
  role?: UserRole;
  default_location?: number;
  email_notifications?: boolean;
  alert_notifications?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    is_verified: boolean;
  };
  access: string;
  refresh: string;
}

export interface RegistrationResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface UserActivity {
  id: number;
  action: string;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================
// Location Types
// ============================================

export interface Location {
  id: number;
  name: string;
  name_amharic: string;
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevation: number | null;
  district: string;
  zone: string;
  region: string;
  has_weather_station: boolean;
  is_active: boolean;
}

export interface LocationListItem {
  id: number;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
}

// ============================================
// Weather Types
// ============================================

export interface WeatherData {
  id: number;
  temperature: number;
  feels_like: number | null;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number | null;
  rainfall: number;
  cloudiness: number;
  visibility: number | null;
  condition: string;
  condition_description: string;
  recorded_at: string;
}

export interface LiveWeatherResponse {
  location: {
    id: number;
    name: string;
    coordinates: [number, number];
  };
  weather: WeatherData;
  cached: boolean;
  cached_at?: string;
  warning?: string;
}

export interface WeatherHistoryResponse {
  location: {
    id: number;
    name: string;
  };
  period: {
    start: string;
    end: string;
    days: number;
  };
  data: WeatherData[];
}

export interface WeatherForecast {
  forecast_date: string;
  temperature_high: number;
  temperature_low: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  precipitation_probability: number;
  rainfall_amount: number;
  condition: string;
  condition_description: string;
}

export interface WeatherForecastResponse {
  location: {
    id: number;
    name: string;
  };
  forecasts: WeatherForecast[];
  cached?: boolean;
  warning?: string;
}

// ============================================
// Prediction Types
// ============================================

export interface PredictionRequest {
  location_id: number;
  // Optional custom features (override live weather)
  temperature?: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  cloudiness?: number;
}

export interface CustomPredictionRequest {
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  cloudiness?: number;
  location_id?: number;
}

export type RainfallCategory = 'none' | 'light' | 'moderate' | 'heavy' | 'extreme';

export interface PredictionResult {
  rainfall_mm: number;
  category: RainfallCategory;
  category_label: string;
  confidence: number | null;
}

export interface PredictionResponse {
  prediction_id: number;
  location: {
    id: number;
    name: string;
    coordinates: [number, number];
  };
  input_features: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    cloudiness: number;
  };
  prediction: PredictionResult;
  model_info: {
    version: string;
    type: string;
  };
  predicted_at: string;
}

export interface CustomPredictionResponse {
  input_features: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    cloudiness: number;
  };
  prediction: PredictionResult;
  model_info: {
    version: string;
    type: string;
  };
}

export interface PredictionHistoryItem {
  id: number;
  location: {
    id: number;
    name: string;
  };
  predicted_rainfall: number;
  rainfall_category: RainfallCategory;
  confidence: number | null;
  created_at: string;
}

export interface PredictionHistoryResponse {
  count: number;
  predictions: PredictionHistoryItem[];
}

export interface ModelStatus {
  model_loaded: boolean;
  model_version: string;
  model_type: string;
  feature_names: string[];
  scaler_loaded: boolean;
}

// ============================================
// Utility Types
// ============================================

export type WeatherCondition = 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'stormy';

export interface Alert {
  id: string;
  type: 'flood' | 'storm' | 'drought' | 'heatwave';
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  location: string;
  validUntil: string;
  timestamp: string;
}
