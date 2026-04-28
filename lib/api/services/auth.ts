/**
 * Authentication API service.
 */

import { api, storeTokens, clearTokens, getStoredTokens } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  UserRegistrationData,
  RegistrationResponse,
  ChangePasswordData,
  User,
  UserProfileUpdate,
} from '../types';

/**
 * Register a new user account.
 */
export async function register(
  data: UserRegistrationData
): Promise<ApiResponse<RegistrationResponse>> {
  const response = await api.post<RegistrationResponse>(
    API_ENDPOINTS.auth.register,
    data,
    { skipAuth: true }
  );
  
  // Store tokens if registration successful
  if (response.success && response.data?.tokens) {
    storeTokens(response.data.tokens);
  }
  
  return response;
}

/**
 * Log in with email and password.
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<LoginResponse>(
    API_ENDPOINTS.auth.login,
    credentials,
    { skipAuth: true }
  );
  
  // Store tokens if login successful
  if (response.success && response.data) {
    storeTokens({
      access: response.data.access,
      refresh: response.data.refresh || '', // Refresh token might not be returned by demo login
    });
  }
  
  return response;
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  // Backend doesn't have a logout endpoint, so we just clear tokens
  clearTokens();
  return { success: true, data: { message: 'Logged out' } };
}

/**
 * Get the current user's profile.
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  return api.get<User>(API_ENDPOINTS.auth.profile);
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  data: UserProfileUpdate
): Promise<ApiResponse<User>> {
  // FastAPI backend uses PUT for profile updates
  return api.put<User>(API_ENDPOINTS.auth.profile, data);
}

/**
 * Change the current user's password.
 * (Not currently supported by demo FastAPI backend)
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<ApiResponse<{ message: string }>> {
  return { success: false, error: 'Endpoint not supported' };
}

/**
 * Check if there's a valid session.
 */
export function hasValidSession(): boolean {
  return getStoredTokens() !== null;
}
