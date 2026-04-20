/**
 * ML API Module
 * 
 * Exports for the AWS FastAPI ML service integration.
 */

export { mlApiClient, MLAPIClientError } from './client';
export { ML_API_CONFIG, EAST_HARARGHE_LOCATIONS } from './config';
export type { LocationId } from './config';
export type {
  PredictionInput,
  PredictionResponse,
  ForecastResponse,
  HealthCheckResponse,
  ModelInfoResponse,
  MLAPIError,
  WeatherData,
  PredictionWithContext,
} from './types';
