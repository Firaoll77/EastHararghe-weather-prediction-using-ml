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
  const response = await api.get<any>(API_ENDPOINTS.weather.current, {
    params: { woreda },
    skipAuth: true, // Public endpoint
  });

  if (response.success && response.data) {
    // Map flat FastAPI response to nested UI structure
    const mappedData: LiveWeatherResponse = {
      location: {
        id: locationId,
        name: response.data.location,
        coordinates: [0, 0], // Optional in UI
      },
      weather: {
        id: 0,
        temperature: response.data.temperature,
        feels_like: response.data.temperature,
        humidity: response.data.humidity,
        pressure: response.data.pressure,
        wind_speed: response.data.wind_speed,
        wind_direction: 0,
        rainfall: 0,
        cloudiness: response.data.cloud_cover || 0,
        visibility: 10000,
        condition: 'Clear',
        condition_description: 'Sky is clear',
        recorded_at: response.data.timestamp,
      },
      cached: response.data.cached || false,
    };
    return { ...response, data: mappedData } as any;
  }

  return response;
}

/**
 * Get weather history for a location.
 */
export async function getWeatherHistory(
  locationId: number,
  days: number = 7
): Promise<ApiResponse<WeatherHistoryResponse>> {
  const woreda = getWoredaName(locationId);
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
  const response = await api.get<any>(API_ENDPOINTS.weather.predict, {
    params: { woreda },
    skipAuth: true, // Public endpoint
  });

  if (response.success && response.data) {
    // Map FastAPI prediction response to forecast format
    const mappedData: WeatherForecastResponse = {
      location: {
        id: locationId,
        name: response.data.location,
      },
      forecasts: [
        {
          forecast_date: response.data.timestamp,
          temperature_high: response.data.features.TS + 2,
          temperature_low: response.data.features.TS - 2,
          humidity: response.data.features.RH2M,
          pressure: response.data.features.PS,
          wind_speed: response.data.features.WS2M,
          precipitation_probability: response.data.prediction > 0 ? 70 : 10,
          rainfall_amount: response.data.prediction,
          condition: response.data.prediction > 5 ? 'Rainy' : 'Sunny',
          condition_description: response.data.prediction > 5 ? 'Expected rainfall' : 'Clear sky',
        }
      ],
    };
    return { ...response, data: mappedData } as any;
  }

  return response;
}
