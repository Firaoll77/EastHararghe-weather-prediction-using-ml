/**
 * Predictions API service.
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  ApiResponse,
  PredictionRequest,
  PredictionResponse,
  CustomPredictionRequest,
  CustomPredictionResponse,
  PredictionHistoryResponse,
  ModelStatus,
} from '../types';

// Map legacy numerical IDs to Woreda names
const woredaMap: Record<number, string> = {
  1: 'Babile',
  2: 'Fedis',
  3: 'Gursum',
  4: 'Haramaya',
  5: 'Kersa',
  6: 'Gola Oda',
  7: 'Midega Tola',
  8: 'Harar',
  9: 'Dire Dawa',
  10: 'Kombolcha'
};

function getWoredaName(locationId: number): string {
  return woredaMap[locationId] || 'Babile';
}

/**
 * Make a rainfall prediction for a location.
 * Uses live weather data by default.
 */
export async function makePrediction(
  data: PredictionRequest
): Promise<ApiResponse<PredictionResponse>> {
  const woreda = getWoredaName(data.location_id);
  // FastAPI uses GET for prediction with woreda parameter
  return api.get<PredictionResponse>(API_ENDPOINTS.weather.predict, {
    params: { woreda },
    skipAuth: true, // Allow anonymous predictions
  });
}

/**
 * Make a prediction with custom weather features.
 * (Not currently supported by demo FastAPI backend)
 */
export async function makeCustomPrediction(
  data: CustomPredictionRequest
): Promise<ApiResponse<CustomPredictionResponse>> {
  return { success: false, error: 'Endpoint not supported' };
}

/**
 * Get ML model status.
 * (Supported by Admin endpoint but needs admin auth, so keeping simple here)
 */
export async function getModelStatus(): Promise<ApiResponse<ModelStatus>> {
  return { success: false, error: 'Endpoint not supported directly for public' };
}

/**
 * Get prediction history for the authenticated user.
 */
export async function getPredictionHistory(
  locationId?: number,
  limit: number = 50
): Promise<ApiResponse<PredictionHistoryResponse>> {
  const params: Record<string, string | number> = { limit };
  if (locationId) {
    params.woreda = getWoredaName(locationId);
  }
  
  return api.get<PredictionHistoryResponse>(API_ENDPOINTS.predictions.history, {
    params,
  });
}
