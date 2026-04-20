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
  return api.get<LocationListItem[]>(API_ENDPOINTS.locations.list, {
    skipAuth: true,
  });
}

/**
 * Get location details by ID.
 */
export async function getLocation(id: number): Promise<ApiResponse<Location>> {
  return api.get<Location>(API_ENDPOINTS.locations.detail(id), {
    skipAuth: true,
  });
}

/**
 * Search locations by name.
 */
export async function searchLocations(
  query: string
): Promise<ApiResponse<LocationListItem[]>> {
  return api.get<LocationListItem[]>(API_ENDPOINTS.locations.search, {
    params: { q: query },
    skipAuth: true,
  });
}
