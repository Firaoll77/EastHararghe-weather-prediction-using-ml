/**
 * API configuration for the Weather Prediction Backend.
 */

// API base URL - defaults to localhost for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication & User Profile
  auth: {
    register: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify-token',
    profile: '/api/auth/profile',
    createProfile: '/api/auth/create-profile',
  },
  
  // Weather
  weather: {
    current: '/api/weather/current',
    predict: '/api/weather/predict',
    woredas: '/api/weather/woredas',
  },
  
  // Predictions
  predictions: {
    history: '/api/predictions/history',
  },
  
  // Admin
  admin: {
    users: '/api/admin/users',
    predictions: '/api/admin/predictions',
    systemStatus: '/api/admin/system-status',
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
