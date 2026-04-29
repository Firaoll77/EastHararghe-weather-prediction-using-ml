/**
 * API Client for the Weather Prediction Backend.
 * Handles authentication, requests, and error handling.
 * Uses Supabase for authentication tokens.
 */

import { API_BASE_URL, REQUEST_TIMEOUT } from './config';
import { createClient } from '@/lib/supabase/client';
import type { ApiResponse } from './types';

// Types for internal use
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Get the current Supabase access token.
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (has a Supabase session).
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

/**
 * Build URL with query parameters.
 */
function buildUrl(endpoint: string, params?: RequestOptions['params']): string {
  // When API_BASE_URL is empty, use window.location.origin for browser
  // or a placeholder for SSR (requests are relative via Next.js proxy)
  const base = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const baseUrl = base.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = new URL(`${baseUrl}/${cleanEndpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Main API request function with authentication and error handling.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    params,
    timeout = REQUEST_TIMEOUT,
    skipAuth = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  
  // Build URL with query params
  const url = buildUrl(endpoint, params);
  
  // Set up headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  
  // Add authorization header if authenticated and not skipped
  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`[API] Requesting: ${url}`, { method: fetchOptions.method || 'GET' });
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    console.log(`[API] Response status: ${response.status}`);

    clearTimeout(timeoutId);
    
    // Parse response
    const text = await response.text();
    console.log(`[API] Response body (first 200 chars):`, text.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[API] Failed to parse JSON from ${url}. Response:`, text.substring(0, 500));
      return {
        success: false,
        error: `Server returned HTML instead of JSON. Is the backend running?`,
        code: 'invalid_json',
      };
    }
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Extract error message from various Django response formats
      let errorMessage = 'Request failed';
      if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      } else if (data.errors) {
        // Flatten Django field validation errors
        errorMessage = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('; ');
      } else if (data.detail) {
        errorMessage = data.detail;
      }
      
      return {
        success: false,
        error: errorMessage,
        code: data.error?.code || data.code,
        errors: data.errors,
      };
    }
    
    return data as ApiResponse<T>;
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[API] Request failed:`, error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out',
        code: 'timeout',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      code: 'network_error',
    };
  }
}

// Export HTTP method helpers
export const api = {
  /**
   * GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  
  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
