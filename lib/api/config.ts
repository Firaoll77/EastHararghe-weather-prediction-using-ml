/**
 * API configuration for the Weather Prediction Backend.
 */

// API base URL - empty = use Next.js rewrites proxy (recommended for browser compatibility)
// Set NEXT_PUBLIC_API_URL only for production or direct backend access
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '';

// API endpoints - using /backend/ prefix to route through Next.js proxy
// which forwards to http://localhost:8000 without conflicting with /app/api/ routes
export const API_ENDPOINTS = {
  // Authentication & User Profile
  auth: {
    register: '/backend/api/auth/signup',
    login: '/backend/api/auth/login',
    logout: '/backend/api/auth/logout',
    verify: '/backend/api/auth/verify-token',
    profile: '/backend/api/auth/profile',
    createProfile: '/backend/api/auth/create-profile',
  },
  
  // Weather
  weather: {
    current: '/backend/api/weather/current',
    predict: '/backend/api/weather/predict',
    woredas: '/backend/api/weather/woredas',
  },
  
  // Predictions
  predictions: {
    history: '/backend/api/predictions/history',
  },
  
  // Admin
  admin: {
    users: '/backend/api/admin/users',
    predictions: '/backend/api/admin/predictions',
    systemStatus: '/backend/api/admin/system-status',
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
