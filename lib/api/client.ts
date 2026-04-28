/**
 * API Client for the Weather Prediction Backend.
 * Handles authentication, requests, and error handling.
 */

import { API_BASE_URL, TOKEN_KEYS, REQUEST_TIMEOUT } from './config';
import type { ApiResponse, AuthTokens } from './types';

// Types for internal use
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Get stored authentication tokens from localStorage.
 */
export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  const access = localStorage.getItem(TOKEN_KEYS.accessToken);
  const refresh = localStorage.getItem(TOKEN_KEYS.refreshToken);
  
  if (access && refresh) {
    return { access, refresh };
  }
  return null;
}

/**
 * Store authentication tokens in localStorage.
 */
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEYS.accessToken, tokens.access);
  localStorage.setItem(TOKEN_KEYS.refreshToken, tokens.refresh);
}

/**
 * Clear stored authentication tokens.
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEYS.accessToken);
  localStorage.removeItem(TOKEN_KEYS.refreshToken);
}

/**
 * Check if user is authenticated (has valid tokens).
 */
export function isAuthenticated(): boolean {
  return getStoredTokens() !== null;
}

/**
 * Refresh the access token using the refresh token.
 */
async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh) return null;
  
  try {
    const url = buildUrl(API_ENDPOINTS.auth.verify); // Use verify as a fallback for refresh check
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: tokens.access }), // Verify current token
    });
    
    if (!response.ok) {
      clearTokens();
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.data?.access) {
      storeTokens({
        access: data.data.access,
        refresh: data.data.refresh || tokens.refresh,
      });
      return data.data.access;
    }
    
    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Build URL with query parameters.
 */
function buildUrl(endpoint: string, params?: RequestOptions['params']): string {
  // Ensure we don't have double slashes when joining
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
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
    const tokens = getStoredTokens();
    if (tokens?.access) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.access}`;
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
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && !skipAuth) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      } else {
        // Token refresh failed - user needs to log in again
        return {
          success: false,
          error: 'Session expired. Please log in again.',
          code: 'session_expired',
        };
      }
    }
    
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
