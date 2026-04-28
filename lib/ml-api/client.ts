/**
 * AWS FastAPI ML Service Client
 * 
 * Typed client for communicating with your external ML prediction service.
 * Includes retry logic, error handling, and request/response transformation.
 */

import { ML_API_CONFIG } from './config';
import type {
  PredictionInput,
  PredictionResponse,
  ForecastResponse,
  HealthCheckResponse,
  ModelInfoResponse,
  MLAPIError,
} from './types';

class MLAPIClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MLAPIClientError';
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = ML_API_CONFIG.retries
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_API_CONFIG.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Partial<MLAPIError>;
        throw new MLAPIClientError(
          errorData.error || `HTTP error ${response.status}`,
          errorData.code || 'HTTP_ERROR',
          response.status,
          errorData.details
        );
      }
      
      return await response.json() as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof MLAPIClientError && error.statusCode && error.statusCode < 500) {
        throw error;
      }
      
      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MLAPIClientError('Request timeout', 'TIMEOUT');
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await sleep(ML_API_CONFIG.retryDelay * Math.pow(2, attempt));
      }
    }
  }
  
  throw lastError || new MLAPIClientError('Unknown error', 'UNKNOWN');
}

/**
 * ML API Client
 * 
 * Use this client to interact with your AWS FastAPI ML service.
 */
export const mlApiClient = {
  /**
   * Get a rainfall prediction for the given input features
   */
  async predict(input: PredictionInput): Promise<PredictionResponse> {
    const url = `${ML_API_CONFIG.baseUrl}${ML_API_CONFIG.endpoints.predict}`;
    
    return fetchWithRetry<PredictionResponse>(url, {
      method: 'POST',
      headers: {
        ...ML_API_CONFIG.defaultHeaders,
        // Add API key if configured
        ...(process.env.ML_API_KEY && {
          'Authorization': `Bearer ${process.env.ML_API_KEY}`,
        }),
      },
      body: JSON.stringify(input),
    });
  },
  
  /**
   * Get a multi-day forecast for a location
   */
  async getForecast(
    location: string,
    latitude: number,
    longitude: number,
    days = 7
  ): Promise<ForecastResponse> {
    const url = `${ML_API_CONFIG.baseUrl}${ML_API_CONFIG.endpoints.predict}/forecast`;
    
    return fetchWithRetry<ForecastResponse>(url, {
      method: 'POST',
      headers: {
        ...ML_API_CONFIG.defaultHeaders,
        ...(process.env.ML_API_KEY && {
          'Authorization': `Bearer ${process.env.ML_API_KEY}`,
        }),
      },
      body: JSON.stringify({ location, latitude, longitude, days }),
    });
  },
  
  /**
   * Check the health status of the ML service
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const url = `${ML_API_CONFIG.baseUrl}${ML_API_CONFIG.endpoints.health}`;
    
    return fetchWithRetry<HealthCheckResponse>(url, {
      method: 'GET',
      headers: ML_API_CONFIG.defaultHeaders,
    });
  },
  
  /**
   * Get information about the deployed model
   */
  async getModelInfo(): Promise<ModelInfoResponse> {
    const url = `${ML_API_CONFIG.baseUrl}${ML_API_CONFIG.endpoints.models}`;
    
    return fetchWithRetry<ModelInfoResponse>(url, {
      method: 'GET',
      headers: ML_API_CONFIG.defaultHeaders,
    });
  },
};

export { MLAPIClientError };
