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
 * Get live weather data for a location.
 */
export async function getLiveWeather(
  locationId: number
): Promise<ApiResponse<LiveWeatherResponse>> {
  const woreda = getWoredaName(locationId);
  return api.get<LiveWeatherResponse>(API_ENDPOINTS.weather.current, {
    params: { woreda },
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
  const woreda = getWoredaName(locationId);
  // Backend doesn't support 'days' parameter for history yet, but we'll pass woreda
  return api.get<WeatherHistoryResponse>(API_ENDPOINTS.predictions.history, {
    params: { woreda },
  });
}

/**
 * Get weather forecast for a location.
 */
export async function getWeatherForecast(
  locationId: number,
  days: number = 7
): Promise<ApiResponse<WeatherForecastResponse>> {
  const woreda = getWoredaName(locationId);
  return api.get<WeatherForecastResponse>(API_ENDPOINTS.weather.predict, {
    params: { woreda },
    skipAuth: true, // Public endpoint
  });
}
