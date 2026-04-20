/**
 * AWS FastAPI ML Service Configuration
 * 
 * This module configures the connection to your external AWS-hosted
 * FastAPI ML prediction service.
 */

export const ML_API_CONFIG = {
  // Base URL for the AWS FastAPI ML service
  // Set via environment variable for different environments
  baseUrl: process.env.NEXT_PUBLIC_ML_API_URL || 'https://your-ml-api.aws.com',
  
  // API endpoints
  endpoints: {
    predict: '/api/v1/predict',
    health: '/api/v1/health',
    models: '/api/v1/models',
  },
  
  // Request configuration
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  
  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// East Hararghe district locations with coordinates
export const EAST_HARARGHE_LOCATIONS = [
  { id: 'harar', name: 'Harar', lat: 9.3117, lon: 42.1194 },
  { id: 'dire_dawa', name: 'Dire Dawa', lat: 9.5931, lon: 41.8661 },
  { id: 'haramaya', name: 'Haramaya', lat: 9.4000, lon: 42.0167 },
  { id: 'kombolcha', name: 'Kombolcha', lat: 9.4333, lon: 42.1000 },
  { id: 'kersa', name: 'Kersa', lat: 9.3667, lon: 41.9167 },
  { id: 'gursum', name: 'Gursum', lat: 9.3500, lon: 42.4167 },
  { id: 'babile', name: 'Babile', lat: 9.2167, lon: 42.3333 },
  { id: 'fedis', name: 'Fedis', lat: 9.1167, lon: 42.0500 },
  { id: 'gola_oda', name: 'Gola Oda', lat: 8.9833, lon: 42.4333 },
  { id: 'midega_tola', name: 'Midega Tola', lat: 9.2000, lon: 42.2167 },
] as const;

export type LocationId = typeof EAST_HARARGHE_LOCATIONS[number]['id'];
