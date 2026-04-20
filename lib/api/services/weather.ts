/**
 * Weather API service.
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  ApiResponse,
  LiveWeatherResponse,
  WeatherHistoryResponse,
  WeatherForecastResponse,
} from '../types';

/**
 * Get live weather data for a location.
 */
export async function getLiveWeather(
  locationId: number
): Promise<ApiResponse<LiveWeatherResponse>> {
  return api.get<LiveWeatherResponse>(API_ENDPOINTS.weather.live, {
    params: { location_id: locationId },
    skipAuth: true, // Public endpoint
  });
}

/**
 * Get weather history for a location.
 */
export async function getWeatherHistory(
  locationId: number,
  days: number = 7
): Promise<ApiResponse<WeatherHistoryResponse>> {
  return api.get<WeatherHistoryResponse>(API_ENDPOINTS.weather.history, {
    params: { location_id: locationId, days },
  });
}

/**
 * Get weather forecast for a location.
 */
export async function getWeatherForecast(
  locationId: number,
  days: number = 7
): Promise<ApiResponse<WeatherForecastResponse>> {
  return api.get<WeatherForecastResponse>(API_ENDPOINTS.weather.forecast, {
    params: { location_id: locationId, days },
    skipAuth: true, // Public endpoint
  });
}
