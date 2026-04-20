/**
 * API configuration for the Weather Prediction Backend.
 */

// API base URL - defaults to localhost for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: '/auth/register/',
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
  },
  
  // User
  user: {
    profile: '/user/profile/',
    changePassword: '/user/change-password/',
    predictions: '/user/predictions/',
    activities: '/user/activities/',
  },
  
  // Weather
  weather: {
    live: '/weather/live/',
    history: '/weather/history/',
    forecast: '/weather/forecast/',
  },
  
  // Predictions
  predict: {
    predict: '/predict/',
    custom: '/predict/custom/',
    status: '/predict/status/',
    history: '/predict/history/',
  },
  
  // Locations
  locations: {
    list: '/locations/',
    search: '/locations/search/',
    detail: (id: number) => `/locations/${id}/`,
  },
} as const;

// Token storage keys
export const TOKEN_KEYS = {
  accessToken: 'weather_access_token',
  refreshToken: 'weather_refresh_token',
} as const;

// Request timeout (ms)
export const REQUEST_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
};
