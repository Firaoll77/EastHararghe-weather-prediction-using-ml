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

/**
 * Make a rainfall prediction for a location.
 * Uses live weather data by default, or custom features if provided.
 */
export async function makePrediction(
  data: PredictionRequest
): Promise<ApiResponse<PredictionResponse>> {
  return api.post<PredictionResponse>(API_ENDPOINTS.predict.predict, data, {
    skipAuth: true, // Allow anonymous predictions
  });
}

/**
 * Make a prediction with custom weather features.
 * Useful for "what-if" scenarios.
 */
export async function makeCustomPrediction(
  data: CustomPredictionRequest
): Promise<ApiResponse<CustomPredictionResponse>> {
  return api.post<CustomPredictionResponse>(API_ENDPOINTS.predict.custom, data, {
    skipAuth: true,
  });
}

/**
 * Get ML model status.
 */
export async function getModelStatus(): Promise<ApiResponse<ModelStatus>> {
  return api.get<ModelStatus>(API_ENDPOINTS.predict.status, {
    skipAuth: true,
  });
}

/**
 * Get prediction history for the authenticated user.
 */
export async function getPredictionHistory(
  locationId?: number,
  limit: number = 50
): Promise<ApiResponse<PredictionHistoryResponse>> {
  return api.get<PredictionHistoryResponse>(API_ENDPOINTS.predict.history, {
    params: {
      location_id: locationId,
      limit,
    },
  });
}
