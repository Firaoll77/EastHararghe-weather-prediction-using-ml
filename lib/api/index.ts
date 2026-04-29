/**
 * Weather Prediction API Client
 * 
 * Centralized exports for the API client and services.
 * 
 * Usage:
 * ```ts
 * import { authService, weatherService, predictionsService, locationsService } from '@/lib/api';
 * 
 * // Login
 * const response = await authService.login({ email, password });
 * 
 * // Get weather
 * const weather = await weatherService.getLiveWeather(locationId);
 * 
 * // Make prediction
 * const prediction = await predictionsService.makePrediction({ location_id: 1 });
 * ```
 */

// Re-export types
export * from './types';

// Re-export config
export { API_BASE_URL, API_ENDPOINTS, TOKEN_KEYS } from './config';

// Re-export client utilities
export {
  api,
  isAuthenticated,
} from './client';

// Import and re-export services as namespaces
import * as authService from './services/auth';
import * as weatherService from './services/weather';
import * as predictionsService from './services/predictions';
import * as locationsService from './services/locations';

export {
  authService,
  weatherService,
  predictionsService,
  locationsService,
};
