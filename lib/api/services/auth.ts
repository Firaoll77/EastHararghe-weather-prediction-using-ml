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
      refresh: response.data.refresh,
    });
  }
  
  return response;
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  const tokens = getStoredTokens();
  
  if (tokens?.refresh) {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.auth.logout,
      { refresh: tokens.refresh }
    );
    
    clearTokens();
    return response;
  }
  
  clearTokens();
  return { success: true, data: { message: 'Logged out' } };
}

/**
 * Get the current user's profile.
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  return api.get<User>(API_ENDPOINTS.user.profile);
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  data: UserProfileUpdate
): Promise<ApiResponse<User>> {
  return api.patch<User>(API_ENDPOINTS.user.profile, data);
}

/**
 * Change the current user's password.
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<ApiResponse<{ message: string }>> {
  return api.post<{ message: string }>(API_ENDPOINTS.user.changePassword, data);
}

/**
 * Check if there's a valid session.
 */
export function hasValidSession(): boolean {
  return getStoredTokens() !== null;
}
