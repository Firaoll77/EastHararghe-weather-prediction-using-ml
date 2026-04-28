/**
 * Locations API service.
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  ApiResponse,
  Location,
  LocationListItem,
} from '../types';

/**
 * Get all active locations.
 */
export async function getLocations(): Promise<ApiResponse<LocationListItem[]>> {
  // Map the FastAPI response to match the legacy format if necessary
  const response = await api.get<any[]>(API_ENDPOINTS.weather.woredas, {
    skipAuth: true,
  });
  
  if (response.success && response.data) {
    // Convert { name: 'Babile', coordinates: { ... } } to LocationListItem
    const formattedData: LocationListItem[] = response.data.map((item, index) => ({
      id: index + 1, // Fallback ID
      name: item.name,
      district: 'East Hararghe',
      latitude: item.coordinates?.latitude || 0,
      longitude: item.coordinates?.longitude || 0,
    }));
    return { ...response, data: formattedData } as any;
  }
  
  return response as any;
}

/**
 * Get location details by ID.
 * (Not currently supported by FastAPI backend)
 */
export async function getLocation(id: number): Promise<ApiResponse<Location>> {
  return { success: false, error: 'Endpoint not supported' };
}

/**
 * Search locations by name.
 * (Not currently supported by FastAPI backend)
 */
export async function searchLocations(
  query: string
): Promise<ApiResponse<LocationListItem[]>> {
  return { success: false, error: 'Endpoint not supported' };
}
